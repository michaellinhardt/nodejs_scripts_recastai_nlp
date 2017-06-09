/*
** Fork TOUS les intent d'un bot vers un autre bot
*/

import _ from 'lodash'
import token from '../config/token'
import Recastapi from '../helpers/recastapi'
import prettyjson from 'prettyjson'

/*
** const source -> account config, le bot contenant les intent
** const target -> account config, le bot recevant les intent
*/
const source = { ...token.sfr_clustering }
const target = { ...token.sfr }

export default class Script {
  constructor () {
    this.source = new Recastapi(source.user, source.bot, source.token)
    this.target = new Recastapi(target.user, target.bot, target.token)
  }

  async start () {
    this.bloc('Starting the script!')
    try {

      source.intents = []

      // get all intents from source
      source.intents = await this.source.getIntents()

      // loop on all intents
      await this.forkThisIntent(0)

      this.exit('zbra')

    } catch (error) { this.bloc('Error in start method', `${error}`) }
  }

  async forkThisIntent (key) {
    try {
      // if the list is over
      if (!source.intents[key]) { return true }

      this.log('')

      // extract intent name
      const intentName = source.intents[key].name

      this.log(`*** check if intent '${intentName}' exist in bot '${target.bot}'`)
      if (await this.target.isIntent(intentName) < 0) {
        this.log('dont exist.. start copy')
        await this.forkIntent(intentName)

      } else {
        this.log('exist')
      }

      // recursion
      return await this.forkThisIntent(key + 1)

    } catch (error) { this.bloc('Error in forkThisIntent method', `${error}`) }
  }

  async forkIntent (intentName) {
    try {

      this.log(`*** load expression from '${intentName}' in bot '${source.bot}'`)
      const expressions = (await this.source.getExpressions(intentName)).expressions

      // build expressions list for request
      const newExpressions = []
      _.forEach(expressions, value => {
        const expression = {
          source: value.source,
          language: {
            isocode: value.language.isocode,
          },
        }
        newExpressions.push(expression)
      })

      this.log(`*** create intent '${intentName}' in bot '${target.bot}' with ${newExpressions.length} expressions`)
      await this.target.addIntent(intentName, newExpressions)
      this.log('done!')

    } catch (error) { this.bloc('Error in forkIntent method', `${error}`) }
  }

  json (object) { process.stdout.write(`${prettyjson.render(object)}\r\n`) }
  log (mVar) { process.stdout.write(`${mVar}\r\n`) }
  err (method, error) { this.bloc(`Error method: ${method}\r\n${error}`) }

  exit (msg) {
    if (msg) { this.log(`*** processing is over: ${msg}`) }
    process.exit(0)
  }

  bloc (title, data, whiteline) {
    if (whiteline) { this.log('.') }
    process.stdout.write('\r\n')
    this.log(`##### ${title}`)
    if (!data) { return }
    if (typeof data === 'string') {
      this.json(data)

    } else if (typeof data === 'object') {
      _.each(data, (str) => { this.json(str) })
    }
  }
}
(new Script()).start()
