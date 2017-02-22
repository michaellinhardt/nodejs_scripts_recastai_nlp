import express from 'express'
import bodyParser from 'body-parser'
import Connector from 'recastai-botconnector'
import { Client, Conversation } from 'recastai'
import debug from 'util'
import request from 'superagent'

import cfg from '../config/private'
import Script from './script'

// Debug tools
global.dump = function dump (mVar) { process.stdout.write(`${debug.inspect(mVar)}\r\n`) }
global.log = mVar => { process.stdout.write(`${mVar}\r\n`) }

// Post & Recast & Bot Connector SDK
global.Conversation = Conversation
global.recast = new Client(cfg.recast.token, cfg.recast.language)
global.bc = new Connector(cfg.connector)
global.request = request
const script = new Script()

// Listen port
const network = express()
network.set('port', cfg.port)
network.use(bodyParser.json())
network.use('/', (req, res) => global.bc.listen(req, res))

network.listen(network.get('port'), () => {
  script.start()
})

// Catch Bot Connector message
global.bc.onTextMessage((data) => {
  script.bcMessage
})
