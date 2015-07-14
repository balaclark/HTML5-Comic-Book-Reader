let assert = require('chai').assert
let LoadIndicator = require('../../app/view/load-indicator')

describe('#loadIndicator()', function () {

  it('should render on init', function () {
    let indicator = new LoadIndicator()
    assert.equal(indicator.el.outerHTML
      , '<div id="cb-loading-overlay" class="cb-control" style="display: none; "></div>')
  })

  it('should show', function () {
    let indicator = new LoadIndicator()
    assert.equal(indicator.el.style.display, 'none')
    indicator.show()
    assert.equal(indicator.el.style.display, 'block')
  })

  it('should hide', function () {
    let indicator = new LoadIndicator()
    indicator.show()
    indicator.hide()
    assert.equal(indicator.el.style.display, 'none')
  })

  it('should emit a "show" event', function (done) {
    let indicator = new LoadIndicator()
    indicator.on('show', function (e) {
      assert.deepEqual(indicator, e)
      done()
    })
    indicator.show()
  })

  it('should emit a "hide" event', function (done) {
    let indicator = new LoadIndicator()
    indicator.on('hide', function (e) {
      assert.deepEqual(indicator, e)
      done()
    })
    indicator.hide()
  })

})
