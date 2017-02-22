import cfg from '../config/private'

export default class Script {
  constructor () {
    this.bloc('Script class is constructed')
  }

  bloc (title, data, whiteline) {
    if (whiteline) {
      global.log('.')
    }
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

  start () {
    this.bloc('Starting the script!')
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
