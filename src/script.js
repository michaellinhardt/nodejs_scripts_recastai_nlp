import Helper from './helper'

export default class Script extends Helper {
  async start () {
    this.bloc('Starting the script!')
    try {
      this.log('ok')
    } catch (err) { this.bloc('ERROR IN START METHOD', err) }
    process.exit(0)
  }
}
