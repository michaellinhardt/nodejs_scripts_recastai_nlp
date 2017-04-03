import express from 'express'
import bodyParser from 'body-parser'

import config from '../config/private'
import Script from './script'

const script = new Script()

const network = express()
network.set('port', config.port)
network.use(bodyParser.json())
network.use('/', (req, res) => {
  res.status(200)
  process.stdout.write('Message received')
})

network.listen(network.get('port'), () => {
  process.stdout.write(`Listening port ${config.port}, running script..\r\n`)
  script.start()
})
