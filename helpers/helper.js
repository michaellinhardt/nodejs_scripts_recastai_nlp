import _ from 'lodash'
import prettyjson from 'prettyjson'

export default class Helper {
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
