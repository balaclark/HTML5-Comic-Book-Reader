
#
# build package & update examples
#

build:
	@echo "Running jshint..."
	@./node_modules/.bin/jshint lib/ComicBook.js --config lib/.jshintrc
	@echo "Compiling Handlebars templates..."
	@./node_modules/.bin/handlebars templates/*.handlebars -f lib/templates.js
	@echo "Compiling and minifying javascript..."
	@mkdir -p comicbook/js/pixastic
	@cat lib/vendor/pixastic/pixastic.js lib/vendor/pixastic/pixastic.effects.js lib/vendor/pixastic/pixastic.worker.js lib/vendor/handlebars.runtime-1.0.rc.1.min.js lib/vendor/quo.js lib/templates.js lib/ComicBook.js > comicbook/js/comicbook.js
	@cp lib/vendor/pixastic/pixastic.js comicbook/js/pixastic
	@cp lib/vendor/pixastic/pixastic.effects.js comicbook/js/pixastic
	@cp lib/vendor/pixastic/pixastic.worker.js comicbook/js/pixastic
	@cp lib/vendor/pixastic/pixastic.worker.control.js comicbook/js/pixastic
	@cp lib/vendor/pixastic/license-gpl-3.0.txt comicbook/js/pixastic
	@cp lib/vendor/pixastic/license-mpl.txt comicbook/js/pixastic
	@./node_modules/.bin/uglifyjs -nc comicbook/js/comicbook.js > comicbook/js/comicbook.min.js
	@echo "Compiling CSS..."
	@cat fonts/icomoon-toolbar/style.css css/reset.css css/styles.css css/toolbar.css > comicbook/comicbook.css
	@echo "Copying assets..."
	@cp -r css/img comicbook/img
	@cp -r fonts/icomoon-toolbar/fonts comicbook
	@cp -r fonts/icomoon-toolbar/license.txt comicbook/fonts
	@echo "Updating examples"
	@cp -r comicbook examples
	@echo "Done"

#
# run jshint & quint tests
#

test:
	@./node_modules/.bin/jshint lib/ComicBook.js --config lib/.jshintrc
	@./node_modules/.bin/jshint lib/tests/unit/*.js --config lib/.jshintrc
	@node lib/tests/server.js &
	@./node_modules/.bin/phantomjs lib/tests/phantom.js "http://localhost:3000/lib/tests"
	@kill -9 `cat lib/tests/pid.txt`
	@rm lib/tests/pid.txt

#
# remove prior builds
#

clean:
	@rm -r comicbook
	@rm -r examples/comicbook
