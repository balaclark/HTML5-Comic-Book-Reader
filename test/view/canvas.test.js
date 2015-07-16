let assert = require('assert')
let Canvas = require('../../app/view/canvas')

describe('Canvas', function () {

  it('should draw only Image objects', function () {
    let canvas = new Canvas()
    let image = new window.Image()

    assert.throws(canvas.draw, 'Invalid image')
    assert.throws(canvas.draw.bind(canvas, image, true), 'Invalid image')
    assert.doesNotThrow(canvas.draw.bind(canvas, image, true, image), 'Invalid image')
  })

  it('should draw a single page')

  it('should draw a double page')

  it('should draw a manga double page')

  it('should draw a single double page spread')

  it('should show a blank last page if the last double page only has one image')

  it('should auto-fit to window width')

  it('should auto-fit to window height')

  it('should manual zoom')

  it('should always center pages')
})
