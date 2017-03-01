import fs from 'fs'

import DefaultModel from '../Default.model'

export default class FileModel extends DefaultModel {
  constructor (tab) {
    super(tab)
    this.constructed(tab, 'FileModel')
  }

  syncFileContent (path) { return fs.readFileSync(path).toString() }
}
