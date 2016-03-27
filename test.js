import test from 'ava'
import fs from 'fs'
import tachyonify from './'

test('tachyonify does something awesome', t => {
  t.plan(1)

  const bootstrapCss = fs.readFileSync('node_modules/bootstrap/dist/css/bootstrap.css', 'utf8')
  const output = tachyonify('<a href="#!" class="btn btn-default">Hello</a>', bootstrapCss)
  t.same(output, '<a href="#!" class="dib pt1 pr2 pb1 pl2 mb0 code normal lh-title tc nowrap v-mid bt br bb bl br2 dark-gray bg-white-90">Hello</a>')
})
