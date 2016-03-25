# tachyonify [![Build Status](https://secure.travis-ci.org/johnotander/tachyonify.png?branch=master)](https://travis-ci.org/johnotander/tachyonify) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

__Work in progress__

Convert an existing HTML/CSS component to its tachyons equivalent

## Installation

```bash
npm install --save tachyonify
```

## Usage

```javascript
var tachyonify = require('tachyonify')
var fs = require('fs')

var bootstrapCss = fs.readFileSync('path/to/bootstrap.css')

tachyonify('<a href="#!" class="btn btn-default">Hello</a>', bootstrapCss)
```

##### Output

```html
<a href="#!" class="ba b-near-white br2 gray">Hello</a>
```

```css
.ba { ... }
...
```

## License

MIT

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

Crafted with <3 by John Otander ([@4lpine](https://twitter.com/4lpine)).

***

> This package was initially generated with [yeoman](http://yeoman.io) and the [p generator](https://github.com/johnotander/generator-p.git).
