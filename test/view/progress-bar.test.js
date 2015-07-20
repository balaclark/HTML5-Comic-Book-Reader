let assert = require('assert')
let ProgressBar = require('../../app/view/progress-bar')

describe('PreloadProgress', () => {

  it('should show', () => {
    let bar = new ProgressBar()
    bar.el.style.display = 'none'
    bar.show()
    assert.equal(bar.el.style.display, 'block')
  })

  it('should hide', () => {
    let bar = new ProgressBar()
    bar.el.style.display = 'block'
    bar.hide()
    assert.equal(bar.el.style.display, 'none')
  })

  it('should show on when preload is started', () => {
    let bar = new ProgressBar()
    assert.equal(bar.el.style.display, 'none')
  })

  it('should show the current percentage of the total preloading images', () => {
    let bar = new ProgressBar()
    bar.update(50)
    assert.equal(bar.progressEl.style.width, '50%')
  })

})

