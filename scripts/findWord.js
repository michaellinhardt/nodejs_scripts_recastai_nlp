/*
** find and display all occurence to a word in all intents from a bot
*/

import _ from 'lodash'
import token from '../config/token'
import Helper from '../helpers/helper'
import Recastapi from '../helpers/recastapi'

const source = { ...token.sfr }
source.word = 'fils'

export default class Script extends Helper {
  constructor () {
    super()
    this.mode = 'starting'
    this.source = new Recastapi(source.user, source.bot, source.token)
    this.result = { count: 0 }
  }

  async start () {
    this.bloc('Starting the script!')
    try {
      // get intents list
      const intents = await this.source.getIntents()

      this.intents = []
      _.forEach(intents, value => this.intents.push(value.slug))

      await this.findWord(0)

      this.json(this.result)
      this.log(`${this.result.count} intent have this word ${source.word}`)

    } catch (error) { this.bloc('Error in start method', `${error}`) }
  }

  async findWord (key) {
    try {
      if (!this.intents[key]) { return true }

      const intent = this.intents[key]

      this.log(`*** checking inside intent '${intent}'`)

      const expressions = (await this.source.getExpressions(intent)).expressions
      this.log(`*** expressions in this intent: '${expressions.length}'`)

      const match = []

      _.forEach(expressions, (value) => {

        if (value.source.toLowerCase().search(source.word.toLowerCase()) > -1) {
          if (_.isEmpty(this.result[intent])) {
            this.result[intent] = { total: 0 }
          }

          this.log(`*** i have find the word in : '${value.source}'`)
          this.result[intent].total += 1
          match.push(
            value.source.toLowerCase()
            .split(source.word.toLowerCase())
            .join(`{${source.word.toLowerCase()}}`)
          )
        }
      })

      if (match.length > 0) {
        this.result[intent].match = [...match]
        this.result.count += 1
      }

      return await this.findWord(key + 1)

    } catch (error) { this.bloc('Error in findWord() method', `${error}`) }
  }
}
(new Script()).start()
