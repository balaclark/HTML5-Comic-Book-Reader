let EventEmitter = require('events').EventEmitter

class Canvas extends EventEmitter {

  constructor (options) {
    super()

    this.options = Object.assign({
      // fitWidth, fitWindow, manua
      zoomMode: 'fitWidth',
      // ltr, rtl
      readDirection: 'ltr',
      // should two pages be rendered at a time?
      doublePage: false
    }, options)

    this.canvas = document.createElement('canvas')
    this.context = this.canvas.getContext('2d')

    this.on('draw:start', this.clearCanvas.bind(this))
  }

  getScale () {

  }

  fitCanvasToImage (image) {
    // make sure the canvas is always at least full screen, even if the page is more narrow than the screen
    this.canvas.width = (this.canvas.width < window.innerWidth) ? window.innerWidth : this.canvas.width
    this.canvas.height = (this.canvas.height < window.innerHeight) ? window.innerHeight : this.canvas.height
  }

  getDimensions (image) {
    let dimensions = {
      width: image.width,
      height: image.height
    }
    return dimensions
  }

  getOffset (dimensions) {
    let offset = {
      width: 0,
      height: 0
    }

    // always keep pages centered
    if (this.options.zoomMode === 'manual' || this.options.zoomMode === 'fitWindow') {

      // work out a horizontal position
      if (this.canvas.width < window.innerWidth) {
        offset.width = (window.innerWidth - dimensions.width) / 2
        if (this.options.doublePage) {
          offset.width = offset.width - dimensions.width / 2
        }
      }

      // work out a vertical position
      if (this.canvas.height < window.innerHeight) {
        offset.height = (window.innerHeight - dimensions.height) / 2
      }
    }

    return offset
  }

  clearCanvas () {
    this.canvas.width = 0
    this.canvas.height = 0
  }

  drawImage (image, image2) {
    this.emit('draw:start')

    if (!(image instanceof window.Image) || (this.options.doublePage && !(image2 instanceof window.Image))) {
      throw new Error('Invalid image')
    }

    this.fitCanvasToImage()

    let dimensions = this.getDimensions(image)
    let offset = this.getOffset(dimensions)

    this.context.drawImage(image, offset.width, offset.height, dimensions.width, dimensions.height)
    if (this.options.doublePage && image2) {
      this.context.drawImage(image2, dimensions.width + offset.width, offset.height, dimensions.width, dimensions.height)
    }

    this.emit('draw:finish')
  }
}

module.exports = Canvas
