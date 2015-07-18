let EventEmitter = require('events').EventEmitter
let LoadIndicator = require('./view/load-indicator')
let ProgressBar = require('./view/progress-bar')

class ComicBook extends EventEmitter {

  constructor (srcs = []) {
    super()

    // requested image srcs
    this.srcs = new Set(srcs)

    // loaded image objects
    this.pages = new Map()

    this.loadIndicator = new LoadIndicator()
    this.progressBar = new ProgressBar()

    this.addEventListeners()
  }

  addEventListeners () {
    this.on('preload:start', this.loadIndicator.show.bind(this.loadIndicator))
    this.on('preload:start', this.progressBar.show.bind(this.progressBar))
    this.on('preload:image', this.updateProgressBar.bind(this))
    this.on('preload:finish', this.progressBar.hide.bind(this.progressBar))
  }

  render () {
    this.el = document.createElement('div')
    this.el.appendChild(this.progressBar.el)
    return this
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

  updateProgressBar () {
    let percentage = Math.floor((this.pages.size / this.srcs.size) * 100)
    this.progressBar.update(percentage)
  }
}

module.exports = ComicBook

