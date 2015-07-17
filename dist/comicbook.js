(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// let ComicBook = window.ComicBook = require('./comic-book')
'use strict';

var Canvas = require('./view/canvas');
var testImages = require('../test/data');
var fixtureImages = require('../test/fixture');
var imagediff = require('imagediff');

testImages.portrait1(function (testImage) {
  fixtureImages.singlePortrait(function (fixtureImage) {
    var canvas = new Canvas();
    canvas.drawImage(testImage);

    console.log(imagediff.equal(canvas.canvas, fixtureImage));

    console.log(testImage.width, testImage.height);
    console.log(fixtureImage.width, fixtureImage.height);
    console.log(canvas.canvas.width, canvas.canvas.height);

    document.body.appendChild(canvas.canvas);
  });
});

},{"../test/data":32,"../test/fixture":34,"./view/canvas":3,"imagediff":30}],2:[function(require,module,exports){
"use strict";

module.exports = function makeImage(src, cb) {
  var image = new window.Image();
  image.onload = function () {
    cb(image);
  };
  image.src = src;
};

},{}],3:[function(require,module,exports){
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var EventEmitter = require('events').EventEmitter;

var Canvas = (function (_EventEmitter) {
  _inherits(Canvas, _EventEmitter);

  function Canvas(options) {
    _classCallCheck(this, Canvas);

    _get(Object.getPrototypeOf(Canvas.prototype), 'constructor', this).call(this);

    this.options = _Object$assign({
      // fitWidth, fitWindow, manua
      zoomMode: 'fitWidth',
      // ltr, rtl
      readDirection: 'ltr',
      // should two pages be rendered at a time?
      doublePage: false
    }, options);

    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');

    this.on('draw:start', this.clearCanvas.bind(this));
  }

  _createClass(Canvas, [{
    key: 'getScale',
    value: function getScale() {}
  }, {
    key: 'fitCanvasToImage',
    value: function fitCanvasToImage(image) {
      // make sure the canvas is always at least full screen, even if the page is more narrow than the screen
      this.canvas.width = this.canvas.width < window.innerWidth ? window.innerWidth : this.canvas.width;
      this.canvas.height = this.canvas.height < window.innerHeight ? window.innerHeight : this.canvas.height;
    }
  }, {
    key: 'getDimensions',
    value: function getDimensions(image) {
      var dimensions = {
        width: image.width,
        height: image.height
      };
      return dimensions;
    }
  }, {
    key: 'getOffset',
    value: function getOffset(dimensions) {
      var offset = {
        width: 0,
        height: 0
      };

      // always keep pages centered
      if (this.options.zoomMode === 'manual' || this.options.zoomMode === 'fitWindow') {

        // work out a horizontal position
        if (this.canvas.width < window.innerWidth) {
          offset.width = (window.innerWidth - dimensions.width) / 2;
          if (this.options.doublePage) {
            offset.width = offset.width - dimensions.width / 2;
          }
        }

        // work out a vertical position
        if (this.canvas.height < window.innerHeight) {
          offset.height = (window.innerHeight - dimensions.height) / 2;
        }
      }

      return offset;
    }
  }, {
    key: 'clearCanvas',
    value: function clearCanvas() {
      this.canvas.width = 0;
      this.canvas.height = 0;
    }
  }, {
    key: 'drawImage',
    value: function drawImage(image, image2) {
      this.emit('draw:start');

      if (!(image instanceof window.Image) || this.options.doublePage && !(image2 instanceof window.Image)) {
        throw new Error('Invalid image');
      }

      this.fitCanvasToImage();

      var dimensions = this.getDimensions(image);
      var offset = this.getOffset(dimensions);

      this.context.drawImage(image, offset.width, offset.height, dimensions.width, dimensions.height);
      if (this.options.doublePage && image2) {
        this.context.drawImage(image2, dimensions.width + offset.width, offset.height, dimensions.width, dimensions.height);
      }

      this.emit('draw:finish');
    }
  }]);

  return Canvas;
})(EventEmitter);

module.exports = Canvas;

},{"babel-runtime/core-js/object/assign":4,"babel-runtime/helpers/class-call-check":8,"babel-runtime/helpers/create-class":9,"babel-runtime/helpers/get":10,"babel-runtime/helpers/inherits":11,"events":27}],4:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/assign"), __esModule: true };
},{"core-js/library/fn/object/assign":15}],5:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/create"), __esModule: true };
},{"core-js/library/fn/object/create":16}],6:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/define-property"), __esModule: true };
},{"core-js/library/fn/object/define-property":17}],7:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/get-own-property-descriptor"), __esModule: true };
},{"core-js/library/fn/object/get-own-property-descriptor":18}],8:[function(require,module,exports){
"use strict";

exports["default"] = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

exports.__esModule = true;
},{}],9:[function(require,module,exports){
"use strict";

var _Object$defineProperty = require("babel-runtime/core-js/object/define-property")["default"];

exports["default"] = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;

      _Object$defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();

exports.__esModule = true;
},{"babel-runtime/core-js/object/define-property":6}],10:[function(require,module,exports){
"use strict";

var _Object$getOwnPropertyDescriptor = require("babel-runtime/core-js/object/get-own-property-descriptor")["default"];

exports["default"] = function get(_x, _x2, _x3) {
  var _again = true;

  _function: while (_again) {
    var object = _x,
        property = _x2,
        receiver = _x3;
    desc = parent = getter = undefined;
    _again = false;
    if (object === null) object = Function.prototype;

    var desc = _Object$getOwnPropertyDescriptor(object, property);

    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);

      if (parent === null) {
        return undefined;
      } else {
        _x = parent;
        _x2 = property;
        _x3 = receiver;
        _again = true;
        continue _function;
      }
    } else if ("value" in desc) {
      return desc.value;
    } else {
      var getter = desc.get;

      if (getter === undefined) {
        return undefined;
      }

      return getter.call(receiver);
    }
  }
};

exports.__esModule = true;
},{"babel-runtime/core-js/object/get-own-property-descriptor":7}],11:[function(require,module,exports){
"use strict";

var _Object$create = require("babel-runtime/core-js/object/create")["default"];

exports["default"] = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = _Object$create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) subClass.__proto__ = superClass;
};

exports.__esModule = true;
},{"babel-runtime/core-js/object/create":5}],12:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],13:[function(require,module,exports){

},{}],14:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('is-array')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var rootParent = {}

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Note:
 *
 * - Implementation must support adding new properties to `Uint8Array` instances.
 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *    incorrect length in some situations.
 *
 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they will
 * get the Object implementation, which is slower but will work correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = (function () {
  function Foo () {}
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    arr.constructor = Foo
    return arr.foo() === 42 && // typed array instances can be augmented
        arr.constructor === Foo && // constructor can be set
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
})()

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (arg) {
  if (!(this instanceof Buffer)) {
    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
    if (arguments.length > 1) return new Buffer(arg, arguments[1])
    return new Buffer(arg)
  }

  this.length = 0
  this.parent = undefined

  // Common case.
  if (typeof arg === 'number') {
    return fromNumber(this, arg)
  }

  // Slightly less common case.
  if (typeof arg === 'string') {
    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
  }

  // Unusual.
  return fromObject(this, arg)
}

