import _ from 'lodash'
import request from 'superagent'

import Helper from './helper'

const apiBaseUrl = 'https://api.recast.ai/v2/users'

export default class Recastapi extends Helper {
  constructor (user, bot, token) {
    super()
    this.user = user
    this.bot = bot
    this.token = token
    this.url = `${apiBaseUrl}/${user}/bots/${bot}`
  }

  delExpression (intent, idExpression) {
    return new Promise((resolve, reject) => {
      request
        .delete(`${this.url}/intents/${intent}/expressions/${idExpression}`)
        .set('Authorization', `Token ${this.token}`)
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

  delIntent (intent) {
    return new Promise((resolve, reject) => {
      request
        .delete(`${this.url}/intents/${intent}`)
        .set('Authorization', `Token ${this.token}`)
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

  addExpression (intent, expression, lang) {
    return new Promise((resolve, reject) => {
      request
        .post(`${this.url}/intents/${intent}/expressions`)
        .set('Authorization', `Token ${this.token}`)
        .send({
          source: expression,
          language: { isocode: lang },
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

  addExpressions (intent, expressions) {
    return new Promise((resolve, reject) => {
      request
        .post(`${this.url}/intents/${intent}/expressions/bulk_create`)
        .set('Authorization', `Token ${this.token}`)
        .send({ expressions })
        .end((err, res) => {
          if (err) {
            reject(err)
          } else {
            resolve(res.body.results)
          }
        })
    })
  }

  async isExpression (intent, expression) {
    const { expressions } = await this.getExpressions(intent)
    return _.findIndex(expressions, { source: expression })
  }

  async isIntent (intent) {
    const intents = await this.getIntents()
    return _.findIndex(intents, { name: intent })
  }

  getIntents () {
    return new Promise((resolve, reject) => {
      request
        .get(`${this.url}/intents`)
        .set('Authorization', `Token ${this.token}`)
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

  addIntent (intent, expressions = []) {
    return new Promise((resolve, reject) => {
      request
        .post(`${this.url}/intents`)
        .set('Authorization', `Token ${this.token}`)
        .send({ name: intent, expressions })
        .end((err, res) => {
          if (err) {
            reject(err)
          } else {
            resolve(res.body.results)
          }
        })
    })
  }

  getExpressions (intent) {
    return new Promise((resolve, reject) => {
      request
        .get(`${this.url}/intents/${intent}`)
        .set('Authorization', `Token ${this.token}`)
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
}
