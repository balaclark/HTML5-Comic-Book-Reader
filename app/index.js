let ComicBook = window.ComicBook = require('./comic-book')
let srcs = [
  'https://raw.githubusercontent.com/balaclark/HTML5-Comic-Book-Reader/master/examples/goldenboy/goldenboy_00.jpg',
  'https://raw.githubusercontent.com/balaclark/HTML5-Comic-Book-Reader/master/examples/goldenboy/goldenboy_01.jpg',
  'https://raw.githubusercontent.com/balaclark/HTML5-Comic-Book-Reader/master/examples/goldenboy/goldenboy_02.jpg',
  'https://raw.githubusercontent.com/balaclark/HTML5-Comic-Book-Reader/master/examples/goldenboy/goldenboy_03.jpg',
  'https://raw.githubusercontent.com/balaclark/HTML5-Comic-Book-Reader/master/examples/goldenboy/goldenboy_04.jpg',
  'https://raw.githubusercontent.com/balaclark/HTML5-Comic-Book-Reader/master/examples/goldenboy/goldenboy_05.jpg',
  'https://raw.githubusercontent.com/balaclark/HTML5-Comic-Book-Reader/master/examples/goldenboy/goldenboy_06.jpg',
  'https://raw.githubusercontent.com/balaclark/HTML5-Comic-Book-Reader/master/examples/goldenboy/goldenboy_07.jpg',
  'https://raw.githubusercontent.com/balaclark/HTML5-Comic-Book-Reader/master/examples/goldenboy/goldenboy_08.jpg',
  'https://raw.githubusercontent.com/balaclark/HTML5-Comic-Book-Reader/master/examples/goldenboy/goldenboy_09.jpg',
  'https://raw.githubusercontent.com/balaclark/HTML5-Comic-Book-Reader/master/examples/goldenboy/goldenboy_10.jpg'
]
let comic = window.comic = new ComicBook(srcs, { doublePage: true })

comic.preload()
comic.render()

document.addEventListener('DOMContentLoaded', () => {
  document.body.appendChild(comic.el)
}, false)