function fromNumber (that, length) {
  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < length; i++) {
      that[i] = 0
    }
  }
  return that
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

  // Assumption: byteLength() return value is always < kMaxLength.
  var length = byteLength(string, encoding) | 0
  that = allocate(that, length)

  that.write(string, encoding)
  return that
}

function fromObject (that, object) {
  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

  if (isArray(object)) return fromArray(that, object)

  if (object == null) {
    throw new TypeError('must start with number, buffer, array or string')
  }

  if (typeof ArrayBuffer !== 'undefined' && object.buffer instanceof ArrayBuffer) {
    return fromTypedArray(that, object)
  }

  if (object.length) return fromArrayLike(that, object)

  return fromJsonObject(that, object)
}

function fromBuffer (that, buffer) {
  var length = checked(buffer.length) | 0
  that = allocate(that, length)
  buffer.copy(that, 0, 0, length)
  return that
}

function fromArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Duplicate of fromArray() to keep fromArray() monomorphic.
function fromTypedArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  // Truncating the elements is probably not what people expect from typed
  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
  // of the old Buffer constructor.
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayLike (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
// Returns a zero-length buffer for inputs that don't conform to the spec.
function fromJsonObject (that, object) {
  var array
  var length = 0

  if (object.type === 'Buffer' && isArray(object.data)) {
    array = object.data
    length = checked(array.length) | 0
  }
  that = allocate(that, length)

  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function allocate (that, length) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return an object instance of the Buffer class
    that.length = length
    that._isBuffer = true
  }

  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
  if (fromPool) that.parent = rootParent

  return that
}

function checked (length) {
  // Note: cannot use `length < kMaxLength` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (subject, encoding) {
  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

  var buf = new Buffer(subject, encoding)
  delete buf.parent
  return buf
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  var i = 0
  var len = Math.min(x, y)
  while (i < len) {
    if (a[i] !== b[i]) break

    ++i
  }

  if (i !== len) {
    x = a[i]
    y = b[i]
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; i++) {
      length += list[i].length
    }
  }

  var buf = new Buffer(length)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

