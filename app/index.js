// let ComicBook = window.ComicBook = require('./comic-book')
let Canvas = require('./view/canvas')
let testImages = require('../test/data')
let fixtureImages = require('../test/fixture')
let imagediff = require('imagediff')

testImages.portrait1((testImage) => {
  fixtureImages.singlePortrait((fixtureImage) => {
    let canvas = new Canvas()
    canvas.drawImage(testImage)

    console.log(imagediff.equal(canvas.canvas, fixtureImage))

    console.log(testImage.width, testImage.height)
    console.log(fixtureImage.width, fixtureImage.height)
    console.log(canvas.canvas.width, canvas.canvas.height)

    document.body.appendChild(canvas.canvas)
  })
})
