/*
** Supprime tous les intent d'un bot
** config:
** const target = { ...token.fork_intent }
** NB: ATTENTION SA SUPPRIMNE TOUS SANS VERIF
*/

import _ from 'lodash'

import Helper from '../helper'
import Recastapi from '../recastapi'
import token from '../config/token'

const target = { ...token.fork_intent }

export default class Script extends Helper {
  constructor () {
    super()
    this.mode = 'starting'
    this.target = new Recastapi(target.user, target.bot, target.token)
  }

  async start () {
    this.bloc('Starting the script!')
    try {
      // get intents list
      const intents = await this.target.getIntents()

      this.intents = []
      _.forEach(intents, value => this.intents.push(value.slug))

      await this.deleteOne(0)

      this.exit('all intents are delete')

    } catch (error) { this.bloc('Error in start method', `${error}`) }
  }

  async deleteOne (key) {
    try {
      if (!this.intents[key]) { return true }

      this.log(`*** deleting intent '${this.intents[key]}' in bot '${target.bot}'`)
      await this.target.delIntent(this.intents[key])

      return (this.deleteOne(key + 1))

    } catch (error) { this.bloc('Error in deleteOne method', `${error}`) }
  }

}
(new Script()).start()
