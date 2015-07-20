let assert = require('assert')
let LoadIndicator = require('../../app/view/load-indicator')

describe('LoadIndicator', () => {

  it('should render on init', () => {
    let indicator = new LoadIndicator()
    assert.equal(indicator.el.outerHTML
      , '<div id="cb-loading-overlay" style="display: none; "></div>')
  })

  it('should show', () => {
    let indicator = new LoadIndicator()
    assert.equal(indicator.el.style.display, 'none')
    indicator.show()
    assert.equal(indicator.el.style.display, 'block')
  })

  it('should hide', () => {
    let indicator = new LoadIndicator()
    indicator.show()
    indicator.hide()
    assert.equal(indicator.el.style.display, 'none')
  })

  it('should emit a "show" event', done => {
    let indicator = new LoadIndicator()
    indicator.on('show', function (e) {
      assert.deepEqual(indicator, e)
      done()
    })
    indicator.show()
  })

  it('should emit a "hide" event', done => {
    let indicator = new LoadIndicator()
    indicator.on('hide', function (e) {
      assert.deepEqual(indicator, e)
      done()
    })
    indicator.hide()
  })

})
