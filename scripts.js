
var book;

window.onload = function() {

	var pages = [
		"http://dev.justforcomics.com/get/image/?f=comics/extracted/oni_whiteout_melt_1/00.jpg",
		"http://dev.justforcomics.com/get/image/?f=comics/extracted/oni_whiteout_melt_1/01.jpg",
		"http://dev.justforcomics.com/get/image/?f=comics/extracted/oni_whiteout_melt_1/02.jpg",
		"http://dev.justforcomics.com/get/image/?f=comics/extracted/oni_whiteout_melt_1/03.jpg",
		"http://dev.justforcomics.com/get/image/?f=comics/extracted/oni_whiteout_melt_1/04.jpg",
		"http://dev.justforcomics.com/get/image/?f=comics/extracted/oni_whiteout_melt_1/05.jpg",
		"http://dev.justforcomics.com/get/image/?f=comics/extracted/oni_whiteout_melt_1/06.jpg"
	];

	book = new ComicBook();
	book.draw("comic", pages);
}

function ComicBook() {

	var srcs = [];
	var pages = [];
	var canvas;
	var context;
	
	var buffer = 4;
	var pointer = 0;
	var loaded = 0;
	
	var scale = 1;
	var displayMode = "double" // single / double
	var zoomMode = "manual"; // manual / fitWidth / fitHeight

	/* 
	 * @param {String} id The canvas ID to draw the comic on.
	 * @param {Object} srcs An array of all the comic page srcs, in order
	 * @see #preload
	 */
	this.draw = function(id, srcs) {
	
		// setup canvas
		canvas = document.getElementById(id);
		context = canvas.getContext("2d");

		// preload images
		preload(srcs);
		
		// add page controls
		canvas.addEventListener("click", navigation, false);
	}

	/*
	 * Zoom the canvas
	 * 
	 * @param new_scale {Number} Scale the canvas to this ratio
	 */
	this.zoom = function(new_scale) {
		zoomMode = "manual";
		scale = new_scale;
		drawPage();
	}
	
	/**
	 * Preload all images, draw the page only after a given number have been loaded.
	 *
	 * @param srcs {Object} srcs
	 * @see #drawPage
	 */
	function preload(srcs) {

		if (srcs.length < buffer) buffer = srcs.length; // don't get stuck if the buffer level is higher than the number of pages

		srcs.forEach(function(src, i) {

			var page = new Image();
			
			page.src = src;
			
			page.onload = function() {
				
				pages[i] = this; loaded++;
				if (loaded == buffer) drawPage();
			}
		});
	}

	/**
	 * Draw the current page in the canvas
	 *
	 * TODO: break this down into drawSinglePage() & drawDoublePage()
	 * TODO: if the current browser doesn't have canvas support, use img tags
	 */
	function drawPage() {

		console.log(scale, displayMode, zoomMode);

		var zoom_scale;
		var page = pages[pointer];
		var page2 = pages[pointer + 1];
		
		if (typeof page != "object") throw "invalid page";

		var width = page.width;
		var height = page.height;
		
		if (displayMode == "double") {

			// for double page spreads, factor in the width of both pages, set the height to the tallest page
			if (typeof page2 == "object") {
				width += page2.width;
				if (page2.height > page.height) height = page2.height;
			}
			
			// if this is the last page and there is no page2, still keep the canvas wide
			else width += width;
		}
		
		// update the page scale if a non manual mode has been chosen
		switch(zoomMode) {

			case "manual":
				zoom_scale = (displayMode == "double") ? scale * 2 : scale;
				break;
				
			case "fitWidth":
				zoom_scale =  (window.innerWidth > width)
					  ? ((window.innerWidth - width) / window.innerWidth) + 1 // scale up if the window is wider than the page
					  : window.innerWidth / width; // scale down if the window is narrower than the page
				
				break;

			default: throw "invalid zoomMode";
		}

		// set the page dimensions based on scale
		width  = page.width * zoom_scale;
		height = page.height * zoom_scale;
		
		// make sure the canvas is always at least full screen, even if the page is more narrow than the screen
		canvas.width = (width < window.innerWidth) ? window.innerWidth : width;
		canvas.height = (height < window.innerHeight) ? window.innerHeight : height;

		// draw the page
		if (zoomMode == "manual") {
			context.drawImage(page, 0, 0, page.width, page.height);
			if (displayMode == "double" && typeof page2 == "object") context.drawImage(page2, page.width, 0, page2.width, page2.height);
		}
		// draw page with scaled dimensions in dynamic display modes
		else {
			context.drawImage(page, 0, 0, width, height);
			if (displayMode == "double" && typeof page2 == "object") context.drawImage(page2, width, 0, width, height);
		}
	}

	/**
	 * Increment the counter and draw the page in the canvas
	 * 
	 * @see #drawPage
	 */
	function drawNextPage() {
		if (pointer + 1 < pages.length) {
			pointer++;
			drawPage();
		}
	}

	/**
	 * Decrement the counter and draw the page in the canvas
	 *
	 * @see #drawPage
	 */
	function drawPrevPage() {
		if (pointer > 0) {
			pointer--;
			drawPage();
		}
	}

	function navigation(e) {

		switch (e.type) {

			case "click":
				switch (getCursorPosition(e)) {
					case "left": drawPrevPage(); break;
					case "right": drawNextPage(); break;
				}
				break;
			
			defualt: console.log(e.type);
		}
	}

	/**
	 * Figure out the cursor position relative to the canvas.
	 * 
	 * Thanks to: Mark Pilgrim & http://diveintohtml5.org/canvas.html
	 */
	function getCursorPosition(e) {
		
		var x;

		// check if page relative positions exist
		if (e.pageX) x = e.pageX;

		// if not figure them out
		else  x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;

		// make the position relative to the canvas
		x -= canvas.offsetLeft;

		// check if the user clicked on the left or right side
		return (x <= canvas.width / 2) ? 'left' : 'right';
	}
}
