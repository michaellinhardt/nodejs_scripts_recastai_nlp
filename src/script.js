import cfg from '../config/private'
import _ from 'lodash'
import request from 'request'
// import axios from 'axios'

export default class Script {
  constructor () {
    this.bloc('Script class is constructed')
    this.itimer = 0
  }

  bloc (title, data, whiteline) {
    if (whiteline) { global.log('.') }
    global.log('############################################################')
    global.log(`### ${title}`)
    global.log('############################################################')
    if (!data) { return }
    if (typeof data === 'string') {
      global.dump(data)
    } else if (typeof data === 'object') {
      _.each(data, (str) => { global.dump(str) })
    }
    global.log('############################################################')
  }

  post (url, data, token, log) {
    this.bloc('POSTING DATA', { post_url: url, post_data: data })

    if (token && token !== 0) { token = { Authorization: token } }
    if (!token) { token = {} }

    global.request.post(url).set(token).send(data).end((err, res) => {
      if (err) {
        if (log) { err = { 'Error Message': err, 'Res Dump': res } }
        this.bloc('!POST RETURN ERROR!', err)
      } else {
        if (log) { url = { Url: url, 'Res Dump': res } }
        this.bloc('POST RETURN SUCCESS', url)
      }
    })
  }

  err (method, err) {
    this.bloc(`class Script, method: ${method}\r\n${err}`)
  }

  async operation (title, initial) {
    try {
      this.bloc('OPERATION DONE', { title, initial })
    } catch (err) {
      this.bloc('OPERATION ERROR', { title, initial, err })
    }
    return undefined
  }

  async start () {
    this.bloc('Starting the script!')
    try {
      let dataUri
      const url = 'http://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png'

      await request.get({ url, encoding: null }, (err, res, body) => {
        if (!err) {
          const type = res.headers['content-type']
          const prefix = `data: ${type} ;base64,`
          const base64 = body.toString('base64')
          dataUri = prefix + base64
          this.bloc(dataUri)
          process.exit()
        }
      })

      // const { data } = await axios.get(url)
      //
      // this.bloc('RETURN', data.toString('base64'))

    } catch (err) {
      this.bloc('ERROR IN START METHOD', err)
    }
  }

  bcMessage (data) {
    this.bloc('BOT CONNECTOR: data', data)

    const url = `${cfg.connector.url}/users/${cfg.connector.userSlug}/bots/${cfg.connector.botId}/conversations/${data.content.conversation}/messages`
    const message = [{
      type: 'text',
      content: `${data.content.attachment.content}`,
    }]

    this.post(url, { message, senderId: data.senderId }, cfg.connector.userToken)
  }
}
