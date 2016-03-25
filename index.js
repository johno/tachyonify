'use strict'

var fs = require('fs')
var postcss = require('postcss')
var select = require('postcss-select')
var getClasses = require('get-classes-from-html')
var removeComments = require('postcss-discard-comments')
var removeEmpty = require('postcss-discard-empty')
var hasClass = require('has-class-selector')
var isBlank = require('is-blank')

var props = {}
var tachyonsCss = fs.readFileSync('node_modules/tachyons/css/tachyons.css', 'utf8')
console.log(tachyonsCss)
module.exports = function tachyonify (html, css) {
  var classes = getClasses(html).map(function (klass) {
    return '.' + klass
  })

  var usedCss = postcss([ select(classes), removeEmpty(), getProperties() ]).process(css).css
  var usedTachyonsCss = postcss([ selectByProperty(props), removeEmpty(), removeComments({ removeAll: true }) ]).process(tachyonsCss).css
  console.log('-----')
  console.log(usedTachyonsCss)
  console.log('-----')
}

var getProperties = postcss.plugin('get-properties', function () {
  return function (css, result) {
    css.walkDecls(function (decl) {
      props[decl.prop] = [] || props[decl.prop]
      props[decl.prop].push(decl.value)
    })
  }
})

var selectByProperty = postcss.plugin('select-by-property', function (propsToCheck) {
  return function (css) {
    css.walkRules(function (rule) {
      var hasClassSelector = rule.selectors.some(function (selector) {
        return hasClass(selector)
      })

      if (hasClassSelector) {
        rule.walkDecls(function (decl) {
          console.log('hi')
          console.log(propsToCheck[decl.prop])
          if (isBlank(propsToCheck[decl.prop])) {
            console.log('removing ' + decl.prop)
            rule.remove()
          } else {
            console.log('keeping ' + decl.prop)
          }
        })
      } else {
        rule.remove()
      }
    })
  }
})
