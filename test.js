import test from 'ava'
import fs from 'fs'
import tachyonify from './'

//test('tachyonify does something awesome', t => {
//  t.plan(1)
//
//  const bootstrapCss = fs.readFileSync('node_modules/bootstrap/dist/css/bootstrap.css', 'utf8')
//  const output = tachyonify('<a href="#!" class="btn btn-default">Hello</a>', bootstrapCss)
//	console.log(output)
//  t.same(output, '<a href="#!" class="dib pt1 pr2 pb1 pl2 mb0 code normal lh-title tc nowrap v-mid bt br bb bl br2 dark-gray bg-white-90">Hello</a>')
//})


test('tachyonify does something awesome', t => {
  t.plan(1)
  const input = `
<form>
  <div class="form-group">
    <label for="exampleInputEmail1">Email address</label>
    <input type="email" class="form-control" id="exampleInputEmail1" placeholder="Email">
  </div>
  <div class="form-group">
    <label for="exampleInputPassword1">Password</label>
    <input type="password" class="form-control" id="exampleInputPassword1" placeholder="Password">
  </div>
  <div class="form-group">
    <label for="exampleInputFile">File input</label>
    <input type="file" id="exampleInputFile">
    <p class="help-block">Example block-level help text here.</p>
  </div>
  <div class="checkbox">
    <label>
      <input type="checkbox"> Check me out
    </label>
  </div>
  <button type="submit" class="btn btn-default">Submit</button>
</form>`
  const bootstrapCss = fs.readFileSync('node_modules/bootstrap/dist/css/bootstrap.css', 'utf8')
  const output = tachyonify(input, bootstrapCss)
  t.same(output, '')
})
