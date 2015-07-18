let template = require('./template/progress-bar.handlebars')

class ProgressBar {
  constructor () {
    this.createElements()
    this.hide()
  }

  createElements () {
    let el = document.createElement('div')
    el.innerHTML = template()
    this.el = el.firstChild
    this.progressEl = this.el.querySelector('.progressbar-value')
  }

  update (percentage) {
    this.progressEl.style.width = `${percentage}%`
  }

  show () {
    this.el.style.display = 'block'
  }

  hide () {
    this.el.style.display = 'none'
  }
}

module.exports = ProgressBar
