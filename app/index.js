// let ComicBook = window.ComicBook = require('./comic-book')
let Canvas = require('./view/canvas')
let makeImages = require('../test/data/image')

makeImages((testImages) => {
  let canvas = new Canvas()
  canvas.drawImage(testImages.portrait1)
  document.body.appendChild(canvas.canvas)
})
