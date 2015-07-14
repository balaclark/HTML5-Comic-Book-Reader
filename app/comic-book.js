module.exports = ComicBook

let loadIndicator = require('./view/load-indicator')

function ComicBook () {
  return {
    replace (selector) {
      console.log(selector, loadIndicator())
    }
  }
}

