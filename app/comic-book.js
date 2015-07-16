let EventEmitter = require('events').EventEmitter
let LoadIndicator = require('./view/load-indicator')

class ComicBook extends EventEmitter {

  constructor (srcs = []) {
    super()

    // requested image srcs
    this.srcs = new Set(srcs)

    // loaded image objects
    this.pages = new Map()

    this.loadIndicator = new LoadIndicator()

    this.addEventListeners()
  }

  addEventListeners () {
    this.on('preload:start', this.loadIndicator.show.bind(this.loadIndicator))
  }

  preload () {
    let self = this

    this.emit('preload:start')

    this.srcs.forEach((src, pageIndex) => {
      let image = new window.Image()

      image.src = src
      image.onload = setImage

      function setImage () {
        self.pages.set(pageIndex, this)
        self.emit('preload:image', this)

        if (self.pages.size === self.srcs.size) {
          self.emit('preload:finish')
        }
      }
    })
  }

}

module.exports = ComicBook

