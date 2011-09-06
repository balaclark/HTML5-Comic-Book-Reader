/*
 * Pixastic Lib - Core Functions - v0.1.3
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 */

var Pixastic = (function() {


	function addEvent(el, event, handler) {
		if (el.addEventListener)
			el.addEventListener(event, handler, false); 
		else if (el.attachEvent)
			el.attachEvent("on" + event, handler); 
	}

	function onready(handler) {
		var handlerDone = false;
		var execHandler = function() {
			if (!handlerDone) {
				handlerDone = true;
				handler();
			}
		}
		document.write("<"+"script defer src=\"//:\" id=\"__onload_ie_pixastic__\"></"+"script>");
		var script = document.getElementById("__onload_ie_pixastic__");
		script.onreadystatechange = function() {
			if (script.readyState == "complete") {
				script.parentNode.removeChild(script);
				execHandler();
			}
		}
		if (document.addEventListener)
			document.addEventListener("DOMContentLoaded", execHandler, false); 
		addEvent(window, "load", execHandler);
	}

	function init() {
		var imgEls = getElementsByClass("pixastic", null, "img");
		var canvasEls = getElementsByClass("pixastic", null, "canvas");
		var elements = imgEls.concat(canvasEls);
		for (var i=0;i<elements.length;i++) {
			(function() {

			var el = elements[i];
			var actions = [];
			var classes = el.className.split(" ");
			for (var c=0;c<classes.length;c++) {
				var cls = classes[c];
				if (cls.substring(0,9) == "pixastic-") {
					var actionName = cls.substring(9);
					if (actionName != "")
						actions.push(actionName);
				}
			}
			if (actions.length) {
				if (el.tagName.toLowerCase() == "img") {
					var dataImg = new Image();
					dataImg.src = el.src;
					if (dataImg.complete) {
						for (var a=0;a<actions.length;a++) {
							var res = Pixastic.applyAction(el, el, actions[a], null);
							if (res) 
								el = res;
						}
					} else {
						dataImg.onload = function() {
							for (var a=0;a<actions.length;a++) {
								var res = Pixastic.applyAction(el, el, actions[a], null)
								if (res) 
									el = res;
							}
						}
					}
				} else {
					setTimeout(function() {
						for (var a=0;a<actions.length;a++) {
							var res = Pixastic.applyAction(
								el, el, actions[a], null
							);
							if (res) 
								el = res;
						}
					},1);
				}
			}

			})();
		}
	}

	if (typeof pixastic_parseonload != "undefined" && pixastic_parseonload)
		onready(init);

	// getElementsByClass by Dustin Diaz, http://www.dustindiaz.com/getelementsbyclass/
	function getElementsByClass(searchClass,node,tag) {
	        var classElements = new Array();
	        if ( node == null )
	                node = document;
	        if ( tag == null )
	                tag = '*';

	        var els = node.getElementsByTagName(tag);
	        var elsLen = els.length;
	        var pattern = new RegExp("(^|\\s)"+searchClass+"(\\s|$)");
	        for (i = 0, j = 0; i < elsLen; i++) {
	                if ( pattern.test(els[i].className) ) {
	                        classElements[j] = els[i];
	                        j++;
	                }
	        }
	        return classElements;
	}

	var debugElement;

	function writeDebug(text, level) {
		if (!Pixastic.debug) return;
		try {
			switch (level) {
				case "warn" : 
					console.warn("Pixastic:", text);
					break;
				case "error" :
					console.error("Pixastic:", text);
					break;
				default:
					console.log("Pixastic:", text);
			}
		} catch(e) {
		}
		if (!debugElement) {
			
		}
	}

	// canvas capability checks

	var hasCanvas = (function() {
		var c = document.createElement("canvas");
		var val = false;
		try {
			val = !!((typeof c.getContext == "function") && c.getContext("2d"));
		} catch(e) {}
		return function() {
			return val;
		}
	})();

	var hasCanvasImageData = (function() {
		var c = document.createElement("canvas");
		var val = false;
		var ctx;
		try {
			if (typeof c.getContext == "function" && (ctx = c.getContext("2d"))) {
				val = (typeof ctx.getImageData == "function");
			}
		} catch(e) {}
		return function() {
			return val;
		}
	})();

	var hasGlobalAlpha = (function() {
		var hasAlpha = false;
		var red = document.createElement("canvas");
		if (hasCanvas() && hasCanvasImageData()) {
			red.width = red.height = 1;
			var redctx = red.getContext("2d");
			redctx.fillStyle = "rgb(255,0,0)";
			redctx.fillRect(0,0,1,1);
	
			var blue = document.createElement("canvas");
			blue.width = blue.height = 1;
			var bluectx = blue.getContext("2d");
			bluectx.fillStyle = "rgb(0,0,255)";
			bluectx.fillRect(0,0,1,1);
	
			redctx.globalAlpha = 0.5;
			redctx.drawImage(blue, 0, 0);
			var reddata = redctx.getImageData(0,0,1,1).data;
	
			hasAlpha = (reddata[2] != 255);
		}
		return function() {
			return hasAlpha;
		}
	})();


	// return public interface

	return {

		parseOnLoad : false,

		debug : false,
		
		applyAction : function(img, dataImg, actionName, options) {

			options = options || {};

			var imageIsCanvas = (img.tagName.toLowerCase() == "canvas");
			if (imageIsCanvas && Pixastic.Client.isIE()) {
				if (Pixastic.debug) writeDebug("Tried to process a canvas element but browser is IE.");
				return false;
			}

			var canvas, ctx;
			var hasOutputCanvas = false;
			if (Pixastic.Client.hasCanvas()) {
				hasOutputCanvas = !!options.resultCanvas;
				canvas = options.resultCanvas || document.createElement("canvas");
				ctx = canvas.getContext("2d");
			}

			var w = img.offsetWidth;
			var h = img.offsetHeight;

			if (imageIsCanvas) {
				w = img.width;
				h = img.height;
			}

			// offsetWidth/Height might be 0 if the image is not in the document
			if (w == 0 || h == 0) {
				if (img.parentNode == null) {
					// add the image to the doc (way out left), read its dimensions and remove it again
					var oldpos = img.style.position;
					var oldleft = img.style.left;
					img.style.position = "absolute";
					img.style.left = "-9999px";
					document.body.appendChild(img);
					w = img.offsetWidth;
					h = img.offsetHeight;
					document.body.removeChild(img);
					img.style.position = oldpos;
					img.style.left = oldleft;
				} else {
					if (Pixastic.debug) writeDebug("Image has 0 width and/or height.");
					return;
				}
			}

			if (actionName.indexOf("(") > -1) {
				var tmp = actionName;
				actionName = tmp.substr(0, tmp.indexOf("("));
				var arg = tmp.match(/\((.*?)\)/);
				if (arg[1]) {
					arg = arg[1].split(";");
					for (var a=0;a<arg.length;a++) {
						thisArg = arg[a].split("=");
						if (thisArg.length == 2) {
							if (thisArg[0] == "rect") {
								var rectVal = thisArg[1].split(",");
								options[thisArg[0]] = {
									left : parseInt(rectVal[0],10)||0,
									top : parseInt(rectVal[1],10)||0,
									width : parseInt(rectVal[2],10)||0,
									height : parseInt(rectVal[3],10)||0
								}
							} else {
								options[thisArg[0]] = thisArg[1];
							}
						}
					}
				}
			}

			if (!options.rect) {
				options.rect = {
					left : 0, top : 0, width : w, height : h
				};
			} else {
				options.rect.left = Math.round(options.rect.left);
				options.rect.top = Math.round(options.rect.top);
				options.rect.width = Math.round(options.rect.width);
				options.rect.height = Math.round(options.rect.height);
			}

			var validAction = false;
			if (Pixastic.Actions[actionName] && typeof Pixastic.Actions[actionName].process == "function") {
				validAction = true;
			}
			if (!validAction) {
				if (Pixastic.debug) writeDebug("Invalid action \"" + actionName + "\". Maybe file not included?");
				return false;
			}
			if (!Pixastic.Actions[actionName].checkSupport()) {
				if (Pixastic.debug) writeDebug("Action \"" + actionName + "\" not supported by this browser.");
				return false;
			}

			if (Pixastic.Client.hasCanvas()) {
				if (canvas !== img) {
					canvas.width = w;
					canvas.height = h;
				}
				if (!hasOutputCanvas) {
					canvas.style.width = w+"px";
					canvas.style.height = h+"px";
				}
				ctx.drawImage(dataImg,0,0,w,h);

				if (!img.__pixastic_org_image) {
					canvas.__pixastic_org_image = img;
					canvas.__pixastic_org_width = w;
					canvas.__pixastic_org_height = h;
				} else {
					canvas.__pixastic_org_image = img.__pixastic_org_image;
					canvas.__pixastic_org_width = img.__pixastic_org_width;
					canvas.__pixastic_org_height = img.__pixastic_org_height;
				}

			} else if (Pixastic.Client.isIE() && typeof img.__pixastic_org_style == "undefined") {
				img.__pixastic_org_style = img.style.cssText;
			}

			var params = {
				image : img,
				canvas : canvas,
				width : w,
				height : h,
				useData : true,
				options : options
			}

			// Ok, let's do it!

			var res = Pixastic.Actions[actionName].process(params);

			if (!res) {
				return false;
			}

			if (Pixastic.Client.hasCanvas()) {
				if (params.useData) {
					if (Pixastic.Client.hasCanvasImageData()) {
						canvas.getContext("2d").putImageData(params.canvasData, options.rect.left, options.rect.top);

						// Opera doesn't seem to update the canvas until we draw something on it, lets draw a 0x0 rectangle.
						// Is this still so?
						canvas.getContext("2d").fillRect(0,0,0,0);
					}
				}

				if (!options.leaveDOM) {
					// copy properties and stuff from the source image
					canvas.title = img.title;
					canvas.imgsrc = img.imgsrc;
					if (!imageIsCanvas) canvas.alt  = img.alt;
					if (!imageIsCanvas) canvas.imgsrc = img.src;
					canvas.className = img.className;
					canvas.style.cssText = img.style.cssText;
					canvas.name = img.name;
					canvas.tabIndex = img.tabIndex;
					canvas.id = img.id;
					if (img.parentNode && img.parentNode.replaceChild) {
						img.parentNode.replaceChild(canvas, img);
					}
				}

				options.resultCanvas = canvas;

				return canvas;
			}

			return img;
		},

		prepareData : function(params, getCopy) {
			var ctx = params.canvas.getContext("2d");
			var rect = params.options.rect;
			var dataDesc = ctx.getImageData(rect.left, rect.top, rect.width, rect.height);
			var data = dataDesc.data;
			if (!getCopy) params.canvasData = dataDesc;
			return data;
		},

		// load the image file
		process : function(img, actionName, options, callback) {
			if (img.tagName.toLowerCase() == "img") {
				var dataImg = new Image();
				dataImg.src = img.src;
				if (dataImg.complete) {
					var res = Pixastic.applyAction(img, dataImg, actionName, options);
					if (callback) callback(res);
					return res;
				} else {
					dataImg.onload = function() {
						var res = Pixastic.applyAction(img, dataImg, actionName, options)
						if (callback) callback(res);
					}
				}
			}
			if (img.tagName.toLowerCase() == "canvas") {
				var res = Pixastic.applyAction(img, img, actionName, options);
				if (callback) callback(res);
				return res;
			}
		},

		revert : function(img) {
			if (Pixastic.Client.hasCanvas()) {
				if (img.tagName.toLowerCase() == "canvas" && img.__pixastic_org_image) {
					img.width = img.__pixastic_org_width;
					img.height = img.__pixastic_org_height;
					img.getContext("2d").drawImage(img.__pixastic_org_image, 0, 0);

					if (img.parentNode && img.parentNode.replaceChild) {
						img.parentNode.replaceChild(img.__pixastic_org_image, img);
					}

					return img;
				}
			} else if (Pixastic.Client.isIE()) {
 				if (typeof img.__pixastic_org_style != "undefined")
					img.style.cssText = img.__pixastic_org_style;
			}
		},

		Client : {
			hasCanvas : hasCanvas,
			hasCanvasImageData : hasCanvasImageData,
			hasGlobalAlpha : hasGlobalAlpha,
			isIE : function() {
				return !!document.all && !!window.attachEvent && !window.opera;
			}
		},

		Actions : {}
	}


})();
/*
 * Pixastic Lib - Brightness/Contrast filter - v0.1.1
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 */

