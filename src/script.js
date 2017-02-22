import cfg from '../config/private'
// import country from './script/data'
// import _ from 'lodash'

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
    global.dump(data)
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

  async txtReq (text) {
    try {
      global.dump('1')
      const res = await global.recast.textRequest(text, { language: 'fr' })
      this.bloc('TEXT REQUEST RETURN VALID', { send: text, res })
    } catch (err) {
      this.bloc('TEXT REQUEST RETURN ERROR', { send: text, err })
    }
    global.dump('2')
    return undefined
  }

  async start () {
    this.bloc('Starting the script!')
    const lala = { France: ['aa'], Chine: ['aa'], Japon: ['aa'] }
    try {
      for (const key of Object.keys(lala)) {
        await this.txtReq(key)
      }
    } catch (err) {
      this.bloc('ERROR IN COUNTRY LOOP', err)
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
