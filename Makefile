
lib/ComicBook.min.js : lib/ComicBook.js
	java -jar bin/closure-complier/compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js $< --js_output_file $@ 