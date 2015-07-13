
build:
	@echo "Compiling and minifying javascript..."
	@./node_modules/.bin/uglifyjs dist/js/comicbook.js --compress --mangle --screw-ie8 --output comicbook.min.js --source-map dist/js/comicbook.min.js.map --source-map-root ./
	@echo "Compiling CSS..."
	@cat fonts/icomoon-toolbar/style.css css/reset.css css/styles.css css/toolbar.css > comicbook/comicbook.css
	@./node_modules/.bin/cssmin dist/comicbook.css > dist/comicbook.min.css
	@echo "Copying assets..."
	@cp -r assets/css/img dist/img
	@cp -r assets/icons/1_Desktop_Icons/icon_128.png comicbook/img
	@cp -r assets/icons/1_Desktop_Icons/icon_196.png comicbook/img
	@cp -r assets/fonts/icomoon-toolbar/fonts comicbook
	@cp -r assets/fonts/icomoon-toolbar/license.txt comicbook/fonts
	@echo "Done"

