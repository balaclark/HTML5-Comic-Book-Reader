
var book;

window.onload = function() {

	book = new ComicBook();
	
	var srcs = [
		"http://dev.justforcomics.com/get/image/?f=comics/extracted/oni_whiteout_melt_1/00.jpg",
		"http://dev.justforcomics.com/get/image/?f=comics/extracted/oni_whiteout_melt_1/01.jpg",
		"http://dev.justforcomics.com/get/image/?f=comics/extracted/oni_whiteout_melt_1/02.jpg",
		"http://dev.justforcomics.com/get/image/?f=comics/extracted/oni_whiteout_melt_1/03.jpg",
		"http://dev.justforcomics.com/get/image/?f=comics/extracted/oni_whiteout_melt_1/04.jpg",
		"http://dev.justforcomics.com/get/image/?f=comics/extracted/oni_whiteout_melt_1/05.jpg",
		"http://dev.justforcomics.com/get/image/?f=comics/extracted/oni_whiteout_melt_1/06.jpg",
		"http://dev.justforcomics.com/get/image/?f=comics/extracted/oni_whiteout_melt_1/07.jpg"
	];

	book.draw("comic", srcs);
}

function ComicBook() {

	var pages = [];
	var canvas;
	var context;

	var buffer = 10;
	var pointer = 0;

	console.log("init");

	this.draw = function(elm, srcs) {

		// setup canvas
		canvas = document.getElementById(elm);
		context = canvas.getContext("2d");

		// set full width
		//canvas.width = document.body.clientWidth;

		preload(srcs);
	}
	
	this.drawPage = function() { drawPage(); }

	/**
	 * TODO: break this down into drawSinglePage() & drawDoublePage()
	 */
	function drawPage() {
	
		var page = pages[pointer];
		
		canvas.width = page.width;
		canvas.height = page.height;
		context.drawImage(page, 0, 0);
	}
	
	function preload(srcs) {
	
		var loaded = 0;

		if (srcs.length < buffer) buffer = srcs.length; // don't get stuck if the buffer level is higher than the number of pages

		srcs.forEach(function(src){

			var page = new Image();

			page.src = src;
			
			page.onload = function() {
				pages[loaded] = this; loaded++;
				if (loaded == buffer) drawPage();
			}
		});
	}
}