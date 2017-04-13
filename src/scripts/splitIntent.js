import _ from 'lodash'

import Helper from '../helper'
import Recastapi from '../recastapi'
import Terminal from '../terminal'
import token from '../config/token'

import Mongo from '../models/mongo'

const source = { ...token.sfr }
source.intent = 'tmp-qwant-intent-need-split'

const target = { ...token.sfr }
target.createIntent = true
target.intent = [
  'to-delete',
  'meteo',
  'news',
  'manger',
  'boire',
]

export default class Script extends Helper {
  constructor () {
    super()
    this.mode = 'starting'
    this.source = new Recastapi(source.user, source.bot, source.token)
    this.target = new Recastapi(target.user, target.bot, target.token)
    this.terminal = new Terminal(this.terminal_handler.bind(this))
  }

  async mongo () {
    this.db = await Mongo.connect()
    this.splitSchema = new this.db.Schema({
      source_intent: { type: String, default: '' },
      expressions: { type: Object, default: [] },
    })

    this.SplitSchema = await this.db.model('Split', this.splitSchema)
  }

  async start () {
    this.bloc('Starting the script!')
    try {

      await this.mongo()

      this.log(`*** check if intent '${source.intent}' exist in bot '${source.bot}'`)
      if (await this.source.isIntent(source.intent) < 0) {
        throw new Error(`intent '${source.intent}' doesn't exist in bot '${source.bot}'`)
      }

      await this.getSourceExpressions()

      this.buildLayout()

      this.log('*** start processing...')
      this.nextExpression()

    } catch (error) { this.bloc('Error in start method', `${error}`) }
  }

  async getSourceExpressions () {
    this.log(`*** get expressions from intent '${source.intent}' in bot '${source.bot}'`)

    this.data = await this.SplitSchema.findOne({ source_intent: source.intent }) || await new this.SplitSchema({ source_intent: source.intent })

    if (this.data.expressions.length === 0) {
      this.data.expressions = (await this.source.getExpressions(source.intent)).expressions
      await this.save()
    }
  }

  async terminal_handler (input) {
    // verify if we are in input mode
    const mode = this.mode.split('_')
    if (mode[0] !== 'input') {
      this.log('*** you are not allowed yet to push commands')
      return
    }

    // if pushing enter, skip this sentence and keep it in souce
    if (_.isEmpty(input)) {
      await this.shiftExpressions()
      return this.nextExpression()
    }

    if (this.mode === 'input_target_intent') {
      await this.parseInput(input)
    } else {
      this.exit('script error in terminal_handler')
    }
  }

  async parseInput (input) {
    // reset command
    if (input === '!reset') {
      await this.reset()
      await this.getSourceExpressions()
      this.buildLayout()
      return this.nextExpression()
    }

    // verify if given key is a number
    if (isNaN(Number(input))) {
      this.log('*** send the number corresponding to the intent listed')
      return this.nextExpression()
    }
    // verify if given key is in intent list
    if (!target.intents[Number(input)]) {
      this.log('*** wrong number..')
      return this.nextExpression()
    }
    // do the job
    this.mode = 'locked'
    await this.addExpressionTo(Number(input))
    await this.shiftExpressions()
    this.nextExpression()
  }

  async shiftExpressions () {
    this.data.expressions.shift()
    await this.save()
  }

  async save () {
    await this.data.markModified('expressions')
    await this.data.save()
  }

  async addExpressionTo (key) {
    try {

      // verify if intent exist and create it if needed
      if (target.intents[key].isCreated === false) {
        if (await this.target.isIntent(target.intent[key]) < 0) {
          // stop if create mode is false
          if (!target.createIntent) {
            this.exit(`*** create mode is false and intent '${target.intent[key]}' dont exist in '${target.bot}'`)
          }
          this.log(`*** create intent '${target.intent[key]}' in bot '${target.bot}'`)
          await this.target.addIntent(target.intent[key])

        } else {
          this.log(`*** intent '${target.intent[key]}' in bot '${target.bot}' already exist`)
          target.intents[key].isCreated = true
        }
      }

      // remove expression to source
      this.log(`*** remove expression to intent '${source.intent}' in bot '${source.bot}'`)
      await this.source.delExpression(source.intent, this.data.expressions[0].id)

      // verify if expression already exist
      if (await this.target.isExpression(target.intent[key], this.data.expressions[0].source) !== -1) {
        this.log(`*** expression already exist inside intent '${target.intent[key]}' in bot '${target.bot}'`)
        return
      }

      // add expression
      this.log(`*** add expression to intent '${target.intent[key]}' in bot '${target.bot}'`)
      await this.target.addExpression(target.intent[key], this.data.expressions[0].source, this.data.expressions[0].language.isocode)

    } catch (error) { this.bloc('Error in addExpressionTo method', `${error}`) }
  }

  buildLayout () {
    this.log(`*** build intents layout for:\r\n- ${target.intent.join('\r\n- ')}`)
    target.intents = []
    _.forEach(target.intent, value => {
      target.intents.push({ name: value, isCreated: false })
    })
  }

  async reset () {
    await this.SplitSchema.find({}).remove().exec()
  }

  async nextExpression () {
    if (this.data.expressions.length < 1) {
      await this.reset()
      this.exit(`no more expressions in intent ${source.intent} from ${source.bot}`)
    }

    // displaying the expression
    this.log(`\r\nExpression number ${this.data.expressions.length}:`)
    this.log(`\x1b[33m${this.data.expressions[0].source}\x1b[0m`)

    // displaying intents list
    this.log(` ${_.reduce(target.intents, (acc, intent, key) => {
      return `${acc}${acc ? '      ' : ''}[${key}] ${intent.name}`
    }, '')}`)

    this.mode = 'input_target_intent'
  }
}
