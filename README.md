Comic Book Reader
=================

[![Build Status](https://api.travis-ci.org/balaclark/HTML5-Comic-Book-Reader.png)](https://travis-ci.org/balaclark/HTML5-Comic-Book-Reader)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

A canvas based web application for reading comics. You can also see an implementation
of this as an offline Chrome packaged application CBZ / CBR comic book reader at:
https://github.com/balaclark/chrome-comic-reader.

Usage
-----
See included examples.

Development Install
-------------------

Builds require nodejs and npm. Installs have been tested with nodejs 0.10.0, older
versions may or may not work.

```sh
npm install
npm run build
npm test
```

In order to run the test suite you will need phantomjs installed, if you don't
have it already installed globally:

```sh
npm install phantomjs@1.9
npm test
```

Contribute
----------

Contributions are welcome, use the standard code style:

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

This project aims to have an absolute minimum of external dependencies (dev dependencies are more acceptable).

Copyright and License
---------------------

Copyright 2010-2015 Bala Clark

Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this work except in compliance with the License. You may obtain a copy of the
License in the LICENSE file, or at:

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed
under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the License for the
specific language governing permissions and limitations under the License.
