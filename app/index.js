'use strict'

let loadIndicator = require('./view/load-indicator')

function ComicBook () {
  return {
    replace (selector) {
      console.log(selector, loadIndicator())
    }
  }
}

// TODO properly export in various formats
window.ComicBook = ComicBook

