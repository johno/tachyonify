'use strict'

var fs = require('fs')
var postcss = require('postcss')
var select = require('postcss-select')
var getClasses = require('get-classes-from-html')
var removeEmpty = require('postcss-discard-empty')

var props = {}
module.exports = function tachyonify (html, css) {
  var classes = getClasses(html).map(function (klass) {
    return '.' + klass
  })

  var usedCss = postcss([ select(classes), removeEmpty(), getProperties() ]).process(css).css
  // console.log(usedCss)
  console.log(props)
  return true
}

var getProperties = postcss.plugin('get-properties', function () {
  return function (css, result) {
    css.walkDecls(function (decl) {
      props[decl.prop] = [] || props[decl.prop]
      props[decl.prop].push(decl.value)
    })
  }
})
