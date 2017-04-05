import _ from 'lodash'
import Helper from './helper'
import Recastapi from './recastapi'

const source = {
  user: 'lucasdchamps',
  bot: 'sfr-bot',
  token: '67f986b5299181a7dd49de6ccce3429a',
  intent: 'erreur_nom',
}
source.url = `https://api.recast.ai/v2/users/${source.user}/bots/${source.bot}`

const target = {
  user: 'michael-linhardt',
  bot: 'fork-intent',
  token: '1591381a501fc1de88051797076b81ea',
  intent: 'test_merge',
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

      // check or create the target intent
      this.log(`*** check if intent '${target.intent}' exist in bot '${target.bot}'`)
      if (await this.target.isIntent(target.intent) < 0) {
        this.log(`*** create the missing intent '${target.intent}' in bot '${target.bot}'`)
        await this.target.addIntent(target.intent)
      }

      // check if the source intent exist
      this.log(`*** check if intent '${source.intent}' exist in bot '${source.bot}'`)
      if (await this.source.isIntent(source.intent) < 0) {
        this.exit(`missing intent '${source.intent}' in bot '${source.bot}'`)
      }

      this.log(`*** get expressions from intent '${source.intent}' in bot '${source.bot}'`)
      source.expressions = await this.source.getExpressions(source.intent)
      source.expressions = source.expressions.expressions

      this.log(`*** get expressions from intent '${target.intent}' in bot '${target.bot}'`)
      target.expressions = await this.target.getExpressions(target.intent)
      target.expressions = target.expressions.expressions

      // extract unique expression
      const newExpressions = []
      _.forEach(source.expressions, value => {
        if (_.findIndex(target.expressions, { source: value.source }) === -1
        && _.findIndex(newExpressions, { source: value.source }) === -1) {
          const expression = {
            source: value.source,
            language: {
              isocode: value.language.isocode,
            },
          }
          newExpressions.push(expression)
        }
      })

      this.log(`*** add ${newExpressions.length} expression`)
      if (newExpressions.length > 0) {
        await this.target.addExpressions(target.intent, newExpressions)
      }

      this.exit('done')

    } catch (error) { this.bloc('Error in start method', `${error}`) }
  }

  exit (msg) {
    if (msg) { this.log(`*** processing is over: ${msg}`) }
    process.exit(0)
  }
}
