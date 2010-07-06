
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
		canvas.addEventListener("click", comicOnClick, false);
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

		var page = pages[pointer];
		
		if (typeof page != "object") throw "invalid page type";

		canvas.width = page.width;
		canvas.height = page.height;
		context.drawImage(page, 0, 0);
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

	function comicOnClick(e) {
		switch (getCursorPosition(e)) {
			case "left": drawPrevPage(); break;
			case "right": drawNextPage(); break;
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