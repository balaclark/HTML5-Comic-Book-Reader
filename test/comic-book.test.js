let assert = require('assert')
let spy = require('spy')
let ComicBook = require('../app/comic-book')
let srcs = [
    'data:image/gif;base64,R0lGODlhAQABAPAAAKqqqv///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==',
    'data:image/gif;base64,R0lGODlhAQABAPAAALu7u////yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==',
    'data:image/gif;base64,R0lGODlhAQABAPAAAMzMzP///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==',
    'data:image/gif;base64,R0lGODlhAQABAPAAAN3d3f///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==',
    'data:image/gif;base64,R0lGODlhAQABAPAAAO7u7v///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=='
  ]

describe('ComicBook', () => {

  describe('preload images', () => {

    it('should preload all given image srcs and emit preload:image, preload:finish events', done => {
      let comic = new ComicBook(srcs)
      let loaded = []

      comic.on('preload:image', image => loaded.push(image.src))

      comic.on('preload:finish', () => {
        assert.deepEqual(loaded, srcs, 'all requested images should have been loaded')
        done()
      })

      comic.preload()
    })

    it('should only load a given amount of images at a time')

    it('should preload images in both directions')

    it('should emit a preload:start event', done => {
      let comic = new ComicBook(srcs)

      comic.on('preload:start', () => done())

      comic.preload()
    })

    it('should emit a preload:ready event', done => {
      let comic = new ComicBook(srcs)

      comic.preloadBuffer = 2

      comic.on('preload:ready', () => {
        assert.equal(comic.pages.size, 2)
        done()
      })

      comic.preload()
    })

    it('preload:ready should make sure that double page mode can show two images')

    it('should show the load indicator on preload:start', done => {
      let comic = new ComicBook(srcs)
      assert.equal(comic.loadIndicator.el.style.display, 'none')
      comic.loadIndicator.on('show', () => done())
      comic.preload()
    })

    it('should show the progress bar on preload:start', () => {
      let comic = new ComicBook(srcs)
      assert.equal(comic.progressBar.el.style.display, 'none')
      comic.preload()
      assert.equal(comic.progressBar.el.style.display, 'block')
    })

    it('should update the progress bar', done => {
      let comic = new ComicBook(srcs)

      comic.progressBar.update = spy()
      comic.preload()

      comic.on('preload:finish', () => {
        assert.equal(comic.progressBar.update.callCount, 5)
        assert(comic.progressBar.update.calls[0].calledWith(20))
        assert(comic.progressBar.update.calls[1].calledWith(40))
        assert(comic.progressBar.update.calls[2].calledWith(60))
        assert(comic.progressBar.update.calls[3].calledWith(80))
        assert(comic.progressBar.update.calls[4].calledWith(100))
        done()
      })
    })

    it('should hide the progress bar when finished', done => {
      let comic = new ComicBook(srcs)

      comic.preload()

      comic.on('preload:finish', () => {
        assert.equal(comic.progressBar.el.style.display, 'none')
        done()
      })
    })
  })

  it('should scroll to the top of the page on page turn')

})
