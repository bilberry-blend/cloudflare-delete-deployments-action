const process = require('process')
const cp = require('child_process')
const path = require('path')

// shows how the runner will run a javascript action with env / stdout protocol
// Specify input arguments as environment variables, e.g. INPUT_PROJECT=foo
test.skip('test action runs', () => {
  const ip = path.join(__dirname, 'index.js')
  const result = cp.execSync(`node ${ip}`, { env: process.env }).toString()
  console.log(result)
})
