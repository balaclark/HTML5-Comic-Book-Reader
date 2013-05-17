/*jslint browser: true, on: true, eqeqeq: true, newcap: true, immed: true */

/*
	TODOs:

	Fo sho:
		- trigger preload if requesting valid but not loaded images (can happen if network was interupted)
		- loading and generally hackiness of pointer is buggy, fix.
		- check for html5 feature support where used: diveintohtml5.org/everything.html or www.modernizr.com
		- when applying enhancements reading position gets lost
		- full browser test - IE9 / FF3.6+ / Chrome / Safari / Opera
		- don't inlcude the closure compiler, expect it (or similar) to be installed instead

	Nice 2 have:
		- lint
		- jump to page?
		- make page draggable with the cursor
		- enable menu items via config, allow for custom items
		- split out classes into seperate files
		- offline access
		- thumbnail browser
		- chrome frame / ExplorerCanvas / non canvas version?
		- really need to speed up enhancements, try to use webworkers
		- refactor so we are not using all these loose shared variables and other nastyness
		- use custom event emitters instead of hacky code
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
var ComicBookException = {
	INVALID_PAGE: "invalid page",
	INVALID_PAGE_TYPE: "invalid page type",
	UNDEFINED_CONTROL: "undefined control",
	INVALID_ZOOM_MODE: "invalid zoom mode",
	INVALID_NAVIGATION_EVENT: "invalid navigation event"
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
		},
		forward_buffer: 3
	};

	var options = merge(defaults, opts); // options array for internal use

	var no_pages = srcs.length;
	var pages = [];		// array of preloaded Image objects
	var canvas;			// the HTML5 canvas object
	var context;		// the 2d drawing context
	var loaded = [];	// the images that have been loaded so far
	var scale = 1;		// page zoom scale, 1 = 100%
	var is_double_page_spread = false;
	var controlsRendered = false; // have the user controls been inserted into the dom yet?
	var page_requested = false; // used to request non preloaded pages
	var shiv = false;

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
		var hash = parseInt(location.hash.substring(1),10) - 1 || 0;
		if (hash < 0) {
			setHash(0);
			hash = 0;
		}
		return hash;
	}

	function setHash(pageNo) {
		location.hash = pageNo;
	}

	// page hash on first load
	var hash = getHash();

	// the current page, can pass a default as a url hash
	var pointer = (hash < srcs.length) ? hash : 0;

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
		canvas.addEventListener("click", ComicBook.prototype.navigation, false);
		window.addEventListener("keydown", ComicBook.prototype.navigation, false);
		$(window).bind('hashchange', checkHash);
	}

	/**
	 * User controls
	 *
	 * TODO: save current values
	 */
	ComicBook.prototype.control = {

		status: $(document.createElement("div"))
			.attr("id", "cb-status")
			.addClass("cb-control cb-always-on")
			.append(
				$(document.createElement("div"))
					.attr("id", "cb-progress-bar")
					.progressbar()
			),

		toolbar: $(document.createElement("div"))
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
			)
			.append(
				$(document.createElement("button"))
					.attr("title", "fit to page width/height")
					.addClass("cb-fit-best")
					.click(function(){
						options.zoomMode = "fitBest"
						ComicBook.prototype.drawPage();
					})
			)
			.append(
				$(document.createElement("button"))
					.attr("title", ((options.manga == true) ? "change reading direction to 'left-to-right'" : "change reading direction to 'right-to-left'"))
					.addClass("cb-read-direction")
					.click(function(){
						options.manga = !options.manga;
						ComicBook.prototype.drawPage();
					})
					.attr("id", ((options.manga == true) ? "toright" : "toleft"))
			)
			.append(
				$(document.createElement("p"))
					.attr("id", "cb-comic-info")
					.append("<span id='cb-current-page'></span> / " + srcs.length)
			),

		/**
		 * Image enhancements
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
					change: function(event, ui) {
						ComicBook.prototype.enhance.brightness({ brightness: ui.value });
					}
				})
			)
			.append("<label for='cb-sharpen'>Contrast</label>")
			.append(
				$("<div id='cb-contrast' class='cb-option'></div>").slider({
					value: 0,
					step: 0.001,
					min: 0,
					max: 1,
					change: function(event, ui) {
						ComicBook.prototype.enhance.brightness({ contrast: ui.value });
					}
				})
			)
			.append("<label for='cb-sharpen'>Sharpen</label>")
			.append(
				$("<div id='cb-sharpen' class='cb-option'></div>").slider({
					value: 0,
					step: 0.001,
					min: 0,
					max: 1,
					change: function(event, ui) {
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
					if(options.manga == false)
					{
						ComicBook.prototype.drawPrevPage();
					}
					else
					{
						ComicBook.prototype.drawNextPage();
					}
				}),

			right: $(document.createElement("div"))
				.addClass("cb-control cb-navigate cb-always-on right")
				.click(function(e) {
					if(options.manga == false)
					{
						ComicBook.prototype.drawNextPage();
					}
					else
					{
						ComicBook.prototype.drawPrevPage();
					}
				})
		},

		loadingOverlay: $(document.createElement("div"))
			.attr("id", "cb-loading-overlay")
			.addClass("cb-control")
	};
		/*Using left arrow key*/
				$(document).keydown(function(e) {
					if (e.keyCode == 37) {
						ComicBook.prototype.drawPrevPage();
					}
				});

		/*Using right arrow key*/
				$(document).keydown(function(e) {
					if (e.keyCode == 39) {
						ComicBook.prototype.drawNextPage();
					}
				});
	ComicBook.prototype.renderControls = function() {

		$(canvas)
			.before(this.getControl("loadingOverlay"))
			.before(this.getControl("status"))
			.after(this.getControl("toolbar").hide())
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
			throw ComicBookException.UNDEFINED_CONTROL+' '+control;
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

		if (i < 0 || i > srcs.length-1) {
			throw ComicBookException.INVALID_PAGE+' '+i;
		}

		if (typeof pages[i] === "object") {
			return pages[i];
		} else {
			page_requested = i;
			this.showControl("loadingOverlay");
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

		var i = pointer; // the current page counter for this method
		var rendered = false;
		var queue = [];

		this.showControl("loadingOverlay");

		function loadImage(i) {

			var page = new Image();
			page.src = srcs[i];

			page.onload = function () {

				pages[i] = this;
				loaded.push(i);

				$("#cb-progress-bar").progressbar("value", Math.floor((loaded.length / no_pages) * 100));

				// double page mode needs an extra page added
				var buffer = (options.displayMode === "double" && pointer < srcs.length-1) ? 1 : 0;

				// start rendering the comic when the requested page is ready
				if ((rendered === false && ($.inArray(pointer + buffer, loaded) !== -1)
					||
					(typeof page_requested === "number" && $.inArray(page_requested, loaded) !== -1))
				) {
					// if the user is waiting for a page to be loaded, render that one instead of the default pointer
					if (typeof page_requested === "number") {
						pointer = page_requested-1;
						page_requested = false;
					}

					ComicBook.prototype.drawPage();
					ComicBook.prototype.hideControl("loadingOverlay");
					rendered = true;
				}

				if (queue.length) {
					loadImage(queue[0]);
					queue.splice(0,1);
				} else {
					$("#cb-status").delay(500).fadeOut();
				}
			};
		}
		
		// loads pages in both directions so you don't have to wait for all pages
		// to be loaded before you can scroll backwards
		function preload(start, stop) {
			var j = 0;
			var count = 1;
			var forward = start;
			var backward = start-1;

			while (forward <= stop) {

				if (count > options.forward_buffer && backward > -1) {
					queue.push(backward);
					backward--;
					count = 0;
				} else {
					queue.push(forward);
					forward++;
				}
				count++;
			}

			while (backward > -1) {
				queue.push(backward);
				backward--;
			}

			loadImage(queue[j]);
		}

		preload(i, srcs.length-1);
	};

	ComicBook.prototype.pageLoaded = function (page_no) {
		return (typeof loaded[page_no-1] !== "undefined");
	};

	/**
	 * Draw the current page in the canvas
	 */
	ComicBook.prototype.drawPage = function(page_no) {

		// if a specific page is given try to render it, if not bail and wait for preload() to render it
		if (typeof page_no === "number" && page_no < srcs.length && page_no > 0) {
			pointer = page_no-1;
			if (!this.pageLoaded(page_no)) {
				this.showControl("loadingOverlay");
				return;
			}
		}

		if (pointer < 0) { pointer = 0; }

		var zoom_scale;
		var offsetW = 0, offsetH = 0;

		var page = ComicBook.prototype.getPage(pointer);
		var page2 = false;

		if (options.displayMode === "double" && pointer < srcs.length-1) {
			page2 = ComicBook.prototype.getPage(pointer + 1);
		}

		if (typeof page !== "object") {
			throw ComicBookException.INVALID_PAGE_TYPE+' '+typeof page;
		}

		var width = page.width;
		var height = page.height;

		// reset the canvas to stop duplicate pages showing
		canvas.width = 0;
		canvas.height = 0;

		// show double page spreads on a single page
		is_double_page_spread = (
			typeof page2 === "object"
			&& (page.width > page.height || page2.width > page2.height)
			&& options.displayMode === "double"
		);
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

            case "fitBest":
                document.body.style.overflowX = "hidden";

				var width_scale = (windowWidth() > width)
					? ((windowWidth() - width) / windowWidth()) + 1 // scale up if the window is wider than the page
					: windowWidth() / width; // scale down if the window is narrower than the page
                var windowHeight = window.innerHeight;
				var height_scale = (windowHeight > height)
					? ((windowHeight - height) / windowHeight) + 1 // scale up if the window is wider than the page
					: windowHeight / height; // scale down if the window is narrower than the page

                zoom_scale = (width_scale > height_scale)? height_scale : width_scale;
				scale = zoom_scale;
                break;

			default:
				throw ComicBookException.INVALID_ZOOM_MODE+' '+options.zoomMode;
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
		if (options.manga && options.displayMode === "double" && typeof page2 === "object") {
			var tmpPage = page;
			var tmpPage2 = page2;
			page = tmpPage2;
			page2 = tmpPage;
		}

		// draw the page(s)
		context.drawImage(page, offsetW, offsetH, page_width, page_height);
		if (options.displayMode === "double" && typeof page2 === "object") {
			context.drawImage(page2, page_width + offsetW, offsetH, page_width, page_height);
		}

		// apply any image enhancements previously defined
		$.each(options.enhance, function(action, options) {
			ComicBook.prototype.enhance[action](options);
		});

		var current_page = (options.displayMode === "double" && pointer+2 <= srcs.length)
			? (pointer+1) + "-" + (pointer+2) : pointer+1
		$("#cb-current-page").text(current_page);

		// revert page mode back to double if it was auto switched for a double page spread
		if (is_double_page_spread) { options.displayMode = "double"; }

		// disable the fit width button if needed
		$("button.cb-fit-width").attr("disabled", (options.zoomMode === "fitWidth"));
		$("button.cb-fit-best").attr("disabled", (options.zoomMode === "fitBest"));
		
		//Change the icon on the read direction
		if(options.manga == true)
		{
			$("button.cb-read-direction").attr("id", "toright");
		}
		else
		{
			$("button.cb-read-direction").attr("id", "toleft");
		}

		// disable prev/next buttons if not needed
		$(".cb-navigate").show();
		if ((pointer === 0) && (options.manga == false)) {
			$(".cb-navigate.left").hide();
			$(".cb-navigate.right").show();
		}
		else if ((pointer === 0) && (options.manga == true))
		{
			$(".cb-navigate.left").show();
			$(".cb-navigate.right").hide();
		}

		if ((pointer === srcs.length-1 || (typeof page2 === "object" && pointer === srcs.length-2)) && (options.manga == false)) {
			$(".cb-navigate.left").show();
			$(".cb-navigate.right").hide();
		}
		else if ((pointer === srcs.length-1 || (typeof page2 === "object" && pointer === srcs.length-2)) && (options.manga == true))
		{
			$(".cb-navigate.left").hide();
			$(".cb-navigate.right").show();
		}

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

		var page;

		try {
			page = this.getPage(pointer+1);
		} catch (e) {}

		if (!page) { return false; }

		if (pointer + 1 < pages.length) {
			pointer += (options.displayMode === "single" || is_double_page_spread) ? 1 : 2;
			try {
				this.drawPage();
			} catch (e) {}
		}
	};

	/**
	 * Decrement the counter and draw the page in the canvas
	 *
	 * @see #drawPage
	 */
	ComicBook.prototype.drawPrevPage = function () {

		var page;

		try {
			page = this.getPage(pointer-1);
		} catch (e) {}

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
				throw ComicBookException.INVALID_NAVIGATION_EVENT+' '+e.type;
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
