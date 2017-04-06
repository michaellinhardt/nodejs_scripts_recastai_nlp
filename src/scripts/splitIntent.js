import _ from 'lodash'

import Helper from '../helper'
import Recastapi from '../recastapi'
import Terminal from '../terminal'

// const source = {
//   user: 'lucasdchamps',
//   bot: 'sfr-bot',
//   token: '67f986b5299181a7dd49de6ccce3429a',
//   intent: 'probleme_facture_splitting',
// }
const source = {
  user: 'recast-ai',
  bot: 'sfr',
  token: '5b3f5d6f7a5bc2138558c5c24f60396e',
  intent: 'probleme_facture_splitting',
}
source.url = `https://api.recast.ai/v2/users/${source.user}/bots/${source.bot}`

const target = {
  user: 'recast-ai',
  bot: 'sfr',
  token: '5b3f5d6f7a5bc2138558c5c24f60396e',
  intent: ['ecart-facturation', 'hors-forfait'],
  intents: [],
}
target.url = `https://api.recast.ai/v2/users/${target.user}/bots/${target.bot}`

const intentLayout = {
  name: '',
  isCreated: false,
}

export default class Script extends Helper {
  constructor () {
    super()
    this.mode = 'starting'
    this.source = new Recastapi(source.user, source.bot, source.token)
    this.target = new Recastapi(target.user, target.bot, target.token)
    this.terminal = new Terminal(this.terminal_handler.bind(this))
  }

  async start () {
    this.bloc('Starting the script!')
    try {

      this.log(`*** check if intent '${source.intent}' exist in bot '${source.bot}'`)
      if (await this.source.isIntent(source.intent) < 0) {
        throw new Error(`intent '${source.intent}' doesn't exist in bot '${source.bot}'`)
      }

      this.log(`*** get expressions from intent '${source.intent}' in bot '${source.bot}'`)
      source.expressions = await this.source.getExpressions(source.intent)
      source.expressions = source.expressions.expressions

      this.log(`*** build intents layout for:\r\n- ${target.intent.join('\r\n- ')}`)
      this.buildLayout()

      this.log('*** start processing...')
      this.nextExpression()

    } catch (error) { this.bloc('Error in start method', `${error}`) }
  }

  async terminal_handler (input) {
    if (_.isEmpty(input)) { return }

    const mode = this.mode.split('_')
    if (mode[0] !== 'input') {
      this.log('*** you are not allowed yet to push commands')
      return
    }

    if (this.mode === 'input_target_intent') {
      this.mode = 'locked'
      await this.addExpressionTo(Number(input))
      this.nextExpression()

    } else {
      this.exit('script error in terminal_handler')
    }
  }

  async addExpressionTo (key) {
    try {
      // verify if given key is a number
      if (isNaN(key)) {
        this.log('*** send the number corresponding to the intent listed')
        return
      }

      // verify if given key is in intent list
      if (!target.intents[key]) {
        this.log('*** wrong number..')
        return
      }

      // verify if intent exist and create it if needed
      if (target.intents[key].isCreated === false) {
        if (await this.target.isIntent(target.intent[key]) < 0) {
          this.log(`*** create intent '${target.intent[key]}' in bot '${target.bot}'`)
          await this.target.addIntent(target.intent[key])

        } else {
          this.log(`*** intent '${target.intent[key]}' in bot '${target.bot}' already exist`)
          target.intents[key].isCreated = true
        }
      }

      // remove expression to source
      this.log(`*** remove expression to intent '${source.intent}' in bot '${source.bot}'`)
      this.json(source.expressions[0])
      await this.source.delExpression(source.intent, source.expressions[0].id)

      // verify if expression already exist
      if (await this.target.isExpression(target.intent[key], source.expressions[0].source) !== -1) {
        this.log(`*** expression already exist inside intent '${target.intent[key]}' in bot '${target.bot}'`)
        source.expressions.shift()
        return
      }

      // add expression
      this.log(`*** add expression to intent '${target.intent[key]}' in bot '${target.bot}'`)
      await this.target.addExpression(target.intent[key], source.expressions[0].source, source.expressions[0].language.isocode)
      source.expressions.shift()

    } catch (error) { this.bloc('Error in addExpressionTo method', `${error}`) }
  }

  buildLayout () {
    _.forEach(target.intent, value => {
      intentLayout.name = value
      target.intents.push({ ...intentLayout })
    })
  }

  nextExpression () {
    if (source.expressions.length < 1) {
      this.exit(`no more expressions in intent ${source.intent} from ${source.bot}`)
    }

    // displaying the expression
    this.log(`\r\nExpression number ${source.expressions.length}:`)
    this.log(`${source.expressions[0].source}`)

    // displaying intents list
    this.log(` ${_.reduce(target.intents, (acc, intent, key) => {
      return `${acc}${acc ? '      ' : ''}[${key}] ${intent.name}`
    }, '')}`)

    this.mode = 'input_target_intent'
  }
}
