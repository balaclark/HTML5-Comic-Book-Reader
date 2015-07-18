let EventEmitter = require('events').EventEmitter

class LoadIndicator extends EventEmitter {
  constructor () {
    super()
    this.render().hide()
  }

  render () {
    this.el = document.createElement('div')
    this.el.id = 'cb-loading-overlay'
    return this
  }

  show () {
    this.el.style.display = 'block'
    this.emit('show', this)
  }

  hide () {
    this.el.style.display = 'none'
    this.emit('hide', this)
  }
}

module.exports = LoadIndicator

