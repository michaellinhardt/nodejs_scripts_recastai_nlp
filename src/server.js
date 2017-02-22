import express from 'express'
import bodyParser from 'body-parser'
import Connector from 'recastai-botconnector'
import cfg from '../config/private'
import request from 'superagent'

import debug from 'util'
global.dump = function dump (mVar) { process.stdout.write(`${debug.inspect(mVar)}\r\n`) }
global.log = mVar => {
  if (cfg.log_terminal === true) {
    process.stdout.write(`${mVar}\r\n`)
  }
}

global.bc = new Connector(cfg.connector)

const network = express()
network.set('port', cfg.port)
network.use(bodyParser.json())
network.use('/', (req, res) => global.bc.listen(req, res))

network.listen(network.get('port'), () => {
  global.log(`Script is listening port ${network.get('port')}`)
})

global.bc.onTextMessage((data) => {
  global.dump(data.content.attachment)

  const message = [{
    type: 'text',
    content: `${data.content.attachment.content}`,
  }]

  request.post(`${cfg.connector.url}/users/${cfg.connector.userSlug}/bots/${cfg.connector.botId}/conversations/${data.content.conversation}/messages`)
    .set({ Authorization: cfg.connector.userToken })
    .send({ message, senderId: data.senderId })
    .end((err, res) => {
      global.dump(res)

      if (err) {
        global.dump('Fail to send message!!')
        global.dump(err)
      } else {
        global.dump('Message Send OOOK!!!')
      }
    })

})