Pixastic.Actions.brightness = {

	process : function(params) {

		var brightness = parseInt(params.options.brightness,10) || 0;
		var contrast = parseFloat(params.options.contrast)||0;
		var legacy = !!(params.options.legacy && params.options.legacy != "false");

		if (legacy) {
			brightness = Math.min(150,Math.max(-150,brightness));
		} else {
			var brightMul = 1 + Math.min(150,Math.max(-150,brightness)) / 150;
		}
		contrast = Math.max(0,contrast+1);

		if (Pixastic.Client.hasCanvasImageData()) {
			var data = Pixastic.prepareData(params);
			var rect = params.options.rect;
			var w = rect.width;
			var h = rect.height;

			var p = w*h;
			var pix = p*4, pix1, pix2;

			var mul, add;
			if (contrast != 1) {
				if (legacy) {
					mul = contrast;
					add = (brightness - 128) * contrast + 128;
				} else {
					mul = brightMul * contrast;
					add = - contrast * 128 + 128;
				}
			} else {  // this if-then is not necessary anymore, is it?
				if (legacy) {
					mul = 1;
					add = brightness;
				} else {
					mul = brightMul;
					add = 0;
				}
			}
			var r, g, b;
			while (p--) {
				if ((r = data[pix-=4] * mul + add) > 255 )
					data[pix] = 255;
				else if (r < 0)
					data[pix] = 0;
				else
 					data[pix] = r;

				if ((g = data[pix1=pix+1] * mul + add) > 255 ) 
					data[pix1] = 255;
				else if (g < 0)
					data[pix1] = 0;
				else
					data[pix1] = g;

				if ((b = data[pix2=pix+2] * mul + add) > 255 ) 
					data[pix2] = 255;
				else if (b < 0)
					data[pix2] = 0;
				else
					data[pix2] = b;
			}
			return true;
		}
	},
	checkSupport : function() {
		return Pixastic.Client.hasCanvasImageData();
	}
}

