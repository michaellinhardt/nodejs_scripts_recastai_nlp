import _ from 'lodash'
import Helper from '../helper'
import Recastapi from '../recastapi'

const source = {
  user: 'michael-linhardt',
  bot: 'fork-intent',
  token: '1591381a501fc1de88051797076b81ea',
  intent: 'test_merge',
}
source.url = `https://api.recast.ai/v2/users/${source.user}/bots/${source.bot}`

export default class Script extends Helper {
  constructor () {
    super()
    this.mode = 'starting'
    this.source = new Recastapi(source.user, source.bot, source.token)
  }

  async start () {
    this.bloc('Starting the script!')
    try {

      // check if the source intent exist
      this.log(`*** check if intent '${source.intent}' exist in bot '${source.bot}'`)
      if (await this.source.isIntent(source.intent) < 0) {
        this.exit(`missing intent '${source.intent}' in bot '${source.bot}'`)
      }

      this.log(`*** get expressions from intent '${source.intent}' in bot '${source.bot}'`)
      source.expressions = await this.source.getExpressions(source.intent)
      source.expressions = source.expressions.expressions

      const total = await this.verifNext(source.expressions, 0, 0)

      this.exit(`done, removed ${total} expression(s)`)

    } catch (error) { this.bloc('Error in start method', `${error}`) }
  }

  async verifNext (expressions, key, total) {
    try {
      if (!expressions[key]) { return total }

      const find = _.findIndex(expressions, { source: expressions[key].source })

      if (find === -1) { return await this.verifNext(expressions, key + 1, total) }

      if (expressions[key].id !== expressions[find].id) {
        total += 1
        await this.source.delExpression(source.intent, expressions[key].id)
      }

      return await this.verifNext(expressions, key + 1, total)
    } catch (error) { this.bloc('Error in start method', `${error}`) }
  }
}
