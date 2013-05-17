
SOURCES = lib/pixastic/pixastic.js \
          lib/pixastic/pixastic.effects.js \
          lib/pixastic/pixastic.worker.js \
          lib/pixastic/pixastic.worker.control.js \
          lib/ComicBook.js

all: reset lib/ComicBook.combined.js lib/ComicBook.min.js

lib/ComicBook.combined.js: ${SOURCES}
	cat > $@ $^

lib/ComicBook.min.js: lib/ComicBook.combined.js
	java -jar bin/closure-complier/compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js $< --js_output_file $@

reset:
	rm -f lib/ComicBook.min.js

clean:
	rm lib/ComicBook.combined.js
