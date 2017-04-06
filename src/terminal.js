import readline from 'readline'

import Helper from './helper'

export default class Terminal extends Helper {
  constructor (handler) {
    super()
    this.handler = handler
    this.listen()
  }

  listen () {
    this.terminal = readline.createInterface(process.stdin)
    this.incoming_handler()
  }

  incoming_handler () {
    this.terminal.on('line', this.handler)
  }
}
