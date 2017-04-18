/*
** Script to dispatch log in a list of intent
** useless atm because it is not faster than the plateform (selectingn target intents is bad designed)
** source.intents = [ 'intent_target' ] -> list of intents where log can be dispatch
*/

import _ from 'lodash'
import token from '../config/token'
import Helper from '../helpers/helper'
import Recastapi from '../helpers/recastapi'
import Terminal from '../helpers/terminal'

// account config
const source = { ...token.sfr }
source.intents = [
  'trash',
]

export default class Script extends Helper {
  constructor () {
    super()
    this.terminal = new Terminal(this.terminal_handler.bind(this))
    this.source = new Recastapi(source.user, source.bot, source.token)
    this.perPage = 1
    this.page = 1
  }

  async start () {
    this.bloc('Starting the script!')
    try {
      this.verifIntents(0)
      this.next()

    } catch (error) { this.bloc('Error in start method', `${error}`) }
  }

  async terminal_handler (input) {
    // verify if given key is a number
    if (isNaN(Number(input))) {
      this.log('*** send the number corresponding to the intent listed')
      return this.next()
    }
    // verify if given key is in intent list
    if (!source.intents[Number(input)]) {
      this.log('*** wrong number..')
      return this.next()
    }
    // do the job
    await this.addExpressionTo(Number(input))
    return this.next()
  }

  async addExpressionTo (key) {
    try {
      // verify if expression already exist
      if (await this.source.isExpression(source.intents[key], this.expression.source) !== -1) {
        this.log(`*** expression already exist inside intent '${source.intents[key]}' in bot '${source.bot}'`)
        return
      }

      // add expression
      this.log(`*** add expression to intent '${source.intents[key]}' in bot '${source.bot}'`)
      // await this.source.addExpression(source.intents[key], this.expression.source, 'fr')

      await this.source.addExpressions(source.intents[key], [{ id: this.expression.id, source: this.expression.source, language: { isocode: 'fr' } }])

    } catch (error) { this.bloc('Error in addExpressionTo method', `${error}`) }
  }

  async verifIntents (key) {
    try {
      if (!source.intents[key]) { return true }

      this.log(`*** check if intent '${source.intents[key]}' exist in bot '${source.bot}'`)
      if (await this.source.isIntent(source.intents[key]) < 0) {
        this.exit(`missing intent '${source.intents[key]}' in bot '${source.bot}'`)
      }

      return await this.verifIntents(key + 1)

    } catch (error) { this.bloc('Error in verifIntents method', `${error}`) }
  }

  async next () {
    try {
      await this.getNextUnmatched()

      this.displayLog()

      this.displayChoice()

    } catch (error) { this.bloc('Error in next method', `${error}`) }
  }

  async displayChoice () {
    try {
      this.log(` ${_.reduce(source.intents, (acc, intent, key) => {
        return `${acc}${acc ? '      ' : ''}[${key}] ${intent}`
      }, '')}`)

    } catch (error) { this.bloc('Error in displayChoice method', `${error}`) }
  }

  async displayLog () {
    try {
      this.log(`\r\n\x1b[33m${this.expression.source}\x1b[0m`)

    } catch (error) { this.bloc('Error in displayLog method', `${error}`) }
  }

  async getNextUnmatched () {
    try {
      const log = await this.source.getLogUnmatched(this.perPage, this.page)
      this.expression = log[0]

    } catch (error) { this.bloc('Error in getNextUnmatched method', `${error.stack}`) }
  }
}
(new Script()).start()
