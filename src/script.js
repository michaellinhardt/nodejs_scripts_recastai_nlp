// import cfg from '../config/private'
// import request from 'superagent'

export default class Script {
  constructor () {
    global.log('Script class is constructed')
  }

  err (method, err) {
    global.log(`class Script, method: ${method}\r\n${err}`)
  }

  start () {
    global.log('Starting the script!')
  }
}
