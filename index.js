'use strict'

var fs = require('fs')
var postcss = require('postcss')
var select = require('postcss-select')
var getElements = require('get-elements')
var getClasses = require('get-classes-from-html')
var shorthandExpand = require('postcss-shorthand-expand')
var removeComments = require('postcss-discard-comments')
var removeEmpty = require('postcss-discard-empty')
var hasClass = require('has-class-selector')
var replaceClasses = require('replace-classes')
var getContrast = require('get-contrast').ratio
var extendObj = require('extend-object')
var isBlank = require('is-blank')
var isPresent = require('is-present')
var isColor = require('is-color')
var isNan = require('is-nan')

var props = {}
var classesByProp = {}
var classConversions = {}
var tachyonsCss = fs.readFileSync('node_modules/tachyons/css/tachyons.css', 'utf8')

module.exports = function tachyonify (html, css) {
  var classes = getClasses(html).map(function (klass) {
    return '.' + klass
  })

  var elements = getElements(html)
  var selectors = classes.concat(elements)

  console.log(selectors)

  postcss([ select(selectors), removeEmpty(), shorthandExpand(), getProperties() ]).process(css).css
  var propsToSelect = {}
  Object.keys(props).forEach(function (klass) {
    extendObj(propsToSelect, props[klass])
  })
  //console.log('----')
  console.log(propsToSelect)
  //console.log('----')
  postcss([ removeMediaQueries(), selectByProperty(propsToSelect), removeEmpty(), removeComments({ removeAll: true }) ]).process(tachyonsCss).css

  //console.log(props)

  var propsToIgnore = ['font-family', 'src']
  var resultingClasses = {}
  Object.keys(props).forEach(function (klass) {
    Object.keys(props[klass]).filter(function (prop) {
      return propsToIgnore.indexOf(prop) === -1
    }).forEach(function (prop) {
      resultingClasses[klass] = resultingClasses[klass] || []
      resultingClasses[klass].push(searchForClassFromPropAndVal(klass, prop))
    })
  })

  //console.log('---------------------------')
  //console.log(classes.map(function (c) { return c.replace('.', '') }).join(' ') + ' converted to')
  //console.log(resultingClasses)

  Object.keys(resultingClasses).forEach(function (klass) {
    resultingClasses[klass] = resultingClasses[klass].filter(isPresent).map(function(c) { return c.replace('.', '') }).join(' ')
    resultingClasses[klass.replace('.', '')] = resultingClasses[klass]
    delete resultingClasses[klass]
  })

  //console.log(resultingClasses)

  //console.log('---------------------------')
  var newHtml = replaceClasses(html, resultingClasses)
  console.log(newHtml)
  return newHtml
}

function searchForClassFromPropAndVal(klass, prop) {
  var closestClass = null
  //console.log('------' + prop + ' with ' + props[klass][prop][0])
  //console.log(classesByProp[prop])

  if (isBlank(classesByProp[prop])) {
    return
  }

  if (isColor(props[klass][prop][0])) {
    var val = props[klass][prop][0]
    if (val === 'inherit') { return }
  //  console.log('looking for ' + val)
  //  console.log(classesByProp[prop])

    closestClass = classesByProp[prop].map(function (obj) {
      return {
        class: obj.class,
        value: getContrast(obj.value, val)
      }
    }).reduce(function (prev, curr) {
      return curr.value < prev.value ? curr : prev
    }).class
  } else {
    var val = convertToRem(props[klass][prop][0])

    if (isNan(val)) {
      val = props[klass][prop][0]

      classesByProp[prop].forEach(function (obj) {
        if (val === obj.value) {
          closestClass = obj.class
        }
      })
    } else {
      var valsForReduce = classesByProp[prop].map(function (obj) {
        return {
          class: obj.class,
          value: convertToRem(obj.value)
        }
      })

      closestClass = valsForReduce.reduce(function (prev, curr) {
        return compareValues(val, prev, curr)
      }).class
    }
  }

  return closestClass
}

function compareValues(val, prev, curr) {
  var valToCompare = val
  var prevToCompare = prev.value
  var currToCompare = curr.value

  if (prevToCompare === 'bold') {
    prevToCompare = 700
  }

  if (currToCompare === 'bold') {
    currToCompare = 700
  }

  if (isInPct(val)) {
    if (!isInPct(currToCompare)) {
      return prev
    }

    if (!isInPct(prevToCompare)) {
      return curr
    }

    valToCompare = valToCompare.replace('%', '')
    prevToCompare = prevToCompare.replace('%', '')
    currToCompare = currToCompare.replace('%', '')
  }

  return (Math.abs(currToCompare - valToCompare) < Math.abs(prevToCompare - valToCompare) ? curr : prev)
}

function convertToRem (value) {
  if (isInRem(value)) {
    return parseFloat(value.replace('rem', ''))
  } else if (isInPct(value)) {
    return value
  }

  return value.toString().replace('px', '').replace('em', '') / 16
}

function isInPx (value) {
  return value.indexOf('px') > -1
}

function isInRem (value) {
  return value.toString().indexOf('rem') > -1
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
      var klass = decl.parent && decl.parent.selectors && decl.parent.selectors[0]

      if (isPresent(klass)) {
        props[klass] = props[klass] || {}
        props[klass][decl.prop] = [] || props[klass][decl.prop]
        props[klass][decl.prop].push(decl.value)
      }
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
      // TODO: MORE THAN JUST CLASSES, SHOULD HANDLE ELEMENTS, TOO
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
