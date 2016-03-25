'use strict'

var fs = require('fs')
var postcss = require('postcss')
var select = require('postcss-select')
var getClasses = require('get-classes-from-html')
var shorthandExpand = require('postcss-shorthand-expand')
var removeComments = require('postcss-discard-comments')
var removeEmpty = require('postcss-discard-empty')
var hasClass = require('has-class-selector')
var isBlank = require('is-blank')
var isPresent = require('is-present')
var isNan = require('is-nan')

var props = {}
var classesByProp = {}
var classConversions = {}
var tachyonsCss = fs.readFileSync('node_modules/tachyons/css/tachyons.css', 'utf8')

module.exports = function tachyonify (html, css) {
  var classes = getClasses(html).map(function (klass) {
    return '.' + klass
  })

  postcss([ select(classes), removeEmpty(), shorthandExpand(), getProperties() ]).process(css).css
  postcss([ removeMediaQueries(), selectByProperty(props), removeEmpty(), removeComments({ removeAll: true }) ]).process(tachyonsCss).css

  console.log(props)

  var propsToIgnore = ['font-family', 'src']
  var resultingClasses = []
  Object.keys(props).filter(function (prop) {
    return propsToIgnore.indexOf(prop) === -1
  }).forEach(function (prop) {
    resultingClasses.push(searchForClassFromPropAndVal(prop))
  })

  console.log(resultingClasses.filter(isPresent).map(function (c) { return c.replace('.', '') }).join(' '))
}

function searchForClassFromPropAndVal(prop) {
  var closestClass = null
  console.log('------' + prop + ' with ' + props[prop][0])
  console.log(classesByProp[prop])

  if (isBlank(classesByProp[prop])) {
    return
  }

  var val = convertToRem(props[prop][0])

  if (isNan(val)) {
    val = props[prop][0]

    console.log('looking for ' + val)
    console.log(classesByProp[prop])
    classesByProp[prop].forEach(function (obj) {
      if (val === obj.value) {
        closestClass = obj.class
      }
    })
  } else {
    var valsForReduce = classesByProp[prop].map(function (obj) {
      obj.value = convertToRem(obj.value)
      return obj
    }).filter(function (obj) {
      return !isInPct(obj.value)
    })

    closestClass = valsForReduce.reduce(function (prev, curr) {
      return (Math.abs(curr.value - val) < Math.abs(prev.value - val) ? curr : prev)
    }).class
    console.log('looking for ' + val)
    console.log(valsForReduce)
  }

  console.log(closestClass)
  console.log('------')
  return closestClass
}

function convertToRem (value) {
  if (isInRem(value)) {
    return parseFloat(value.replace('rem', ''))
  } else if (isInPct(value)) {
    return value
  }

  return value.replace('px', '').replace('em', '') / 16
}

function isInPx (value) {
  return value.indexOf('px') > -1
}

function isInRem (value) {
  return value.indexOf('rem') > -1
}

function isInEm (value) {
  return value.indexOf('em') > -1 && !isInRem(value)
}

function isInPct (value) {
  return value.toString().indexOf('%') > -1
}

var getProperties = postcss.plugin('get-properties', function () {
  return function (css, result) {
    css.walkDecls(function (decl) {
      props[decl.prop] = [] || props[decl.prop]
      props[decl.prop].push(decl.value)
    })
  }
})

var removeMediaQueries = postcss.plugin('remove-at-rules', function () {
  return function (css) {
    css.walkAtRules(function (rule) {
      rule.remove()
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
          if (isBlank(propsToCheck[decl.prop])) {
            rule.remove()
          } else {
            classesByProp[decl.prop] = classesByProp[decl.prop] || []
            classesByProp[decl.prop].push({
              class: rule.selector,
              value: decl.value
            })
          }
        })
      } else {
        rule.remove()
      }
    })
  }
})
