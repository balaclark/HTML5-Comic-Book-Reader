let EventEmitter = require('events').EventEmitter
let Canvas = require('./view/canvas')
let LoadIndicator = require('./view/load-indicator')
let ProgressBar = require('./view/progress-bar')

class ComicBook extends EventEmitter {

  constructor (srcs = [], options) {
    super()

    this.options = Object.assign({
      // manga mode
      rtl: false,
      doublePage: false
    }, options)

    // requested image srcs
    this.srcs = srcs

    // loaded image objects
    this.pages = new Map()

    this.preloadBuffer = 4

    // TODO move this logic into the router
    this.currentPageIndex = 0

    this.canvas = new Canvas()
    this.loadIndicator = new LoadIndicator()
    this.progressBar = new ProgressBar()

    this.addEventListeners()
  }

  addEventListeners () {
    this.on('preload:start', this.loadIndicator.show.bind(this.loadIndicator))
    this.on('preload:start', this.progressBar.show.bind(this.progressBar))
    this.on('preload:image', this.updateProgressBar.bind(this))
    this.on('preload:ready', this.loadIndicator.hide.bind(this.loadIndicator))
    this.on('preload:ready', this.drawPage.bind(this))
    this.on('preload:finish', this.progressBar.hide.bind(this.progressBar))
  }

  render () {
    this.pageRendered = false
    this.el = document.createElement('div')
    this.el.appendChild(this.canvas.canvas)
    this.el.appendChild(this.progressBar.el)
    this.el.appendChild(this.loadIndicator.el)
    this.drawPage()
    return this
  }

  preload () {
    this.emit('preload:start')

    this.srcs.forEach((src, pageIndex) => {

      // allow preload to be run multiple times without duplicating requests
      if (this.pages.has(pageIndex)) return

      let image = new window.Image()

      image.src = src
      image.onload = setImage.bind(this, image, pageIndex)

      function setImage (image, index) {
        this.pages.set(index, image)
        this.emit('preload:image', image)

        if (this.pages.size >= this.preloadBuffer && !this.pageRendered) {
          this.emit('preload:ready')
        }

        if (this.pages.size === this.srcs.length) {
          this.emit('preload:finish')
        }
      }
    })
  }

  updateProgressBar () {
    let percentage = Math.floor((this.pages.size / this.srcs.length) * 100)
    this.progressBar.update(percentage)
  }

  drawPage (pageIndex) {
    if (typeof pageIndex !== 'number') pageIndex = this.currentPageIndex

    let page = this.pages.get(pageIndex)

    // if the requested image hasn't been loaded yet, force another preload run
    if (!page) return this.preload()

    let args = [ page ]

    if (this.options.doublePage) {
      args.push(this.pages.get(pageIndex + 1))

      if (this.options.rtl) {
        args.reverse()
      }
    }

    args.push(this.options)

    try {
      this.canvas.drawImage.apply(this.canvas, args)
      this.currentPageIndex = pageIndex
      this.pageRendered = true
    } catch (e) {
      if (e.message !== 'Invalid image') throw e
    }
  }

  drawNextPage () {
    let increment = this.options.doublePage ? 2 : 1
    let index = this.currentPageIndex + increment
    if (index >= this.pages.size) {
      index = this.pages.size - 1
    }
    this.drawPage(index)
  }

  drawPreviousPage () {
    let increment = this.options.doublePage ? 2 : 1
    let index = this.currentPageIndex - increment
    if (index < 0) index = 0
    this.drawPage(index)
  }
}

module.exports = ComicBook

