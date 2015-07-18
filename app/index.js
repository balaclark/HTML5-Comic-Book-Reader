// let ComicBook = window.ComicBook = require('./comic-book')
let Canvas = require('./view/canvas')
let canvas = new Canvas({ zoomMode: 'fitWidth' })
/*
let image = new window.Image()
image.onload = () => {
  canvas.drawImage(image)
  document.body.appendChild(canvas.canvas)
}
image.src = 'https://raw.githubusercontent.com/balaclark/HTML5-Comic-Book-Reader/master/examples/goldenboy/goldenboy_01.jpg'
*/

let testImages = require('../test/data')
let fixtureImages = require('../test/fixture')
let imagediff = require('imagediff')

testImages.portrait1((testImage) => {
  fixtureImages.singlePortrait((fixtureImage) => {
    canvas.drawImage(testImage)

    console.log(imagediff.equal(canvas.canvas, fixtureImage))

    console.log(testImage.width, testImage.height)
    console.log(fixtureImage.width, fixtureImage.height)
    console.log(canvas.canvas.width, canvas.canvas.height)

    document.body.appendChild(canvas.canvas)
  })
})

