// import request from 'superagent'
// import _ from 'lodash'

import Helper from './helper'
import Recastapi from './recastapi'
// import Terminal from './terminal'

const source = {
  user: 'lucasdchamps',
  bot: 'sfr-bot',
  token: '67f986b5299181a7dd49de6ccce3429a',
  intent: ['intent1', 'intent2'],
}
source.url = `https://api.recast.ai/v2/users/${source.user}/bots/${source.bot}`

const target = {
  user: 'michael-linhardt',
  bot: 'fork-intent',
  token: '1591381a501fc1de88051797076b81ea',
  intent: 'cible',
}
target.url = `https://api.recast.ai/v2/users/${target.user}/bots/${target.bot}`

export default class Script extends Helper {
  constructor () {
    super()
    this.mode = 'starting'
    this.source = new Recastapi(source.user, source.bot, source.token)
    this.target = new Recastapi(target.user, target.bot, target.token)
  }

  async start () {
    this.bloc('Starting the script!')
    try {
      this.log('ok')
    } catch (error) { this.bloc('Error in start method', `${error}`) }
  }

  exit (msg) {
    if (msg) { this.log(`*** processing is over: ${msg}`) }
    process.exit(0)
  }
}
