/*jslint browser: true, on: true, eqeqeq: true, newcap: true, immed: true */

/*
	TODOs:

	Fo sho:
		- make control images sprites
		- disable the strech button if in an auto zoom mode
		- current page indicator
		- jump to page?
		- improve prev/next buttons, only show them when they can possibly work (not at beginning/end)
		- check for html5 feature support where used: diveintohtml5.org/everything.html or www.modernizr.com
		- write bin scripts to minify & join all js

	Nice 2 have:
		- enable menu items via config, allow for custom items
		- decouple controls from reader api
		- split out classes into seperate files
		- offline access
		- thumbnail browser
		- remove jquery dependency in favour of straight js
		- chrome frame / ExplorerCanvas / non canvas version?
		- really need to speed up enhancements, try to use webworkers
*/

/**
 * Merge two arrays. Any properties in b will replace the same properties in
 * a. New properties from b will be added to a.
 *
 * @param a {Object}
 * @param b {Object}
 */
function merge(a, b) {

	var prop;

	if (typeof b === "undefined") { b = {}; }

	for (prop in a) {
		if (a.hasOwnProperty(prop)) {
			if (prop in b) { continue; }
			b[prop] = a[prop];
		}
	}

	return b;
}

/**
 * Exception class. Always throw an instance of this when throwing exceptions.
 *
 * @param {String} type
 * @param {Object} object
 * @returns {ComicBookException}
 */
function ComicBookException(type, object) {

	this.type = type;
	this.object = object;

	this.INVALID_PAGE = "invalid page";
	this.INVALID_PAGE_TYPE = "invalid page type";
	this.UNDEFINED_CONTROL = "undefined control";
	this.INVALID_ZOOM_MODE = "invalid zoom mode";
	this.INVALID_NAVIGATION_EVENT = "invalid navigation event";
};

