import cfg from '../config/private'
import _ from 'lodash'

export default class Helper {
  constructor (tab) {
    this.constructed(tab, 'Helper')
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

  constructed (tab, name) { global.log(`${tab}- ${name} is constructed`) }

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
