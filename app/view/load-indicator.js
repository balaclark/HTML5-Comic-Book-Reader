let EventEmitter = require('events').EventEmitter
let $ = require('jquery')
let template = require('./template/load-indicator.handlebars')

class LoadIndicator extends EventEmitter {
  constructor () {
    super()
    this.render().hide()
  }

  render () {
    this.$el = $(template())
    this.el = this.$el.get(0)
    return this
  }

  show () {
    this.$el.show()
    this.emit('show', this)
  }

  hide () {
    this.$el.hide()
    this.emit('hide', this)
  }
}

module.exports = LoadIndicator

