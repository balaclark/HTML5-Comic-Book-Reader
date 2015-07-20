
module.exports = function makeImage (src, cb) {
  let image = new window.Image()
  image.onload = () => {
    cb(image)
  }
  image.src = src
}

