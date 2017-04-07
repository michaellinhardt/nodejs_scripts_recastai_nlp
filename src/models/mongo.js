import mongoose from 'mongoose'

import _config from '../config/mongo'

import Helper from '../helper'

module.exports = class Mongo extends Helper {
  /*
  ** Connecting to mongo db
  */
  static async connect () {
    const function_name = 'connect()'
    try {
      const user = (!_config.username) ? '' : `${_config.username}:${_config.password}@`
      const host = `${_config.hostname}:${_config.port}/${_config.name}`
      const ssl = (!_config.ssl) ? '' : `?ssl=${_config.ssl}`
      const request = `mongodb://${user}${host}${ssl}`

      mongoose.Promise = global.Promise
      await mongoose.connect(request, () => {
        process.stdout.write(`*** connected to mongo db: ${_config.name || 'undefined'}`)
      })
      return mongoose

    } catch (error) { this.err(function_name, error) }
  }
}
