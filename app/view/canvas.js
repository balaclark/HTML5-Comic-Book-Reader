let EventEmitter = require('events').EventEmitter

class Canvas extends EventEmitter {

  constructor (options) {
    super()

    this.options = Object.assign({
      // fitWidth, fitWindow, manua
      zoomMode: 'fitWidth',
      // ltr, rtl
      readDirection: 'ltr'
    }, options)

    this.canvas = document.createElement('canvas')
    this.context = this.canvas.getContext('2d')
  }

  draw (image, doublePage, image2) {
    if (!(image instanceof window.Image) || (doublePage && !(image2 instanceof window.Image))) {
      throw new Error('Invalid image')
    }

    this.emit('draw')
  }
}

module.exports = Canvas
