import test from 'ava'
import fs from 'fs'
import tachyonify from './'

test('tachyonify does something awesome', t => {
  t.plan(1)

  const bootstrapCss = fs.readFileSync('node_modules/bootstrap/dist/css/bootstrap.css', 'utf8')
  const output = tachyonify('<a href="#!" class="btn btn-default">Hello</a>', bootstrapCss)
  t.true(false)
})
