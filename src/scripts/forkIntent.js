import _ from 'lodash'
import Helper from '../helper'
import Recastapi from '../recastapi'

const source = {
  user: 'lucasdchamps',
  bot: 'sfr-bot',
  token: '67f986b5299181a7dd49de6ccce3429a',
  intent: 'probleme_facture',
}
source.url = `https://api.recast.ai/v2/users/${source.user}/bots/${source.bot}`

// const target = {
//   user: 'michael-linhardt',
//   bot: 'fork-intent',
//   token: '1591381a501fc1de88051797076b81ea',
//   intent: 'changer-forfait',
// }
const target = {
  user: 'recast-ai',
  bot: 'sfr',
  token: '5b3f5d6f7a5bc2138558c5c24f60396e',
  intent: 'probleme_facture_splitting',
}
target.url = `https://api.recast.ai/v2/users/${target.user}/bots/${target.bot}`

export default class Script extends Helper {
  constructor () {
    super()
    this.source = new Recastapi(source.user, source.bot, source.token)
    this.target = new Recastapi(target.user, target.bot, target.token)
  }

  async start () {
    this.bloc('Starting the script!')
    try {

      // check if the target intent exist
      this.log(`*** check if intent '${target.intent}' exist in bot '${target.bot}'`)
      if (await this.target.isIntent(target.intent) > -1) {
        this.exit(`intent '${target.intent}' already exist in bot '${target.bot}'`)
      }

      // check if the source intent exist
      this.log(`*** check if intent '${source.intent}' exist in bot '${source.bot}'`)
      if (await this.source.isIntent(source.intent) < 0) {
        this.exit(`intent '${source.intent}' doesn't exist in bot '${source.bot}'`)
      }

      // get expressions from source
      this.log(`*** get expressions from intent '${source.intent}' in bot '${source.bot}'`)
      source.expressions = (await this.source.getExpressions(source.intent)).expressions

      // build expressions list for request
      const newExpressions = []
      _.forEach(source.expressions, value => {
        const expression = {
          source: value.source,
          language: {
            isocode: value.language.isocode,
          },
        }
        newExpressions.push(expression)
      })

      this.log(`*** create intent '${target.intent}' in bot '${target.bot}' with ${source.expressions.length} expressions`)
      await this.target.addIntent(target.intent, newExpressions)

      this.exit('fork intent done')

    } catch (error) { this.bloc('Error in start method', `${error}`) }
  }
}
