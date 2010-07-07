
var book;

window.onload = function() {

	var pages = [
		"http://dev.justforcomics.com/get/image/?f=comics/extracted/oni_whiteout_melt_1/00.jpg",
		"http://dev.justforcomics.com/get/image/?f=comics/extracted/oni_whiteout_melt_1/01.jpg",
		"http://dev.justforcomics.com/get/image/?f=comics/extracted/oni_whiteout_melt_1/02.jpg",
		"http://dev.justforcomics.com/get/image/?f=comics/extracted/oni_whiteout_melt_1/03.jpg",
		"http://dev.justforcomics.com/get/image/?f=comics/extracted/oni_whiteout_melt_1/04.jpg",
		"http://dev.justforcomics.com/get/image/?f=comics/extracted/oni_whiteout_melt_1/05.jpg",
		"http://dev.justforcomics.com/get/image/?f=comics/extracted/oni_whiteout_melt_1/06.jpg",
		"http://dev.justforcomics.com/get/image/?f=comics/extracted/oni_whiteout_melt_1/07.jpg"
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
	var zoomMode = "fitWidth"; // manual / fitWidth / fitHeight

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

		var width, height, page = pages[pointer];
		
		if (typeof page != "object") throw "invalid page type";

		// update the page scale if a non manual mode has been chosen
		switch(zoomMode) {
			case "fitWidth":
				scale =  (window.innerWidth > page.width)
					  ? ((window.innerWidth - page.width) / window.innerWidth) + 1 // scale up if the window is wider than the page
					  : window.innerWidth / page.width; // scale down if the window is narrower than the page
				break;
		}
		
		width  = page.width * scale;
		height = page.height * scale;

		// make sure the canvas is always at least full screen, even if the page is more narrow than the screen
		canvas.width = (height < window.innerWidth) ? window.innerWidth : width;
		canvas.height = (height < window.innerHeight) ? window.innerHeight : height;
		
		context.drawImage(page, 0, 0, width, height);
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