function ComicBook(id, srcs, opts) {

	var canvas_id = id;		// canvas element id
	this.srcs = srcs;	// array of image srcs for pages

	var defaults = {
		displayMode: "double",	// single / double
		zoomMode: "fitWidth",	// manual / fitWidth
		manga: false,			// true / false
		enhance: {},
		keyboard: {
			next: 78,
			previous: 80,
			toolbar: 84,
			toggleLayout: 76
		}
	};

	var options = merge(defaults, opts); // options array for internal use

	var no_pages = srcs.length;
	var pages = [];		// array of preloaded Image objects
	var canvas;			// the HTML5 canvas object
	var context;		// the 2d drawing context
	var buffer = 1;		// image preload buffer level
	var loaded = [];	// the images that have been loaded so far
	var scale = 1;		// page zoom scale, 1 = 100%
	var is_double_page_spread = false;
	var controlsRendered = false; // have the user controls been inserted into the dom yet?
	var page_requested = false; // used to request non preloaded pages
	var shiv = false;

	// the current page, can pass a default as a url hash
	var pointer = (parseInt(location.hash.substring(1),10) - 1) || 0;

	/**
	 * Gets the window.innerWidth - scrollbars
	 */
	function windowWidth() {
	
		var height = window.innerHeight + 1;
	
		if (shiv === false) {
			shiv = $(document.createElement("div"))
				.attr("id", "cb-width-shiv")
				.css({
					width: "100%",
					position: "absolute", 
					top: 0,
					zIndex: "-1000"
				});
		
			$("body").append(shiv);
		}
		
		shiv.height(height);
		
		return shiv.innerWidth();
	}

	/**
	 * enables the back button
	 */
	function checkHash() {

		var hash = getHash();

		if (hash !== pointer && loaded.indexOf(hash) > -1) {
			pointer = hash;
			ComicBook.prototype.draw();
		}
	}

	function getHash() {
		return parseInt(location.hash.substring(1),10) - 1 || 0;
	}

	function setHash(pageNo) {
		location.hash = pageNo;
	}

	/**
	 * Setup the canvas element for use throughout the class.
	 *
	 * @see #ComicBook.prototype.draw
	 * @see #ComicBook.prototype.enhance
	 */
	function init() {
		// setup canvas
		canvas = document.getElementById(canvas_id);
		context = canvas.getContext("2d");

		// render user controls
		if (controlsRendered === false) {
			ComicBook.prototype.renderControls();
			controlsRendered = true;
		}

		// add page controls
		// TODO: add IE event listeners too.
		canvas.addEventListener("click", ComicBook.prototype.navigation, false);
		window.addEventListener("keydown", ComicBook.prototype.navigation, false);
		window.addEventListener("hashchange", checkHash, false);
		//setInterval(function() { checkHash(); }, 300); // TODO: enable this when there is no onhashchange event
	}

	/**
	 * User controls
	 *
	 * TODO: add reset links,
	 * TODO: style
	 * TODO: don't allow draggable controls to leave the visible window
	 * TODO: remember draggable position
	 * TODO: show/hide controls
	 * TODO: save current values
	 */
	ComicBook.prototype.control = {

		status: $(document.createElement("p"))
			.attr("id", "cb-status")
			.addClass("cb-control cb-always-on"),

		toolbar: $(document.createElement("div"))
			.hide()
			.attr("id", "cb-toolbar")
			.addClass("cb-control")
			.append(
				$(document.createElement("button"))
					.attr("title", "close the toolbar")
					.addClass("cb-close")
					.click(function(){
						ComicBook.prototype.toggleToolbar();
					})
			)
			.append(
				$(document.createElement("button"))
					.attr("title", "switch between dual and single page modes")
					.addClass("cb-layout " + options.displayMode)
					.click(function(){
						ComicBook.prototype.toggleLayout();
					})
			)
			.append(
				$(document.createElement("button"))
					.attr("title", "tweak the page colors")
					.addClass("cb-color cb-menu-button")
					.click(function(){
						ComicBook.prototype.toggleControl("color");
					})
			)
			.append(
				$(document.createElement("button"))
					.attr("title", "zoom out")
					.addClass("cb-zoom-out")
					.click(function(){
						ComicBook.prototype.zoom(scale - 0.1);
					})
			)
			.append(
				$(document.createElement("button"))
					.attr("title", "zoom in")
					.addClass("cb-zoom-in")
					.click(function(){
						ComicBook.prototype.zoom(scale + 0.1);
					})
			)
			.append(
				$(document.createElement("button"))
					.attr("title", "fit to page width")
					.addClass("cb-fit-width")
					.click(function(){
						options.zoomMode = "fitWidth"
						ComicBook.prototype.drawPage();
					})
			),

		/**
		 * Image enhancements
		 * TODO: split out brightness / contrast controls?
		 */
		color: $(document.createElement("div"))
			.attr("id", "cb-color")
			.addClass("cb-control")
			.append("<label for='cb-sharpen'>Brightness</label>")
			.append(
				$("<div id='cb-brightness' class='cb-option'></div>").slider({
					value: 0,
					step: 10,
					min: -1000,
					max: 1000,
					slide: function(event, ui) {
						ComicBook.prototype.enhance.brightness({ brightness: ui.value });
					}
				})
			)
			.append("<label for='cb-sharpen'>Contrast</label>")
			.append(
				$("<div id='cb-contrast' class='cb-option'></div>").slider({
					value: 0,
					step: 0.1,
					min: 0,
					max: 1,
					slide: function(event, ui) {
						ComicBook.prototype.enhance.brightness({ contrast: ui.value });
					}
				})
			)
			.append("<label for='cb-sharpen'>Sharpen</label>")
			.append(
				$("<div id='cb-sharpen' class='cb-option'></div>").slider({
					value: 0,
					step: 0.1,
					min: 0,
					max: 1,
					slide: function(event, ui) {
						ComicBook.prototype.enhance.sharpen({ amount: ui.value });
					}
				})
			)
			.append(
				$(document.createElement("div")).addClass("cb-option")
					.append("<input type='checkbox' id='cb-desaturate' /> <label for='cb-desaturate'>Desaturate</label>")
					.append("<button id='cb-reset'>reset</button>")
			),

		/**
		 * Page navigation
		 */
		navigation: {

			left: $(document.createElement("div"))
				.addClass("cb-control cb-navigate cb-always-on left")
				.click(function(e){
					ComicBook.prototype.drawPrevPage();
				}),

			right: $(document.createElement("div"))
				.addClass("cb-control cb-navigate cb-always-on right")
				.click(function(e) {
					ComicBook.prototype.drawNextPage();
				})
		},
		
		loadingIndicator: $(document.createElement("div"))
			.attr("id", "cb-loading-overlay")
			.addClass("cb-control")
	};

	/**
	 * TODO: center, make sure they never leave the visible portion of the screen
	 */
	ComicBook.prototype.renderControls = function() {
		
		$(canvas)
			.before(this.getControl("loadingIndicator"))
			.before(this.getControl("status"))
			.after(this.getControl("toolbar"))
			.after(this.getControl("navigation").left)
			.after(this.getControl("navigation").right)
			.after(this.getControl("color").hide());
		
		$(".cb-menu-button").click(function(e) {
			$(this).toggleClass("active");
		});
		
		$("#cb-desaturate").click(function(){
			if ($(this).is(":checked")) {
				ComicBook.prototype.enhance.desaturate();
			} else {
				ComicBook.prototype.enhance.resaturate();
			}
		});

		$("#cb-reset").click(function() {
			// TODO: improve performance here.
			$("#cb-brightness").slider("value", 0);
			$("#cb-contrast").slider("value", 0);
			$("#cb-saturation").slider("value", 0);
			$("#cb-sharpen").slider("value", 0);
			var desaturate = $("#cb-desaturate");
			desaturate.attr("checked", false);
			ComicBook.prototype.enhance.reset();
		});
	};

	ComicBook.prototype.getControl = function(control) {

		if (typeof this.control[control] === "undefined") {
			throw new ComicBookException(ComicBookException.UNDEFINED_CONTROL, control);
		}

		return this.control[control];
	};

	ComicBook.prototype.showControl = function(control) {
		this.getControl(control).show().addClass("open");
	};

	ComicBook.prototype.hideControl = function(control) {
		this.getControl(control).removeClass("open").hide();
	};

	ComicBook.prototype.toggleControl = function(control) {
		this.getControl(control).toggle().toggleClass("open");
	};

	ComicBook.prototype.toggleToolbar = function() {
		if ($("#cb-toolbar").is(":visible")) {
			$(".cb-control").not(".cb-always-on").hide();
		} else {
			$("#cb-toolbar, .cb-control.open").show();
		}
	};

	ComicBook.prototype.toggleLayout = function() {
		if (options.displayMode === "double") {
			$("#cb-toolbar .cb-layout").removeClass("double");
			options.displayMode = "single";
		} else {
			$("#cb-toolbar .cb-layout").removeClass("single");
			options.displayMode = "double";
		}
		$("#cb-toolbar .cb-layout").addClass(options.displayMode);
		ComicBook.prototype.drawPage();
	};

	/**
	 * Get the image for a given page.
	 *
	 * @return Image
	 */
	ComicBook.prototype.getPage = function(i) {
		
		if (i < 0 || i > srcs.length) {
			throw new ComicBookException(ComicBookException.INVALID_PAGE, i);
		}
		
		if (typeof pages[i] === "object") {
			return pages[i];
		} else {
			page_requested = i;
			this.showControl("loadingIndicator");
		}
	};

	/**
	 * @see #preload
	 */
	ComicBook.prototype.draw = function () {

		init();

		// resize navigation controls
		$(".cb-control.cb-navigate").outerHeight(window.innerHeight);
		$("#cb-toolbar").outerWidth(windowWidth());
		$("#cb-loading-overlay").outerWidth(windowWidth()).height(window.innerHeight);
		
		// preload images if needed
		if (pages.length !== no_pages) {
			this.preload();
		} else {
			this.drawPage();
		}
	};

	/**
	 * Zoom the canvas
	 *
	 * @param new_scale {Number} Scale the canvas to this ratio
	 */
	ComicBook.prototype.zoom = function (new_scale) {
		options.zoomMode = "manual";
		scale = new_scale;
		if (typeof this.getPage(pointer) === "object") { this.drawPage(); }
	};

	/**
	 * Preload all images, draw the page only after a given number have been loaded.
	 *
	 * @see #drawPage
	 */
	ComicBook.prototype.preload = function () {
		
		this.showControl("loadingIndicator");

		//var srcs = this.srcs;

		if (no_pages < buffer) { buffer = no_pages; } // don't get stuck if the buffer level is higher than the number of pages

		var i = pointer; // the current page counter for this method
		//if (i - buffer >= 0) { i = i - buffer; } // start loading from the first requested page - buffer

		// I am using recursion instead of a forEach loop so that the next image is
		// only loaded when the previous one has completely finished
		function preload(i) {

			var page = new Image();
			var padding;

			$("#cb-status").text("loading page " + (i + 1) + " of " + no_pages);

			page.src = srcs[i];

			page.onload = function () {

				pages[i] = this;
				loaded.push(i);

				// start to load from the beginning if loading started midway
				if (i === no_pages-1 && loaded.length !== no_pages) {
					i = -1;
				}

				// there are still more pages to load, do it
				if (loaded.length < no_pages) {
					i++;
					preload(i);
				}

				//console.log(loaded[loaded.length-1]);

				// double page mode needs an extra page added to the buffer
				padding = (options.displayMode === "double") ? 1 : 0;
			
				// start rendering the comic when the buffer level has been reached (FIXME: buggy, fails if trying to load the last couple of pages)
				if (loaded[loaded.length-1] === pointer + buffer + padding || loaded[loaded.length-1] === page_requested) {
					
					// if the user is waiting for a page to be loaded, render that one instead of the default pointer
					if (typeof page_requested === "number") {
						pointer = page_requested-1;
						page_requested = false;
					}
					
					ComicBook.prototype.drawPage();
					ComicBook.prototype.hideControl("loadingIndicator");
				}
				if (loaded.length === no_pages) { ComicBook.prototype.hideControl("status") }
			};
		}

		// manually trigger the first load
		preload(i);
	};
	
	ComicBook.prototype.pageLoaded = function (page_no) {
		return (typeof loaded[page_no-1] !== "undefined");
	};

	/**
	 * Draw the current page in the canvas
	 */
	ComicBook.prototype.drawPage = function(page_no) {
		
		// if a specific page is given try to render it, if not bail and wait for preload() to render it
		if (typeof page_no === "number" && page_no < srcs.length) { 
			pointer = page_no-1;
			if (!this.pageLoaded(page_no)) {
				this.showControl("loadingIndicator");
				return;
			}
		}

		var zoom_scale;
		var offsetW = 0, offsetH = 0;

		var page = ComicBook.prototype.getPage(pointer);
		var page2 = ComicBook.prototype.getPage(pointer + 1);

		if (typeof page !== "object") {
			throw new ComicBookException(ComicBookException.INVALID_PAGE_TYPE, typeof page);
		}

		var width = page.width;

		// reset the canvas to stop duplicate pages showing
		canvas.width = 0;
		canvas.height = 0;
		
		// show double page spreads on a single page
		is_double_page_spread = ((page.width > page.height || page2.width > page2.height) && options.displayMode === "double");
		if (is_double_page_spread) { options.displayMode = "single"; }

		if (options.displayMode === "double") {

			// for double page spreads, factor in the width of both pages
			if (typeof page2 === "object") { width += page2.width; }

			// if this is the last page and there is no page2, still keep the canvas wide
			else { width += width; }
		}

		// update the page scale if a non manual mode has been chosen
		switch(options.zoomMode) {

			case "manual":
				document.body.style.overflowX = "auto";
				zoom_scale = (options.displayMode === "double") ? scale * 2 : scale;
				break;

			case "fitWidth":
				document.body.style.overflowX = "hidden";
				
				zoom_scale = (windowWidth() > width)
					? ((windowWidth() - width) / windowWidth()) + 1 // scale up if the window is wider than the page
					: windowWidth() / width; // scale down if the window is narrower than the page

				// update the interal scale var so switching zoomModes while zooming will be smooth
				scale = zoom_scale
				break;

			default:
				throw new ComicBookException(ComicBookException.INVALID_ZOOM_MODE, options.zoomMode);
		}

		var canvas_width  = page.width * zoom_scale;
		var canvas_height = page.height * zoom_scale;

		var page_width = (options.zoomMode === "manual") ? page.width * scale : canvas_width;
		var page_height = (options.zoomMode === "manual") ? page.height * scale : canvas_height;

		canvas_height = page_height;

		// make sure the canvas is always at least full screen, even if the page is more narrow than the screen
		canvas.width = (canvas_width < windowWidth()) ? windowWidth() : canvas_width;
		canvas.height = (canvas_height < window.innerHeight) ? window.innerHeight : canvas_height;

		// work out a horizontal position that will keep the pages always centred
		if (canvas_width < windowWidth() && options.zoomMode === "manual") {
			offsetW = (windowWidth() - page_width) / 2;
			if (options.displayMode === "double") { offsetW = offsetW - page_width / 2; }
		}

		// work out a vertical position that will keep the pages always centred
		if (canvas_height < window.innerHeight && options.zoomMode === "manual") {
			offsetH = (window.innerHeight - page_height) / 2;
		}

		// in manga double page mode reverse the page(s)
		if (options.manga && options.displayMode === "double") {
			var tmpPage = page;
			var tmpPage2 = page2; // FIXME: check this exists before using
			page = tmpPage2;
			page2 = tmpPage;
		}

		// draw the page(s)
		context.drawImage(page, offsetW, offsetH, page_width, page_height);
		if (options.displayMode === "double" && typeof page2 === "object") { context.drawImage(page2, page_width + offsetW, offsetH, page_width, page_height); }

		// apply any image enhancements previously defined
		$.each(options.enhance, function(action, options) {
			ComicBook.prototype.enhance[action](options);
		});

		// revert page mode back to double if it was auto switched for a double page spread
		if (is_double_page_spread) { options.displayMode = "double"; }

		// user callback
		if (typeof options.afterDrawPage === "function") {
			options.afterDrawPage(pointer + 1);
		}

		// update hash location
		if (getHash() !== pointer) {
			setHash(pointer + 1);
		}
		
		// make sure the top of the page is in view
		window.scroll(0, 0);
	};

	/**
	 * Increment the counter and draw the page in the canvas
	 *
	 * @see #drawPage
	 */
	ComicBook.prototype.drawNextPage = function () {
		
		if (!this.getPage(pointer+1)) { return false; }
		
		if (pointer + 1 < pages.length) {
			pointer += (options.displayMode === "single" || is_double_page_spread) ? 1 : 2;
			this.drawPage();
		}
	};

	/**
	 * Decrement the counter and draw the page in the canvas
	 *
	 * @see #drawPage
	 */
	ComicBook.prototype.drawPrevPage = function () {
		
		var page = this.getPage(pointer-1);		
		if (!page) { return false; }
		
		is_double_page_spread = (page.width > page.height); // need to run double page check again here as we are going backwards

		if (pointer > 0) {
			pointer -= (options.displayMode === "single" || is_double_page_spread) ? 1 : 2;
			this.drawPage();
		}
	};

	/**
	 * Apply image enhancements to the canvas.
	 *
	 * Powered by the awesome Pixastic: http://www.pixastic.com/
	 *
	 * TODO: reset & apply all image enhancements each time before applying new one
	 * TODO: abstract this into an "Enhance" object, separate from ComicBook?
	 */
	ComicBook.prototype.enhance = {

		/**
		 * Reset enhancements.
		 * This can reset a specific enhancement if the method name is passed, or
		 * it will reset all.
		 *
		 * @param method {string} the specific enhancement to reset
		 */
		reset: function (method) {
			if (!method) {
				options.enhance = {};
			} else {
				delete options.enhance[method];
			}
			ComicBook.prototype.drawPage();
		},

		/**
		 * Adjust brightness / contrast
		 *
		 * params
		 *    brightness (int) -150 to 150
		 *    contrast: (float) -1 to infinity
		 *
		 * @param {Object} params Brightness & contrast levels
		 * @param {Boolean} reset Reset before applying more enhancements?
		 */
		brightness: function (params, reset) {

			if (reset !== false) { this.reset("brightness"); }

			// merge user options with defaults
			var opts = merge({ brightness: 0, contrast: 0 }, params);

			// remember options for later
			options.enhance.brightness = opts;

			// run the enhancement
			Pixastic.process(canvas, "brightness", {
				brightness: opts.brightness,
				contrast: opts.contrast,
				legacy: true
			});

			init();
		},

		/**
		 * Force black and white
		 */
		desaturate: function () {

			options.enhance.desaturate = {};

			Pixastic.process(canvas, "desaturate", { average : false });

			init();
		},

		/**
		 * Undo desaturate
		 */
		resaturate: function() {
			delete options.enhance.desaturate;
			ComicBook.prototype.drawPage();
		},

		/**
		 * Sharpen
		 *
		 * options:
		 *   amount: number (-1 to infinity)
		 *
		 * @param {Object} options
		 */
		sharpen: function (params) {

			this.desharpen();

			var opts = merge({ amount: 0 }, params);

			options.enhance.sharpen = opts;

			Pixastic.process(canvas, "sharpen", {
				amount: opts.amount
			});

			init();
		},

		desharpen: function() {
			delete options.enhance.sharpen;
			ComicBook.prototype.drawPage();
		}
	};

	ComicBook.prototype.navigation = function (e) {

		// disable navigation when the overlay is showing
		if ($("#cb-loading-overlay").is(":visible")) { return false; }

		var side = false;

		switch (e.type) {
			case "click":
				ComicBook.prototype.toggleToolbar();
				break;
			case "keydown":
			
				// navigation
				if (e.keyCode === options.keyboard.previous) { side = "left"; }
				if (e.keyCode === options.keyboard.next) { side = "right"; }

				// display controls
				if (e.keyCode === options.keyboard.toolbar) {
					ComicBook.prototype.toggleToolbar();
				}
				if (e.keyCode === options.keyboard.toggleLayout) {
					ComicBook.prototype.toggleLayout();
				}
				break;
			default:
				throw new ComicBookException(
					ComicBookException.INVALID_NAVIGATION_EVENT, e.type
				);
		}

		if (side) {

			e.stopPropagation();

			// western style (left to right)
			if (!options.manga) {
				if (side === "left") { ComicBook.prototype.drawPrevPage(); }
				if (side === "right") { ComicBook.prototype.drawNextPage(); }
			}
			// manga style (right to left)
			else {
				if (side === "left") { ComicBook.prototype.drawNextPage(); }
				if (side === "right") { ComicBook.prototype.drawPrevPage(); }
			}

			return false;
		}
	};
	
}
