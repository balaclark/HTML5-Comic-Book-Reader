let assert = require('assert')
let imagediff = require('imagediff')
let Canvas = require('../../app/view/canvas')
let makeTestImages = require('../data/image')
let makeImageFixtures = require('../fixture/image')

describe('Canvas', function () {

  it('should draw only Image objects', () => {
    let canvas = new Canvas()
    let image = new window.Image()

    assert.throws(canvas.drawImage, 'Invalid image')

    canvas.options.doublePage = true

    assert.throws(canvas.drawImage.bind(canvas, image), 'Invalid image')
    assert.doesNotThrow(canvas.drawImage.bind(canvas, image, image), 'Invalid image')
  })

  it('should draw a single page', () => {
    let canvas = new Canvas()
    // TODO refactor how images are generated (do one at a time)
    // TODO update fixture once centering is working again
    makeTestImages((testImages) => {
      makeImageFixtures((fixtureImages) => {
        canvas.drawImage(testImages.portrait1)
        assert(imagediff.equal(canvas.canvas, fixtureImages.singlePortrait))
      })
    })
  })

  it('should draw a double page')

  it('should draw a manga double page')

  it('should draw a single double page spread')

  it('should show a blank last page if the last double page only has one image')

  it('should auto-fit to window width')

  it('should auto-fit to window height')

  it('should manual zoom')

  it('should always display the canvas 100% of window width, even when drawing smaller images')

  it('should always center pages')

  it('should prevent smaller images from being drawn on top of bigger ones')
})
