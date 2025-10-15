import logger from '@adonisjs/core/services/logger'
import transmit from '@adonisjs/transmit/services/main'

// Configuration des canaux et événements
transmit.on('connect', ({ uid }) => {
  logger.info(`Client connecté: ${uid}`)
})

transmit.on('disconnect', ({ uid }) => {
  logger.info(`Client déconnecté: ${uid}`)
})

transmit.on('subscribe', ({ uid, channel }) => {
  logger.info(`Client ${uid} s'abonne au canal: ${channel}`)
})

transmit.on('unsubscribe', ({ uid, channel }) => {
  logger.info(`Client ${uid} se désabonne du canal: ${channel}`)
})

export default transmit
