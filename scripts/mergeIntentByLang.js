/*
** Same script than mergeIntent but with a lang param (merge only this lang)
** Take all expressions from the source.intent bot and add theme to the target.intent
** - add expressions only if it is not yet in the target
** - create the target intent if dont exist
** + you can use instead of source.intent, the array of expressions in json/jsonExpressions.js
**  (if you dont have the source bot developper token this is usefull to make a fork by copy-past the expressions)
*/

import _ from 'lodash'
import Helper from '../helpers/helper'
import Recastapi from '../helpers/recastapi'
import token from '../config/token'

import jsonExpressions from '../json/expressions'
const jsonExpressionsLang = 'fr'

const source = { ...token.starterkit_fr }
source.jsonExpressions = false // use the json/jsonExpressions instead of source.intent
source.intent = 'is-happy'

const target = { ...token.viva_fork }
target.intent = 'floating-happy'

source.lang = 'fr' // the lang used
target.perRequest = 15 // number of expressions per request (slowly add the expressions)

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

      // get expressiosn from json file if jsonExpressions is true
      if (source.jsonExpressions === true) {
        this.log(`*** extract ${jsonExpressions.length} expressiosn from json file`)
        source.expressions = await this.source.jsonExpressions(jsonExpressions, jsonExpressionsLang)

      // get expressions from source bot if jsonExpressions is false
      } else {
        // check if the source intent exist
        this.log(`*** check if intent '${source.intent}' exist in bot '${source.bot}'`)
        if (await this.source.isIntent(source.intent) < 0) {
          this.exit(`missing intent '${source.intent}' in bot '${source.bot}'`)
        }

        this.log(`*** get expressions from intent '${source.intent}' in bot '${source.bot}'`)
        source.expressions = await this.source.getExpressions(source.intent)
        source.expressions = (source.expressions.expressions).filter((expression) => expression.language.isocode === source.lang)
      }

      

      this.log(`*** get expressions from intent '${target.intent}' in bot '${target.bot}'`)
      target.expressions = await this.target.getExpressions(target.intent)
      target.expressions = (target.expressions.expressions).filter((expression) => expression.language.isocode === source.lang)


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

      this.log(`*** there is ${newExpressions.length} expression to add`)
      await this.addExpressionsSlowly(newExpressions)
      // if (newExpressions.length > 0) {
      //   await this.target.addExpressions(target.intent, newExpressions)
      // }

      this.exit('good job !')

    } catch (error) { this.bloc('Error in start method', `${error}`) }
  }

  async addExpressionsSlowly (expressions) {
    this.bloc('Add expressions slowly!')
    try {
      // no more expressions to add
      if (expressions.length < 1) {
        this.log(`*** all expressions added !!`)
        return true

      // last push of expression
      } else if (expressions.length <= target.perRequest) {
        const waitingExpression = []
        const requestExpressions = expressions
        this.log(`*** add the last ${requestExpressions.length} expressions.....`)
        await this.target.addExpressions(target.intent, requestExpressions)
        return await this.addExpressionsSlowly(waitingExpression)
        
      } else {
        const requestExpressions = expressions.slice(0, target.perRequest)
        const waitingExpression = expressions.slice(target.perRequest)
        this.log(`*** add ${requestExpressions.length} expressions, remaining ${waitingExpression.length}.....`)
        await this.target.addExpressions(target.intent, requestExpressions)
        return await this.addExpressionsSlowly(waitingExpression)
      }

    } catch (error) { this.bloc('Error in start method', `${error}`) }
  }
}
(new Script()).start()
