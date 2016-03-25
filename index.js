'use strict'

var fs = require('fs')
var postcss = require('postcss')
var select = require('postcss-select')
var getClasses = require('get-classes-from-html')
var removeEmpty = require('postcss-discard-empty')

module.exports = function tachyonify (html, css) {
  var classes = getClasses(html).map(function (klass) {
    return '.' + klass
  })

  var usedCss = postcss([ select(classes), removeEmpty() ]).process(css).css
  console.log(usedCss)
  return true
}