/*
 * Pixastic Lib - Desaturation filter - v0.1.1
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 */

Pixastic.Actions.desaturate = {

	process : function(params) {
		var useAverage = !!(params.options.average && params.options.average != "false");

		if (Pixastic.Client.hasCanvasImageData()) {
			var data = Pixastic.prepareData(params);
			var rect = params.options.rect;
			var w = rect.width;
			var h = rect.height;

			var p = w*h;
			var pix = p*4, pix1, pix2;

			if (useAverage) {
				while (p--) 
					data[pix-=4] = data[pix1=pix+1] = data[pix2=pix+2] = (data[pix]+data[pix1]+data[pix2])/3
			} else {
				while (p--)
					data[pix-=4] = data[pix1=pix+1] = data[pix2=pix+2] = (data[pix]*0.3 + data[pix1]*0.59 + data[pix2]*0.11);
			}
			return true;
		} else if (Pixastic.Client.isIE()) {
			params.image.style.filter += " gray";
			return true;
		}
	},
	checkSupport : function() {
		return (Pixastic.Client.hasCanvasImageData() || Pixastic.Client.isIE());
	}
}/*
 * Pixastic Lib - Sharpen filter - v0.1.0
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 */

Pixastic.Actions.sharpen = {
	process : function(params) {

		var strength = 0;
		if (typeof params.options.amount != "undefined")
			strength = parseFloat(params.options.amount)||0;

		if (strength < 0) strength = 0;
		if (strength > 1) strength = 1;

		if (Pixastic.Client.hasCanvasImageData()) {
			var data = Pixastic.prepareData(params);
			var dataCopy = Pixastic.prepareData(params, true)

			var mul = 15;
			var mulOther = 1 + 3*strength;

			var kernel = [
				[0, 	-mulOther, 	0],
				[-mulOther, 	mul, 	-mulOther],
				[0, 	-mulOther, 	0]
			];

			var weight = 0;
			for (var i=0;i<3;i++) {
				for (var j=0;j<3;j++) {
					weight += kernel[i][j];
				}
			}

			weight = 1 / weight;

			var rect = params.options.rect;
			var w = rect.width;
			var h = rect.height;

			mul *= weight;
			mulOther *= weight;

			var w4 = w*4;
			var y = h;
			do {
				var offsetY = (y-1)*w4;

				var nextY = (y == h) ? y - 1 : y;
				var prevY = (y == 1) ? 0 : y-2;

				var offsetYPrev = prevY*w4;
				var offsetYNext = nextY*w4;

				var x = w;
				do {
					var offset = offsetY + (x*4-4);

					var offsetPrev = offsetYPrev + ((x == 1) ? 0 : x-2) * 4;
					var offsetNext = offsetYNext + ((x == w) ? x-1 : x) * 4;

					var r = ((
						- dataCopy[offsetPrev]
						- dataCopy[offset-4]
						- dataCopy[offset+4]
						- dataCopy[offsetNext])		* mulOther
						+ dataCopy[offset] 	* mul
						);

					var g = ((
						- dataCopy[offsetPrev+1]
						- dataCopy[offset-3]
						- dataCopy[offset+5]
						- dataCopy[offsetNext+1])	* mulOther
						+ dataCopy[offset+1] 	* mul
						);

					var b = ((
						- dataCopy[offsetPrev+2]
						- dataCopy[offset-2]
						- dataCopy[offset+6]
						- dataCopy[offsetNext+2])	* mulOther
						+ dataCopy[offset+2] 	* mul
						);


					if (r < 0 ) r = 0;
					if (g < 0 ) g = 0;
					if (b < 0 ) b = 0;
					if (r > 255 ) r = 255;
					if (g > 255 ) g = 255;
					if (b > 255 ) b = 255;

					data[offset] = r;
					data[offset+1] = g;
					data[offset+2] = b;

				} while (--x);
			} while (--y);

			return true;

		}
	},
	checkSupport : function() {
		return Pixastic.Client.hasCanvasImageData();
	}
}
/*jslint browser: true, on: true, eqeqeq: true, newcap: true, immed: true */

/*
	TODOs:

	Fo sho:
		- fix last page loading bug
		- disable the strech button if in an auto zoom mode
		- improve prev/next buttons, only show them when they can possibly work (not at beginning/end)
		- check for html5 feature support where used: diveintohtml5.org/everything.html or www.modernizr.com
		- write bin scripts to minify & join all js

	Nice 2 have:
		- jump to page?
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
			)
			.append(
				$(document.createElement("p"))
					.attr("id", "cb-comic-info")
					.append("<span id='cb-current-page'></span> / " + srcs.length)
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
		
		loadingOverlay: $(document.createElement("div"))
			.attr("id", "cb-loading-overlay")
			.addClass("cb-control")
	};

	/**
	 * TODO: center, make sure they never leave the visible portion of the screen
	 */
	ComicBook.prototype.renderControls = function() {
		
		$(canvas)
			.before(this.getControl("loadingOverlay"))
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
		
		this.showControl("loadingOverlay");

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
					ComicBook.prototype.hideControl("loadingOverlay");
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
				this.showControl("loadingOverlay");
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

		var current_page = (options.displayMode === "double") ? (pointer+1) + "-" + (pointer+2) : pointer+1
		$("#cb-current-page").text(current_page);

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
