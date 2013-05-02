
SOURCES = lib/pixastic/pixastic.core.js \
          lib/pixastic/actions/brightness.js \
          lib/pixastic/actions/desaturate.js \
          lib/pixastic/actions/sharpen.js \
          lib/vendor/handlebars.runtime-1.0.rc.1.min.js \
          lib/templates.js \
          lib/ComicBook.js

all: reset lib/ComicBook.combined.js lib/ComicBook.min.js clean

lib/templates.js: templates/*.handlebars
	handlebars $< -f $@

lib/ComicBook.combined.js: ${SOURCES}
	cat > $@ $^

lib/ComicBook.min.js: lib/ComicBook.combined.js
	java -jar bin/closure-complier/compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js $< --js_output_file $@

reset:
	touch lib/ComicBook.min.js
	rm lib/ComicBook.min.js

clean:
	rm lib/ComicBook.combined.js
