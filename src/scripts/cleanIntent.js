/*
** Supprime toutes les expressions en double dans un intent
** information necessaire:
** const source = { ... token.label_bot }
** source.intent = 'intent_target'
*/

import _ from 'lodash'
import token from '../config/token'
import Helper from '../helper'
import Recastapi from '../recastapi'

// account config
const source = { ...token.sfr }
source.intents = [] // if empty array -> get all intent

export default class Script extends Helper {
  constructor () {
    super()
    this.mode = 'starting'
    this.source = new Recastapi(source.user, source.bot, source.token)
  }

  async start () {
    this.bloc('Starting the script!')
    try {
      if (_.isEmpty(source.intents)) {
        this.autoIntents = true
      }

      await this.getIntents()

      if (this.autoIntents !== true) {
        await this.verifIntents(0)
      }

      const total = await this.checkIntents(0, 0)

      this.exit(`done, removed ${total} expression(s)`)

    } catch (error) { this.bloc('Error in start method', `${error}`) }
  }

  async checkIntents (key, total) {
    try {
      if (!source.intents[key]) { return total }

      this.log(`*** get expressions from intent '${source.intents[key]}' in bot '${source.bot}'`)
      source.expressions = (await this.source.getExpressions(source.intents[key])).expressions

      this.log(`*** check duplicata for intent '${source.intents[key]}' in bot '${source.bot}'`)
      const count = await this.checkExpressions(source.intents[key], 0, 0)

      return await this.checkIntents(key + 1, total + count)

    } catch (error) { this.bloc('Error in checkIntents method', `${error}`) }
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

  async getIntents () {
    try {
      if (source.intents.length === 0) {
        this.log(`*** get list of all intents in bot '${source.bot}'`)
        _.forEach(await this.source.getIntents(), intent => source.intents.push(intent.slug))
      }

    } catch (error) { this.bloc('Error in getIntents method', `${error}`) }
  }

  async checkExpressions (intent, key, total) {
    try {
      if (!source.expressions[key]) { return total }

      if (this.isDuplicate(key) === true) {
        total += 1
        await this.source.delExpression(intent, source.expressions[key].id)
      }

      return await this.checkExpressions(intent, key + 1, total)
    } catch (error) { this.bloc('Error in start method', `${error}`) }
  }

  isDuplicate (key) {
    try {
      const find = _.findIndex(source.expressions, { source: source.expressions[key].source })

      if (find > -1 && source.expressions[key].id !== source.expressions[find].id) {
        return true
      }

      return false
    } catch (error) { this.bloc('Error in start method', `${error}`) }
  }

}
(new Script()).start()
