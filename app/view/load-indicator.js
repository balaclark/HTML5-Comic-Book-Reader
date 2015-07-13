'use strict'

let template = require('./template/load-indicator.handlebars')

module.exports = function loadIndicator () {
  console.log(template())
}
