import Helper from './helper'
import FileModel from './models/File.model'

export default class Script extends Helper {
  async start () {
    this.bloc('Starting the script!')
    try {
      this.bloc('Hello')
    } catch (err) {
      this.bloc('ERROR IN START METHOD', err)
    }
    process.exit(0)
  }

  initModels (tab) {
    this.fs = new FileModel(tab)
  }

  constructor (tab) {
    super(tab)
    this.constructed(tab, 'Script')
    this.initModels(`${tab}\t`)
  }
}