function byteLength (string, encoding) {
  if (typeof string !== 'string') string = '' + string

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'binary':
      // Deprecated
      case 'raw':
      case 'raws':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

// pre-set for values that may exist in the future
Buffer.prototype.length = undefined
Buffer.prototype.parent = undefined

function slowToString (encoding, start, end) {
  var loweredCase = false

  start = start | 0
  end = end === undefined || end === Infinity ? this.length : end | 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return 0
  return Buffer.compare(this, b)
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
  byteOffset >>= 0

  if (this.length === 0) return -1
  if (byteOffset >= this.length) return -1

  // Negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

  if (typeof val === 'string') {
    if (val.length === 0) return -1 // special case: looking for empty string always fails
    return String.prototype.indexOf.call(this, val, byteOffset)
  }
  if (Buffer.isBuffer(val)) {
    return arrayIndexOf(this, val, byteOffset)
  }
  if (typeof val === 'number') {
    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
    }
    return arrayIndexOf(this, [ val ], byteOffset)
  }

  function arrayIndexOf (arr, val, byteOffset) {
    var foundIndex = -1
    for (var i = 0; byteOffset + i < arr.length; i++) {
      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
      } else {
        foundIndex = -1
      }
    }
    return -1
  }

  throw new TypeError('val must be string, number or Buffer')
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function get (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function set (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) throw new Error('Invalid hex string')
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    var swap = encoding
    encoding = offset
    offset = length | 0
    length = swap
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'binary':
        return binaryWrite(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function binarySlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
  }

  if (newBuf.length) newBuf.parent = this.parent || this

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = value
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = value
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = value
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
  if (offset < 0) throw new RangeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < len; i++) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), targetStart)
  }

  return len
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new RangeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function _augment (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array set method before overwriting
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.indexOf = BP.indexOf
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUIntLE = BP.readUIntLE
  arr.readUIntBE = BP.readUIntBE
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readIntLE = BP.readIntLE
  arr.readIntBE = BP.readIntBE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUIntLE = BP.writeUIntLE
  arr.writeUIntBE = BP.writeUIntBE
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeIntLE = BP.writeIntLE
  arr.writeIntBE = BP.writeIntBE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-z\-]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []
  var i = 0

  for (; i < length; i++) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (leadSurrogate) {
        // 2 leads in a row
        if (codePoint < 0xDC00) {
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          leadSurrogate = codePoint
          continue
        } else {
          // valid surrogate pair
          codePoint = leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00 | 0x10000
          leadSurrogate = null
        }
      } else {
        // no lead yet

        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else {
          // valid lead
          leadSurrogate = codePoint
          continue
        }
      }
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
      leadSurrogate = null
    }

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x200000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

},{"base64-js":12,"ieee754":28,"is-array":31}],15:[function(require,module,exports){
require('../../modules/es6.object.assign');
module.exports = require('../../modules/$').core.Object.assign;
},{"../../modules/$":24,"../../modules/es6.object.assign":25}],16:[function(require,module,exports){
var $ = require('../../modules/$');
module.exports = function create(P, D){
  return $.create(P, D);
};
},{"../../modules/$":24}],17:[function(require,module,exports){
var $ = require('../../modules/$');
module.exports = function defineProperty(it, key, desc){
  return $.setDesc(it, key, desc);
};
},{"../../modules/$":24}],18:[function(require,module,exports){
var $ = require('../../modules/$');
require('../../modules/es6.object.statics-accept-primitives');
module.exports = function getOwnPropertyDescriptor(it, key){
  return $.getDesc(it, key);
};
},{"../../modules/$":24,"../../modules/es6.object.statics-accept-primitives":26}],19:[function(require,module,exports){
var $        = require('./$')
  , enumKeys = require('./$.enum-keys');
// 19.1.2.1 Object.assign(target, source, ...)
/* eslint-disable no-unused-vars */
module.exports = Object.assign || function assign(target, source){
/* eslint-enable no-unused-vars */
  var T = Object($.assertDefined(target))
    , l = arguments.length
    , i = 1;
  while(l > i){
    var S      = $.ES5Object(arguments[i++])
      , keys   = enumKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)T[key = keys[j++]] = S[key];
  }
  return T;
};
},{"./$":24,"./$.enum-keys":21}],20:[function(require,module,exports){
var $          = require('./$')
  , global     = $.g
  , core       = $.core
  , isFunction = $.isFunction;
function ctx(fn, that){
  return function(){
    return fn.apply(that, arguments);
  };
}
// type bitmap
$def.F = 1;  // forced
$def.G = 2;  // global
$def.S = 4;  // static
$def.P = 8;  // proto
$def.B = 16; // bind
$def.W = 32; // wrap
function $def(type, name, source){
  var key, own, out, exp
    , isGlobal = type & $def.G
    , isProto  = type & $def.P
    , target   = isGlobal ? global : type & $def.S
        ? global[name] : (global[name] || {}).prototype
    , exports  = isGlobal ? core : core[name] || (core[name] = {});
  if(isGlobal)source = name;
  for(key in source){
    // contains in native
    own = !(type & $def.F) && target && key in target;
    if(own && key in exports)continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    if(isGlobal && !isFunction(target[key]))exp = source[key];
    // bind timers to global for call from export context
    else if(type & $def.B && own)exp = ctx(out, global);
    // wrap global constructors for prevent change them in library
    else if(type & $def.W && target[key] == out)!function(C){
      exp = function(param){
        return this instanceof C ? new C(param) : C(param);
      };
      exp.prototype = C.prototype;
    }(out);
    else exp = isProto && isFunction(out) ? ctx(Function.call, out) : out;
    // export
    exports[key] = exp;
    if(isProto)(exports.prototype || (exports.prototype = {}))[key] = out;
  }
}
module.exports = $def;
},{"./$":24}],21:[function(require,module,exports){
var $ = require('./$');
module.exports = function(it){
  var keys       = $.getKeys(it)
    , getDesc    = $.getDesc
    , getSymbols = $.getSymbols;
  if(getSymbols)$.each.call(getSymbols(it), function(key){
    if(getDesc(it, key).enumerable)keys.push(key);
  });
  return keys;
};
},{"./$":24}],22:[function(require,module,exports){
module.exports = function($){
  $.FW   = false;
  $.path = $.core;
  return $;
};
},{}],23:[function(require,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var $ = require('./$')
  , toString = {}.toString
  , getNames = $.getNames;

var windowNames = typeof window == 'object' && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

function getWindowNames(it){
  try {
    return getNames(it);
  } catch(e){
    return windowNames.slice();
  }
}

module.exports.get = function getOwnPropertyNames(it){
  if(windowNames && toString.call(it) == '[object Window]')return getWindowNames(it);
  return getNames($.toObject(it));
};
},{"./$":24}],24:[function(require,module,exports){
'use strict';
var global = typeof self != 'undefined' ? self : Function('return this')()
  , core   = {}
  , defineProperty = Object.defineProperty
  , hasOwnProperty = {}.hasOwnProperty
  , ceil  = Math.ceil
  , floor = Math.floor
  , max   = Math.max
  , min   = Math.min;
// The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
var DESC = !!function(){
  try {
    return defineProperty({}, 'a', {get: function(){ return 2; }}).a == 2;
  } catch(e){ /* empty */ }
}();
var hide = createDefiner(1);
// 7.1.4 ToInteger
function toInteger(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
}
function desc(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
}
function simpleSet(object, key, value){
  object[key] = value;
  return object;
}
function createDefiner(bitmap){
  return DESC ? function(object, key, value){
    return $.setDesc(object, key, desc(bitmap, value));
  } : simpleSet;
}

function isObject(it){
  return it !== null && (typeof it == 'object' || typeof it == 'function');
}
function isFunction(it){
  return typeof it == 'function';
}
function assertDefined(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
}

var $ = module.exports = require('./$.fw')({
  g: global,
  core: core,
  html: global.document && document.documentElement,
  // http://jsperf.com/core-js-isobject
  isObject:   isObject,
  isFunction: isFunction,
  that: function(){
    return this;
  },
  // 7.1.4 ToInteger
  toInteger: toInteger,
  // 7.1.15 ToLength
  toLength: function(it){
    return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
  },
  toIndex: function(index, length){
    index = toInteger(index);
    return index < 0 ? max(index + length, 0) : min(index, length);
  },
  has: function(it, key){
    return hasOwnProperty.call(it, key);
  },
  create:     Object.create,
  getProto:   Object.getPrototypeOf,
  DESC:       DESC,
  desc:       desc,
  getDesc:    Object.getOwnPropertyDescriptor,
  setDesc:    defineProperty,
  setDescs:   Object.defineProperties,
  getKeys:    Object.keys,
  getNames:   Object.getOwnPropertyNames,
  getSymbols: Object.getOwnPropertySymbols,
  assertDefined: assertDefined,
  // Dummy, fix for not array-like ES3 string in es5 module
  ES5Object: Object,
  toObject: function(it){
    return $.ES5Object(assertDefined(it));
  },
  hide: hide,
  def: createDefiner(0),
  set: global.Symbol ? simpleSet : hide,
  each: [].forEach
});
/* eslint-disable no-undef */
if(typeof __e != 'undefined')__e = core;
if(typeof __g != 'undefined')__g = global;
},{"./$.fw":22}],25:[function(require,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $def = require('./$.def');
$def($def.S, 'Object', {assign: require('./$.assign')});
},{"./$.assign":19,"./$.def":20}],26:[function(require,module,exports){
var $        = require('./$')
  , $def     = require('./$.def')
  , isObject = $.isObject
  , toObject = $.toObject;
$.each.call(('freeze,seal,preventExtensions,isFrozen,isSealed,isExtensible,' +
  'getOwnPropertyDescriptor,getPrototypeOf,keys,getOwnPropertyNames').split(',')
, function(KEY, ID){
  var fn     = ($.core.Object || {})[KEY] || Object[KEY]
    , forced = 0
    , method = {};
  method[KEY] = ID == 0 ? function freeze(it){
    return isObject(it) ? fn(it) : it;
  } : ID == 1 ? function seal(it){
    return isObject(it) ? fn(it) : it;
  } : ID == 2 ? function preventExtensions(it){
    return isObject(it) ? fn(it) : it;
  } : ID == 3 ? function isFrozen(it){
    return isObject(it) ? fn(it) : true;
  } : ID == 4 ? function isSealed(it){
    return isObject(it) ? fn(it) : true;
  } : ID == 5 ? function isExtensible(it){
    return isObject(it) ? fn(it) : false;
  } : ID == 6 ? function getOwnPropertyDescriptor(it, key){
    return fn(toObject(it), key);
  } : ID == 7 ? function getPrototypeOf(it){
    return fn(Object($.assertDefined(it)));
  } : ID == 8 ? function keys(it){
    return fn(toObject(it));
  } : require('./$.get-names').get;
  try {
    fn('z');
  } catch(e){
    forced = 1;
  }
  $def($def.S + $def.F * forced, 'Object', method);
});
},{"./$":24,"./$.def":20,"./$.get-names":23}],27:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],28:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],29:[function(require,module,exports){
"use strict";

module.exports = function Canvas () {
  return document.createElement('canvas');
};

},{}],30:[function(require,module,exports){
(function (Buffer){
// js-imagediff 1.0.3
// (c) 2011-2012 Carl Sutherland, Humble Software
// Distributed under the MIT License
// For original source and documentation visit:
// http://www.github.com/HumbleSoftware/js-imagediff

(function (name, definition) {
  var root = this;
  if (typeof module !== 'undefined') {
    try {
      var Canvas = require('canvas');
    } catch (e) {
      throw new Error(
        e.message + '\n' +
        'Please see https://github.com/HumbleSoftware/js-imagediff#cannot-find-module-canvas\n'
      );
    }
    module.exports = definition(root, name, Canvas);
  } else if (typeof define === 'function' && typeof define.amd === 'object') {
    define(definition);
  } else {
    root[name] = definition(root, name);
  }
})('imagediff', function (root, name, Canvas) {

  var
    TYPE_ARRAY        = /\[object Array\]/i,
    TYPE_CANVAS       = /\[object (Canvas|HTMLCanvasElement)\]/i,
    TYPE_CONTEXT      = /\[object CanvasRenderingContext2D\]/i,
    TYPE_IMAGE        = /\[object (Image|HTMLImageElement)\]/i,
    TYPE_IMAGE_DATA   = /\[object ImageData\]/i,

    UNDEFINED         = 'undefined',

    canvas            = getCanvas(),
    context           = canvas.getContext('2d'),
    previous          = root[name],
    imagediff, jasmine;

  // Creation
  function getCanvas (width, height) {
    var
      canvas = Canvas ?
        new Canvas() :
        document.createElement('canvas');
    if (width) canvas.width = width;
    if (height) canvas.height = height;
    return canvas;
  }
  function getImageData (width, height) {
    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);
    return context.createImageData(width, height);
  }
  // expost canvas module
  function getCanvasRef() {
    return Canvas;
  }


  // Type Checking
  function isImage (object) {
    return isType(object, TYPE_IMAGE);
  }
  function isCanvas (object) {
    return isType(object, TYPE_CANVAS);
  }
  function isContext (object) {
    return isType(object, TYPE_CONTEXT);
  }
  function isImageData (object) {
    return !!(object &&
      isType(object, TYPE_IMAGE_DATA) &&
      typeof(object.width) !== UNDEFINED &&
      typeof(object.height) !== UNDEFINED &&
      typeof(object.data) !== UNDEFINED);
  }
  function isImageType (object) {
    return (
      isImage(object) ||
      isCanvas(object) ||
      isContext(object) ||
      isImageData(object)
    );
  }
  function isType (object, type) {
    return typeof (object) === 'object' && !!Object.prototype.toString.apply(object).match(type);
  }


  // Type Conversion
  function copyImageData (imageData) {
    var
      height = imageData.height,
      width = imageData.width,
      data = imageData.data,
      newImageData, newData, i;

    canvas.width = width;
    canvas.height = height;
    newImageData = context.getImageData(0, 0, width, height);
    newData = newImageData.data;

    for (i = imageData.data.length; i--;) {
        newData[i] = data[i];
    }

    return newImageData;
  }
  function toImageData (object) {
    if (isImage(object)) { return toImageDataFromImage(object); }
    if (isCanvas(object)) { return toImageDataFromCanvas(object); }
    if (isContext(object)) { return toImageDataFromContext(object); }
    if (isImageData(object)) { return object; }
  }
  function toImageDataFromImage (image) {
    var
      height = image.height,
      width = image.width;
    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0);
    return context.getImageData(0, 0, width, height);
  }
  function toImageDataFromCanvas (canvas) {
    var
      height = canvas.height,
      width = canvas.width,
      context = canvas.getContext('2d');
    return context.getImageData(0, 0, width, height);
  }
  function toImageDataFromContext (context) {
    var
      canvas = context.canvas,
      height = canvas.height,
      width = canvas.width;
    return context.getImageData(0, 0, width, height);
  }
  function toCanvas (object) {
    var
      data = toImageData(object),
      canvas = getCanvas(data.width, data.height),
      context = canvas.getContext('2d');

    context.putImageData(data, 0, 0);
    return canvas;
  }


  // ImageData Equality Operators
  function equalWidth (a, b) {
    return a.width === b.width;
  }
  function equalHeight (a, b) {
    return a.height === b.height;
  }
  function equalDimensions (a, b) {
    return equalHeight(a, b) && equalWidth(a, b);
  }
  function equal (a, b, tolerance) {

    var
      aData     = a.data,
      bData     = b.data,
      length    = aData.length,
      i;

    tolerance = tolerance || 0;

    if (!equalDimensions(a, b)) return false;
    for (i = length; i--;) if (aData[i] !== bData[i] && Math.abs(aData[i] - bData[i]) > tolerance) return false;

    return true;
  }


  // Diff
  function diff (a, b, options) {
    return (equalDimensions(a, b) ? diffEqual : diffUnequal)(a, b, options);
  }
  function diffEqual (a, b, options) {

    var
      height  = a.height,
      width   = a.width,
      c       = getImageData(width, height), // c = a - b
      aData   = a.data,
      bData   = b.data,
      cData   = c.data,
      length  = cData.length,
      row, column,
      i, j, k, v;

    for (i = 0; i < length; i += 4) {
      cData[i] = Math.abs(aData[i] - bData[i]);
      cData[i+1] = Math.abs(aData[i+1] - bData[i+1]);
      cData[i+2] = Math.abs(aData[i+2] - bData[i+2]);
      cData[i+3] = Math.abs(255 - Math.abs(aData[i+3] - bData[i+3]));
    }

    return c;
  }
  function diffUnequal (a, b, options) {

    var
      height  = Math.max(a.height, b.height),
      width   = Math.max(a.width, b.width),
      c       = getImageData(width, height), // c = a - b
      aData   = a.data,
      bData   = b.data,
      cData   = c.data,
      align   = options && options.align,
      rowOffset,
      columnOffset,
      row, column,
      i, j, k, v;


    for (i = cData.length - 1; i > 0; i = i - 4) {
      cData[i] = 255;
    }

    // Add First Image
    offsets(a);
    for (row = a.height; row--;){
      for (column = a.width; column--;) {
        i = 4 * ((row + rowOffset) * width + (column + columnOffset));
        j = 4 * (row * a.width + column);
        cData[i+0] = aData[j+0]; // r
        cData[i+1] = aData[j+1]; // g
        cData[i+2] = aData[j+2]; // b
        // cData[i+3] = aData[j+3]; // a
      }
    }

    // Subtract Second Image
    offsets(b);
    for (row = b.height; row--;){
      for (column = b.width; column--;) {
        i = 4 * ((row + rowOffset) * width + (column + columnOffset));
        j = 4 * (row * b.width + column);
        cData[i+0] = Math.abs(cData[i+0] - bData[j+0]); // r
        cData[i+1] = Math.abs(cData[i+1] - bData[j+1]); // g
        cData[i+2] = Math.abs(cData[i+2] - bData[j+2]); // b
      }
    }

    // Helpers
    function offsets (imageData) {
      if (align === 'top') {
        rowOffset = 0;
        columnOffset = 0;
      } else {
        rowOffset = Math.floor((height - imageData.height) / 2);
        columnOffset = Math.floor((width - imageData.width) / 2);
      }
    }

    return c;
  }


  // Validation
  function checkType () {
    var i;
    for (i = 0; i < arguments.length; i++) {
      if (!isImageType(arguments[i])) {
        throw {
          name : 'ImageTypeError',
          message : 'Submitted object was not an image.'
        };
      }
    }
  }


  // Jasmine Matchers
  function get (element, content) {
    element = document.createElement(element);
    if (element && content) {
      element.innerHTML = content;
    }
    return element;
  }

  jasmine = {

    toBeImageData : function () {
      return imagediff.isImageData(this.actual);
    },

    toImageDiffEqual : function (expected, tolerance) {

      if (typeof (document) !== UNDEFINED) {
        this.message = function () {
          var
            div     = get('div'),
            a       = get('div', '<div>Actual:</div>'),
            b       = get('div', '<div>Expected:</div>'),
            c       = get('div', '<div>Diff:</div>'),
            diff    = imagediff.diff(this.actual, expected),
            canvas  = getCanvas(),
            context;

          canvas.height = diff.height;
          canvas.width  = diff.width;

          div.style.overflow = 'hidden';
          a.style.float = 'left';
          b.style.float = 'left';
          c.style.float = 'left';

          context = canvas.getContext('2d');
          context.putImageData(diff, 0, 0);

          a.appendChild(toCanvas(this.actual));
          b.appendChild(toCanvas(expected));
          c.appendChild(canvas);

          div.appendChild(a);
          div.appendChild(b);
          div.appendChild(c);

          return [
            div,
            "Expected not to be equal."
          ];
        };
      }

      return imagediff.equal(this.actual, expected, tolerance);
    }
  };


  // Image Output
  function imageDataToPNG (imageData, outputFile, callback) {

    var
      canvas = toCanvas(imageData),
      base64Data,
      decodedImage;

    callback = callback || Function;

    base64Data = canvas.toDataURL().replace(/^data:image\/\w+;base64,/,"");
    decodedImage = new Buffer(base64Data, 'base64');
    require('fs').writeFile(outputFile, decodedImage, callback);
  }


  // Definition
  imagediff = {

    createCanvas : getCanvas,
    createImageData : getImageData,
    getCanvasRef: getCanvasRef,

    isImage : isImage,
    isCanvas : isCanvas,
    isContext : isContext,
    isImageData : isImageData,
    isImageType : isImageType,

    toImageData : function (object) {
      checkType(object);
      if (isImageData(object)) { return copyImageData(object); }
      return toImageData(object);
    },

    equal : function (a, b, tolerance) {
      checkType(a, b);
      a = toImageData(a);
      b = toImageData(b);
      return equal(a, b, tolerance);
    },
    diff : function (a, b, options) {
      checkType(a, b);
      a = toImageData(a);
      b = toImageData(b);
      return diff(a, b, options);
    },

    jasmine : jasmine,

    // Compatibility
    noConflict : function () {
      root[name] = previous;
      return imagediff;
    }
  };

  if (typeof module !== 'undefined') {
    imagediff.imageDataToPNG = imageDataToPNG;
  }

  return imagediff;
});

}).call(this,require("buffer").Buffer)

},{"buffer":14,"canvas":29,"fs":13}],31:[function(require,module,exports){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

},{}],32:[function(require,module,exports){
'use strict';

module.exports = {
  portrait1: require('./portrait1')
};

},{"./portrait1":33}],33:[function(require,module,exports){
'use strict';

var makeImage = require('../../app/lib/make-image');

module.exports = function (cb) {
  makeImage('data:image/jpg;base64,\n/9j/4AAQSkZJRgABAQEASABIAAD/4QCMRXhpZgAATU0AKgAAAAgABQESAAMAAAAB\nAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAIdpAAQAAAAB\nAAAAWgAAAAAAAABIAAAAAQAAAEgAAAABAAOgAQADAAAAAQABAACgAgAEAAAAAQAA\nAGSgAwAEAAAAAQAAAJMAAAAA/+0AOFBob3Rvc2hvcCAzLjAAOEJJTQQEAAAAAAAA\nOEJJTQQlAAAAAAAQ1B2M2Y8AsgTpgAmY7PhCfv/iDFhJQ0NfUFJPRklMRQABAQAA\nDEhMaW5vAhAAAG1udHJSR0IgWFlaIAfOAAIACQAGADEAAGFjc3BNU0ZUAAAAAElF\nQyBzUkdCAAAAAAAAAAAAAAAAAAD21gABAAAAANMtSFAgIAAAAAAAAAAAAAAAAAAA\nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEWNwcnQAAAFQAAAAM2Rl\nc2MAAAGEAAAAbHd0cHQAAAHwAAAAFGJrcHQAAAIEAAAAFHJYWVoAAAIYAAAAFGdY\nWVoAAAIsAAAAFGJYWVoAAAJAAAAAFGRtbmQAAAJUAAAAcGRtZGQAAALEAAAAiHZ1\nZWQAAANMAAAAhnZpZXcAAAPUAAAAJGx1bWkAAAP4AAAAFG1lYXMAAAQMAAAAJHRl\nY2gAAAQwAAAADHJUUkMAAAQ8AAAIDGdUUkMAAAQ8AAAIDGJUUkMAAAQ8AAAIDHRl\neHQAAAAAQ29weXJpZ2h0IChjKSAxOTk4IEhld2xldHQtUGFja2FyZCBDb21wYW55\nAABkZXNjAAAAAAAAABJzUkdCIElFQzYxOTY2LTIuMQAAAAAAAAAAAAAAEnNSR0Ig\nSUVDNjE5NjYtMi4xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\nAAAAAAAAAAAAAAAAAABYWVogAAAAAAAA81EAAQAAAAEWzFhZWiAAAAAAAAAAAAAA\nAAAAAAAAWFlaIAAAAAAAAG+iAAA49QAAA5BYWVogAAAAAAAAYpkAALeFAAAY2lhZ\nWiAAAAAAAAAkoAAAD4QAALbPZGVzYwAAAAAAAAAWSUVDIGh0dHA6Ly93d3cuaWVj\nLmNoAAAAAAAAAAAAAAAWSUVDIGh0dHA6Ly93d3cuaWVjLmNoAAAAAAAAAAAAAAAA\nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGRlc2MAAAAAAAAALklF\nQyA2MTk2Ni0yLjEgRGVmYXVsdCBSR0IgY29sb3VyIHNwYWNlIC0gc1JHQgAAAAAA\nAAAAAAAALklFQyA2MTk2Ni0yLjEgRGVmYXVsdCBSR0IgY29sb3VyIHNwYWNlIC0g\nc1JHQgAAAAAAAAAAAAAAAAAAAAAAAAAAAABkZXNjAAAAAAAAACxSZWZlcmVuY2Ug\nVmlld2luZyBDb25kaXRpb24gaW4gSUVDNjE5NjYtMi4xAAAAAAAAAAAAAAAsUmVm\nZXJlbmNlIFZpZXdpbmcgQ29uZGl0aW9uIGluIElFQzYxOTY2LTIuMQAAAAAAAAAA\nAAAAAAAAAAAAAAAAAAAAAAAAdmlldwAAAAAAE6T+ABRfLgAQzxQAA+3MAAQTCwAD\nXJ4AAAABWFlaIAAAAAAATAlWAFAAAABXH+dtZWFzAAAAAAAAAAEAAAAAAAAAAAAA\nAAAAAAAAAAACjwAAAAJzaWcgAAAAAENSVCBjdXJ2AAAAAAAABAAAAAAFAAoADwAU\nABkAHgAjACgALQAyADcAOwBAAEUASgBPAFQAWQBeAGMAaABtAHIAdwB8AIEAhgCL\nAJAAlQCaAJ8ApACpAK4AsgC3ALwAwQDGAMsA0ADVANsA4ADlAOsA8AD2APsBAQEH\nAQ0BEwEZAR8BJQErATIBOAE+AUUBTAFSAVkBYAFnAW4BdQF8AYMBiwGSAZoBoQGp\nAbEBuQHBAckB0QHZAeEB6QHyAfoCAwIMAhQCHQImAi8COAJBAksCVAJdAmcCcQJ6\nAoQCjgKYAqICrAK2AsECywLVAuAC6wL1AwADCwMWAyEDLQM4A0MDTwNaA2YDcgN+\nA4oDlgOiA64DugPHA9MD4APsA/kEBgQTBCAELQQ7BEgEVQRjBHEEfgSMBJoEqAS2\nBMQE0wThBPAE/gUNBRwFKwU6BUkFWAVnBXcFhgWWBaYFtQXFBdUF5QX2BgYGFgYn\nBjcGSAZZBmoGewaMBp0GrwbABtEG4wb1BwcHGQcrBz0HTwdhB3QHhgeZB6wHvwfS\nB+UH+AgLCB8IMghGCFoIbgiCCJYIqgi+CNII5wj7CRAJJQk6CU8JZAl5CY8JpAm6\nCc8J5Qn7ChEKJwo9ClQKagqBCpgKrgrFCtwK8wsLCyILOQtRC2kLgAuYC7ALyAvh\nC/kMEgwqDEMMXAx1DI4MpwzADNkM8w0NDSYNQA1aDXQNjg2pDcMN3g34DhMOLg5J\nDmQOfw6bDrYO0g7uDwkPJQ9BD14Peg+WD7MPzw/sEAkQJhBDEGEQfhCbELkQ1xD1\nERMRMRFPEW0RjBGqEckR6BIHEiYSRRJkEoQSoxLDEuMTAxMjE0MTYxODE6QTxRPl\nFAYUJxRJFGoUixStFM4U8BUSFTQVVhV4FZsVvRXgFgMWJhZJFmwWjxayFtYW+hcd\nF0EXZReJF64X0hf3GBsYQBhlGIoYrxjVGPoZIBlFGWsZkRm3Gd0aBBoqGlEadxqe\nGsUa7BsUGzsbYxuKG7Ib2hwCHCocUhx7HKMczBz1HR4dRx1wHZkdwx3sHhYeQB5q\nHpQevh7pHxMfPh9pH5Qfvx/qIBUgQSBsIJggxCDwIRwhSCF1IaEhziH7IiciVSKC\nIq8i3SMKIzgjZiOUI8Ij8CQfJE0kfCSrJNolCSU4JWgllyXHJfcmJyZXJocmtybo\nJxgnSSd6J6sn3CgNKD8ocSiiKNQpBik4KWspnSnQKgIqNSpoKpsqzysCKzYraSud\nK9EsBSw5LG4soizXLQwtQS12Last4S4WLkwugi63Lu4vJC9aL5Evxy/+MDUwbDCk\nMNsxEjFKMYIxujHyMioyYzKbMtQzDTNGM38zuDPxNCs0ZTSeNNg1EzVNNYc1wjX9\nNjc2cjauNuk3JDdgN5w31zgUOFA4jDjIOQU5Qjl/Obw5+To2OnQ6sjrvOy07azuq\nO+g8JzxlPKQ84z0iPWE9oT3gPiA+YD6gPuA/IT9hP6I/4kAjQGRApkDnQSlBakGs\nQe5CMEJyQrVC90M6Q31DwEQDREdEikTORRJFVUWaRd5GIkZnRqtG8Ec1R3tHwEgF\nSEtIkUjXSR1JY0mpSfBKN0p9SsRLDEtTS5pL4kwqTHJMuk0CTUpNk03cTiVObk63\nTwBPSU+TT91QJ1BxULtRBlFQUZtR5lIxUnxSx1MTU19TqlP2VEJUj1TbVShVdVXC\nVg9WXFapVvdXRFeSV+BYL1h9WMtZGllpWbhaB1pWWqZa9VtFW5Vb5Vw1XIZc1l0n\nXXhdyV4aXmxevV8PX2Ffs2AFYFdgqmD8YU9homH1YklinGLwY0Njl2PrZEBklGTp\nZT1lkmXnZj1mkmboZz1nk2fpaD9olmjsaUNpmmnxakhqn2r3a09rp2v/bFdsr20I\nbWBtuW4SbmtuxG8eb3hv0XArcIZw4HE6cZVx8HJLcqZzAXNdc7h0FHRwdMx1KHWF\ndeF2Pnabdvh3VnezeBF4bnjMeSp5iXnnekZ6pXsEe2N7wnwhfIF84X1BfaF+AX5i\nfsJ/I3+Ef+WAR4CogQqBa4HNgjCCkoL0g1eDuoQdhICE44VHhauGDoZyhteHO4ef\niASIaYjOiTOJmYn+imSKyoswi5aL/IxjjMqNMY2Yjf+OZo7OjzaPnpAGkG6Q1pE/\nkaiSEZJ6kuOTTZO2lCCUipT0lV+VyZY0lp+XCpd1l+CYTJi4mSSZkJn8mmia1ZtC\nm6+cHJyJnPedZJ3SnkCerp8dn4uf+qBpoNihR6G2oiailqMGo3aj5qRWpMelOKWp\nphqmi6b9p26n4KhSqMSpN6mpqhyqj6sCq3Wr6axcrNCtRK24ri2uoa8Wr4uwALB1\nsOqxYLHWskuywrM4s660JbSctRO1irYBtnm28Ldot+C4WbjRuUq5wro7urW7Lrun\nvCG8m70VvY++Cr6Evv+/er/1wHDA7MFnwePCX8Lbw1jD1MRRxM7FS8XIxkbGw8dB\nx7/IPci8yTrJuco4yrfLNsu2zDXMtc01zbXONs62zzfPuNA50LrRPNG+0j/SwdNE\n08bUSdTL1U7V0dZV1tjXXNfg2GTY6Nls2fHadtr724DcBdyK3RDdlt4c3qLfKd+v\n4DbgveFE4cziU+Lb42Pj6+Rz5PzlhOYN5pbnH+ep6DLovOlG6dDqW+rl63Dr++yG\n7RHtnO4o7rTvQO/M8Fjw5fFy8f/yjPMZ86f0NPTC9VD13vZt9vv3ivgZ+Kj5OPnH\n+lf65/t3/Af8mP0p/br+S/7c/23////AABEIAJMAZAMBEgACEQEDEQH/xAAfAAAB\nBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAC1EAACAQMDAgQDBQUEBAAAAX0B\nAgMABBEFEiExQQYTUWEHInEUMoGRoQgjQrHBFVLR8CQzYnKCCQoWFxgZGiUmJygp\nKjQ1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoOEhYaHiImK\nkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4eLj\n5OXm5+jp6vHy8/T19vf4+fr/xAAfAQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJ\nCgv/xAC1EQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGh\nscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZ\nWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1\ntre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2wBDAAUD\nBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0d\nHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4e\nHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/3QAEAA3/2gAMAwEA\nAhEDEQA/APjmigAp0aNIwVcZP+f8igBoGTgV9T/Cr9nax0XRn134vyNpH28rZ6TY\nrcxiZrlz8jPnMfUAKjFlJb5x0AAPKPhz8CfiN45tYb7SdBaOxmj82O6vJ0t43TOA\ny7ssynsQuDjrXTfGTxV8WfCHj640vxTrl/A0tpLbQSF4fN/s+V2VD+42qWC7tpIG\nGL4GMEAFnWf2YvEcdvNbeH/EvhjxJrlqu660nTrzFzGBgMQHODtJAIO3r+FeZ6D8\nRfEHhmK3t/Cl5Jo0UFytwZLYBZrl1+60zHPmYycIfkGfunrQBD8Qfh14v8BSWkXi\nrRbjTJLxXaBJniLOF+8QEdjgZ68V7H4I+Lvgvxfay6Z8Zp9f1BrjT5IDf3DRXUEE\nxyVmSKKJZImXoCpPXnOc0AfN9dF4+8OQeG9ZFtZa5peuWUsfm219YS7o5o8lQSp5\njfj5kPKnuRQBztFABRQAUUAFFABRQAUUAf/Q+OaKAPVv2U9TTTvjVoCvplpqH2yc\n2apcgFEaTG2T7p+4U3D3xyOa5f4NXLWfxU8K3KjJi1uyc8E8eeqngcn73SgD6J+O\nmu3+rfFa88OaRomufEjw4tlLdX9hfK23z4yVlks5RGGhMY2gmMsCX27cnNfZVhNY\n6mwv7dCzwvLArvEUZSGw4wQDjK/jigD8i9Zv5tQvWuJZbiRTxH507SsEydo3NycD\nj8D05r2D9s/w7ZaD8eNaSwtILS3u0gvfLhTaN0iN5jY6ZLISccZPqTQB4tBDLPII\n4kZ2PZRk+35ngep4r71/ZF+A3h7QfDGk+Pddjt9W1rULeO8sQfnhsY3UMu0dGl55\nft0XA6gHyR42+DXxG8G6Hb63r3hi8tLCaNX+0KyyrHkZxJsyYiP9rA96/UTVoIrn\nTLq2mt1uYpYXR4WGRICpG0jvnpQB+RNhYyX8d9IZlEttbtPtcgM4UgMMkjkA57k4\nwK7rwd8MNU8T+OfEHhy7CeG7vRbC4vbqC8idvIEZUJFyQST5iKGyeBn5s0AebMME\ng9qlvraWzu5bWZdssTsjr6MpII/MGgCGigAooAKKACigAooA/9H45ooAltZ5ba4S\neB2SRGDKysQQQcggjkHIByOlRUAfoZ+xp8XL74geGdS0rXoR/aejJFLJeqMfao5N\n43uB/wAtAUO4gYbIOASRXzJ+xh4+Pgz4w2FrdTBNN1rGnXWc4VmOYW4B6SfL2/1n\ntQB7J/wUBtdIvvDfhfxbpUVhcytdS2kl9Cod2VYnkSMsP4Qwc7T0Oa9A8efA2Pxl\n8arbxA895o+g2ax3d60F0Q+p3gb5cLjCbUAQy/eYNtGMZoA89/ZQ/aG0DSfAE/hr\n4gavZaXFoNtEumzFWL3EAUgpgZLupXjaOQyjrXreh/CX4f6v4b8VaVqvhiyWxufE\nN1cqUGxonUKgkjYcxkBT93Hf1NAGp8Evixb/ABTk1a80zTY7LSLS4NtbPNchrqdl\n+8zQgfulwVxubJz0GMnU+DHg7TfBXhj+zPDus/2n4dlYXGnlljLR7h8/7xABIGPz\nbmy2SeSMYAPmvx2LMyfHzx+ong1lL2Hw/ZytOVSJHEKORjqxKKe5GBjHNdl8U9P+\nHvhv4f8Ai+98XadcXcWuavd6pBGRmcMxW1jaIH7pZWcqTjjnjsAfCF3M9xcyzyMz\nNI7OSxyckk8/nVzV9NktiLiJZ5LKZpPs1xJAYhcKjFS6g5HbkAnacg9KAM6igAoo\nAKKACigAooA//9L45ooAKKANPwtFqs3iCwh0ISnVJLiNbIRNhzPuHl7f9rftI/Xj\nNekfs/eLYvB1n4q1uKxmutSstLjuLLy0UlJFn27yT0UeYCSPSgD7Uk8daFcfCx9V\n8d6lPYTeGtSig1eKBysk95AVZE2ockSNscIOGBweM1+d+seLvEmr20llquuajfQu\n8TSC5l8ws0YYIxJ5yN7d+5HNAH1Zon7RniYTa03gX4ca7raarqjahEbxSYrdGSNZ\nIlaIMpBZHbcWGNx645+YfD3xC8aeHdITSdH8Tanaaek3nJbxT/ulc8khWBAPfjvz\nQB9rfsz/ABl8Gagup+GX8PN4Nv4nudRuLTe5so0VUMrqXA8nruKYAzk/xc/Dh1VY\ntMvJ5Lm7m1jUJN0twt02PKbJlSQD77SNgtuyMAdzQB3/AO0x8UIPH3i+f+x7u/n0\ndCpSS6JBuJBvAlWM/wCqTa+1E64yzfM1eQsSzFmJJJySepoA+mv2T/EvgjXfCWvf\nDT4mJBJo4STV7K4upSBaMijz/Lb70bYxICvcv75+aLeZ4JlkQsCD/CxU/mORxn86\nAPTPjr8ItU+HOowXkEo1Lw5qbPLpOpRuHE8P3k3FQAJNhBwPvAFhjkV7r8FPjL4O\n8f8AgbQfgn478O3cnn28WmQ3ySI6F0U+XIeQ8bDauGAPPoKAPjquq+Kvg+98D+Od\nU8O3iSZtLiRI5GjKiaMOQsq8cqcdRxuDDsKAOVooAKKACigD/9P45ooAKdCoaVFP\nQsAfzoA9+8H3S+Ev2V9W1G90uOaLxNrF5ohfyUWTZ9m3xSB+pCTRt8pI+82O2eU+\nJ2txR/CP4feFbW9uWENjcaneQniMXFzOxVu2T5YcDrgH3oA8sZgxJPU989+5pASD\nx6YoA9B+HegWF/Hap4htba10a4nmjn1dpHjktXFs8oTGRnCoGA2lSWGT2qjP4guP\nFGiW+jto1lLrYnZzqikR3E0CwbfJc8IyqEBBJBGAMHqQDkry3e3aMMHAkiSRSy4y\nGUHj2zkfhUJySBnPpQAlFABRQAqkBgSoYdweh9qSgD7U+D0Ph39oj4IP4T8TLB/w\nl3hy3MFjqTHdcBGX93KcnLLkBJFJIYqT3FfIPhPxBqvhjXrPW9GvJbS9s5VlhljY\ngqwIPYjKnGCp4IyDQBBr+lX2iavc6XqVrJaXlrK0M8LjBjdThl/P9CD3r2z41X+j\nfGXSJviR4Z037Drum20Y8UWGVGVC4S9iPWSMEGNv41+TK4FAHglSXEMtvM0M8bRy\nKcMrDBFAEdFAH//U+OaKAJLZQ9zEhzhnUHHuRTYX8uVJMZ2sG/I5oA7P4naTaaZZ\neFZLXzt174es7ubzJS/7x2mB25+6vyDCjgc46mqPjXxNB4h0zw5Atk9vPpWkR6dK\n/mBlm8uRyjgdvlcgigDmKMUAeh/DXUrG78G+LfBl5YT3VzqdrHeaW0SmRo7y1LOF\nCYORJGXUn0T3rj/DEWsTa5aw6ALw6k8m22W03ea0hBCqu3kk5I+hPbNAFa0kgt9S\njlltxdQJKGMTkqJUyDtJ6jcOM9s5r3jxd+z1eW/iS08H+GZnvvE/9lnVrm1ubyIC\nK3HlpsIRMiQO+ACSGVSRg0AeNeKtHNpN/aVha3I0W7kc2Nw8bbHXqUDHgsmdrDOR\ntyRzX0loPh+81j4H678F9e0Gax8V+F0k1TRTKNgvw0zklS+0HPzpnjcjDoQQAD5Q\nqW8ge2upYJEdGjdlKupVhgkYIPIPHIoAipVBYgAZJOBQAlTXltcWd1La3ULwzROU\nkRxhlYdQaAOk+GdxI3iOPSPMjih1hf7LmlYE+VHcPHG0gAPJUYOO+K5uyd47pGjd\no3zhXUkFW7MMehwfwoA6T4svbN8RNdWziEVtHfzRQgDB8uNzEpPuRHk/Wug+P8ml\naj4i03xNpVh9gGv6Ta6ncwKPkW5cOk+04GQXjBz6sfWgDzWigD//1fjmigAooAUg\njGe9JQAU5QWcKoyWOAKAN74fab4m1TxXYW3hG3vp9ZMytaLZnEokB4YN/Dju5wFH\nX0P1l+x54P8AFmkfDi51yPTrWyttamhltr2O/jt7ieFAU8os0blELjcNvJ3Hp3AK\n/wAWPg58Y7DxLpfjzwlcT3euro9qmtXWn3ixXc94uRM4QgK6lRGMd9g4OBX0HoGl\nNoN8kdr4t1jTo5MJ/ZWtyC8i3kkkxSyHzGJJxgSEDjCigD5d/aS0nXfEfwD8D/Ef\nxLDex+JrUnSdXSW2MUhO9wrlCBhw6cYwD5hI6ivqf9oDSLDV/g34jj1Szt75bOya\n/SKYN5bywDzUDBSCVLKAQCMgkZoA/Nz4rrajxO0iXIm1CWCGXU9hBRbxkBnVSOoB\n2/iW54rE8VX1jqWu3V9pukQ6RbTsJI7OGVpEhBUfKpbnGcn2zjoBQBmL1HIHPU0L\njPPSgC1qURSSOU3sV008aysUZmKs3VWz/EMc9eor0DTvB+h+OrF5PBVzdxa3b2Yk\nm0a7gY+aUwJGt7jJUr8y4WTDZ4B5AoA82ibZKjkZ2sDT7qCW2uHgnjaORGKsrAgg\ng4IIPIOcjB6EYoA6jxv4uGv+H/C2kRWohi0PSvsW5gN0rmVpGbIPTlQB161hnSLo\naAuslW+zNdG2BxxuEYkPOfQjtQBnUUAf/9b45ooAfbx+bPHEZEj3sF3ucKuTjJPY\nDvTKAHSLsdl3K2CRlTkH3HtTaAFVirBlOCDkH0NJQB6r8PfiJ4svbOHwfP4rubaz\nTT5bPSYp9htLeZmRo9ylcc7WQOwYqX4xkmvKwSDkUAfUnwU/af8AEHhXULbwv8Qo\n21jSLaTyXvGG+8slUkFyefOCkYP8WASC/f5r0LU10y9NzJpun6hlCnl3sRkRc4+Y\nKGHIxxnjk8UAfo9+1t4ssNE/Z/1x/tCl9btxp1l82PNMwwSPYJuY+wNfnx4k8aaz\nrfhbRPD11qN7LY6UJmhgklJjjaQ42oM8IqAKoPTJA4NAHNTMHmdlGFLEqPQdhTKA\nCigDovBfiq58MLq32WIO2o6ZcaeW3lTGsuzLjjkjYMDjr14rnaALms6leavqc+o6\nhO091cSGSWRsbnY9ScADPHXFU6AOzldv+FQwJn5f7dk79/saA1yMkEscEUzpiOXd\nsbjnBwf1oAiooA//1/jmigAooAKKACigAooAKKAAY7jIooA29Z1HTtVt45WtPsd9\nHEfNkiJKXL7hg7MARcf3cisSgA78U+FxHKkjRpIFYEo+drY7HHODQAyrWrT2txfy\nzWdr9kgY5SHzWk2cDjc3J5z1oAq1f0OG1kvle+YC1hxLMu/azorDcqHH3yCQOnNA\nFFmYgKScL0BPSrOrzWk+p3M1ja/ZbZ5XaGHdu8tCx2rnvgYGe5yaAKtFAH//0Pjm\nigAooAKKACigAooAKKACigAooAKKACigAFFABRQAUUAf/9k=', cb);
};

},{"../../app/lib/make-image":2}],34:[function(require,module,exports){
'use strict';

module.exports = {
  singlePortrait: require('./single-portrait')
};

},{"./single-portrait":35}],35:[function(require,module,exports){
'use strict';

var makeImage = require('../../app/lib/make-image');

module.exports = function (cb) {
  makeImage('data:image/png;base64,\n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\nRWARCPwfuNDlwVfqKPUAAAAASUVORK5CYII=', cb);
};

},{"../../app/lib/make-image":2}]},{},[1])
//# sourceMappingURL=comicbook.js.map
