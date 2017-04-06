import request from 'superagent'
import _ from 'lodash'
import Helper from './helper'

const source = {
  user: 'lucasdchamps',
  bot: 'sfr-bot',
  token: '67f986b5299181a7dd49de6ccce3429a',
  intent: 'abonnement',
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
  intent: 'souscrire-abonnement',
}
target.url = `https://api.recast.ai/v2/users/${target.user}/bots/${target.bot}`

export default class Script extends Helper {
  async start () {
    this.bloc('Starting the script!')
    try {

      this.log('verif is target already have this intent')
      if (await this.targetIntentExist() === true) { throw Error(`intent ${target.intent} already exist in target`) }

      this.log('verif is source have this intent')
      source.intent = await this.getSourceIntent()
      this.log('get expressions from source')
      this.expressions = (await this.getExpressionList(source)).expressions

      this.log('add expressions to target')
      await this.addIntent(target)

      this.bloc('Fork intent done')

    } catch (error) { this.bloc('Error in start method', `${error}`) }
    process.exit(0)
  }

  async targetIntentExist () {
    try {
      // no intent param
      if (!target.intent || _.isEmpty(target.intent)) { throw Error('no target intent') }

      // verif if target.intent exist
      const intent = []
      _.forEach(await this.getIntentList(target), value => {
        if (value.slug.toLowerCase() === target.intent.toLowerCase()) { intent.push(value) }
      })
      if (intent.length > 0) { return true }

      return false
    } catch (error) { this.bloc('Error in targetIntentExist method', `${error}`) }
    return true
  }

  async getSourceIntent () {
    try {
      // no intent param
      if (!source.intent || _.isEmpty(source.intent)) { throw Error('no source intent') }

      // verif if source.intent exist
      const intent = []
      _.forEach(await this.getIntentList(source), value => {
        if (value.slug.toLowerCase() === source.intent.toLowerCase()) { intent.push(value) }
      })
      if (intent.length !== 1) { throw Error('cant find the source intent') }

      // assign target intent
      return intent[0].slug
    } catch (error) { this.bloc('Error in getSourceIntent method', `${error}`) }
  }

  getIntentList (param) {
    return new Promise((resolve, reject) => {
      request
        .get(`${param.url}/intents`)
        .set('Authorization', `Token ${param.token}`)
        .send()
        .end((err, res) => {
          if (err) {
            reject(err)
          } else {
            resolve(res.body.results)
          }
        })
    })
  }

  getExpressionList (param) {
    return new Promise((resolve, reject) => {
      request
        .get(`${param.url}/intents/${param.intent}`)
        .set('Authorization', `Token ${param.token}`)
        .send()
        .end((err, res) => {
          if (err) {
            reject(err)
          } else {
            resolve(res.body.results)
          }
        })
    })
  }

  addIntent (param) {
    return new Promise((resolve, reject) => {
      request
        .post(`${param.url}/intents`)
        .set('Authorization', `Token ${param.token}`)
        .send({
          name: param.intent,
          expressions: this.expressions.map(expression => ({
            source: expression.source,
            language: { isocode: 'fr' },
          })),
        })
        .end((err, res) => {
          if (err) {
            reject(err)
          } else {
            resolve(res.body.results)
          }
        })
    })
  }
}
