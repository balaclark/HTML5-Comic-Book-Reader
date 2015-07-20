let assert = require('assert')
let sinon = require('sinon')
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

      comic.progressBar.update = sinon.spy()
      comic.preload()

      comic.on('preload:finish', () => {
        assert.equal(comic.progressBar.update.callCount, 5)
        assert(comic.progressBar.update.getCall(0).calledWith(20))
        assert(comic.progressBar.update.getCall(1).calledWith(40))
        assert(comic.progressBar.update.getCall(2).calledWith(60))
        assert(comic.progressBar.update.getCall(3).calledWith(80))
        assert(comic.progressBar.update.getCall(4).calledWith(100))
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

    // FIXME
    it.skip('should be able to run without reloading already loaded images', done => {
      let comic = new ComicBook(srcs)
      let loaded = 0

      comic.on('preload:image', image => loaded++)
      comic.on('preload:finish', () => {
        assert.equal(loaded, srcs.length)
        done()
      })

      comic.preload()
      comic.preload()
      comic.preload()
    })

    it('should restart the preload from whatever page is requested', done => {
      let comic = new ComicBook(srcs)
      let loaded = []

      comic.on('preload:image', image => loaded.push(srcs.indexOf(image.src)))

      comic.on('preload:finish', () => {
        assert.deepEqual(loaded, [ 2, 3, 4, 0, 1 ])
        done()
      })

      comic.preload(2)
    })
  })

  describe('draw', () => {

    describe('drawPage()', () => {

      let comic

      beforeEach(done => {
        comic = new ComicBook(srcs)
        comic.on('preload:finish', done)
        comic.preload()
      })

      it('should draw a given page', () => {
        comic.canvas.drawImage = sinon.spy()

        comic.drawPage(1)

        assert.equal(comic.canvas.drawImage.callCount, 1)
        assert(comic.canvas.drawImage.getCall(0).calledWith(comic.pages.get(1)))
      })

      it('should default to drawing the current page', () => {
        comic.canvas.drawImage = sinon.spy()
        comic.currentPageIndex = 2

        comic.drawPage()

        assert.equal(comic.canvas.drawImage.callCount, 1)
        assert(comic.canvas.drawImage.getCall(0).calledWith(comic.pages.get(2)))
      })

      it('should update the current page index after drawing', () => {
        comic.canvas.drawImage = () => {}
        comic.currentPageIndex = 1

        comic.drawPage(2)

        assert.equal(comic.currentPageIndex, 2)
      })

      it('should ignore "Invalid image" exceptions and not draw the page when they occur', () => {
        comic.currentPageIndex = 1

        assert.doesNotThrow(comic.drawPage.bind(comic, 666))
        assert.equal(comic.currentPageIndex, 1)
      })

      it('should throw all other exceptions and not draw the page when they occur', () => {
        comic.canvas.drawImage = () => { throw new Error('Some other exception') }

        assert.throws(comic.drawPage.bind(comic))
      })

      it('should draw two pages in double page mode', done => {
        let comic = new ComicBook(srcs, { doublePage: true })

        comic.canvas.drawImage = sinon.spy()

        comic.on('preload:finish', () => {
          comic.drawPage(0)
          assert(comic.canvas.drawImage.calledWith(comic.pages.get(0), comic.pages.get(1)))
          done()
        })

        comic.preload()
      })

      it('should reverse page order in manga double page mode', done => {
        let comic = new ComicBook(srcs, {
          doublePage: true,
          rtl: true
        })

        comic.canvas.drawImage = sinon.spy()

        comic.on('preload:finish', () => {
          comic.drawPage(0)
          assert(comic.canvas.drawImage.calledWith(comic.pages.get(1), comic.pages.get(0)))
          done()
        })

        comic.preload()
      })

    })

    describe('drawNextPage()', () => {

      it('should draw the next page', done => {
        let comic = new ComicBook(srcs)

        comic.drawPage = sinon.spy()
        comic.currentPageIndex = 1

        comic.on('preload:finish', () => {
          comic.drawNextPage()
          assert(comic.drawPage.getCall(0).calledWith(2))
          done()
        })

        comic.preload()
      })

      it('should draw the next page in double page mode', done => {
        let comic = new ComicBook(srcs)

        comic.drawPage = sinon.spy()
        comic.currentPageIndex = 1
        comic.options.doublePage = true

        comic.on('preload:finish', () => {
          comic.drawNextPage()
          assert(comic.drawPage.getCall(0).calledWith(3))
          done()
        })

        comic.preload()
      })

      it('should handle the final page of double page mode being a single page', done => {
        let comic = new ComicBook(srcs)

        comic.drawPage = sinon.spy()
        comic.currentPageIndex = 3
        comic.options.doublePage = true

        comic.on('preload:finish', () => {
          comic.drawNextPage()
          assert(comic.drawPage.getCall(0).calledWith(4))
          done()
        })

        comic.preload()
      })
    })

    describe('drawPreviousPage()', () => {

      it('should draw the previous page', done => {
        let comic = new ComicBook(srcs)

        comic.drawPage = sinon.spy()
        comic.currentPageIndex = 2

        comic.on('preload:finish', () => {
          comic.drawPreviousPage()
          assert(comic.drawPage.getCall(0).calledWith(1))
          done()
        })

        comic.preload()
      })

      it('should draw the previous page in double page mode', done => {
        let comic = new ComicBook(srcs)

        comic.drawPage = sinon.spy()
        comic.currentPageIndex = 3
        comic.options.doublePage = true

        comic.on('preload:finish', () => {
          comic.drawPreviousPage()
          assert(comic.drawPage.getCall(0).calledWith(1))
          done()
        })

        comic.preload()
      })

      it('should handle navigating back to an uneven first page in double page mode', done => {
        let comic = new ComicBook(srcs)

        comic.drawPage = sinon.spy()
        comic.currentPageIndex = 1
        comic.options.doublePage = true

        comic.on('preload:finish', () => {
          comic.drawPreviousPage()
          assert(comic.drawPage.getCall(0).calledWith(0))
          done()
        })

        comic.preload()
      })
    })
  })

  describe('routing', () => {

    it('should scroll to the top of the page on page turn')

    it('should render a page when the route changes')
  })

})
