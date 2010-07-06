
var book;

window.onload = function() {

	book = new ComicBook();
	
	var srcs = {
		1: "http://dev.justforcomics.com/get/image/?f=comics/extracted/oni_whiteout_melt_1/00.jpg",
		2: "http://dev.justforcomics.com/get/image/?f=comics/extracted/oni_whiteout_melt_1/01.jpg",
		3: "http://dev.justforcomics.com/get/image/?f=comics/extracted/oni_whiteout_melt_1/02.jpg",
		4: "http://dev.justforcomics.com/get/image/?f=comics/extracted/oni_whiteout_melt_1/03.jpg",
		5: "http://dev.justforcomics.com/get/image/?f=comics/extracted/oni_whiteout_melt_1/04.jpg",
		6: "http://dev.justforcomics.com/get/image/?f=comics/extracted/oni_whiteout_melt_1/05.jpg",
		7: "http://dev.justforcomics.com/get/image/?f=comics/extracted/oni_whiteout_melt_1/06.jpg",
		8: "http://dev.justforcomics.com/get/image/?f=comics/extracted/oni_whiteout_melt_1/07.jpg"
	};

	book.draw("comic", srcs);
}

function ComicBook() {

	var srcs = [];
	var pages = [];
	var canvas;
	var context;
	
	var buffer = 4;
	var pointer = 0;

	/* 
	 * @param {String} id The canvas ID to draw the comic on.
	 * @param {Array} srcs An array of all the comic page srcs, in order
	 */
	this.draw = function(id, srcs) {

		// setup canvas
		canvas = document.getElementById(id);
		context = canvas.getContext("2d");
		
		preload(srcs);
	}
	
	function preload(srcs) {

		var loaded = 0;

		if (srcs.length < buffer) buffer = srcs.length; // don't get stuck if the buffer level is higher than the number of pages

		for (i in srcs) {
		
			var page = new Image();

			page.src = srcs[i];
			
			page.onload = function() {
				pages[loaded] = this; loaded++;
				if (loaded == buffer) drawPage();
			}
		};
	}

	/**
	 * TODO: break this down into drawSinglePage() & drawDoublePage()
	 * TODO: if the current browser doesn't have canvas support, use img tags
	 */
	function drawPage() {

		console.log(pointer, pages);

		var page = pages[pointer];
		
		canvas.width = page.width;
		canvas.height = page.height;
		context.drawImage(page, 0, 0);
	}
	
	this.drawNextPage = function() {
		if (pointer < pointer + 1) pointer++;
		drawPage();
	}

	this.drawPrevPage = function() {
		if (pointer > 0) pointer--;
		drawPage();
	}
}