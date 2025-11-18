import logger from '@adonisjs/core/services/logger'
import transmit from '@adonisjs/transmit/services/main'

// Store active users and their channels
const activeUsers = new Map<string, Set<string>>()

// Configuration des canaux et événements
transmit.on('connect', ({ uid }) => {
  logger.info(`Client connecté: ${uid}`)
  activeUsers.set(uid, new Set())
})

transmit.on('disconnect', ({ uid }) => {
  logger.info(`Client déconnecté: ${uid}`)
  activeUsers.delete(uid)
})

transmit.on('subscribe', ({ uid, channel }) => {
  logger.info(`Client ${uid} s'abonne au canal: ${channel}`)

  // Add channel to user's active channels
  if (activeUsers.has(uid)) {
    activeUsers.get(uid)!.add(channel)
  }

  // Validate channel access for conversation channels
  if (channel.startsWith('conversation.')) {
    // Here you could add additional validation to ensure
    // the user has permission to join this conversation channel
    logger.info(`User ${uid} joined conversation channel: ${channel}`)
  }

  // Handle user presence channels
  if (channel.startsWith('user.')) {
    const userId = channel.split('.')[1]
    if (userId === uid) {
      // User is subscribing to their own presence channel
      transmit.broadcast(channel, {
        type: 'user_online',
        data: JSON.stringify({
          userId: uid,
          timestamp: new Date().toISOString(),
        }),
      })
    }
  }
})

transmit.on('unsubscribe', ({ uid, channel }) => {
  logger.info(`Client ${uid} se désabonne du canal: ${channel}`)

  // Remove channel from user's active channels
  if (activeUsers.has(uid)) {
    activeUsers.get(uid)!.delete(channel)
  }

  // Handle user presence channels
  if (channel.startsWith('user.')) {
    const userId = channel.split('.')[1]
    if (userId === uid) {
      // User is unsubscribing from their own presence channel
      transmit.broadcast(channel, {
        type: 'user_offline',
        data: JSON.stringify({
          userId: uid,
          timestamp: new Date().toISOString(),
        }),
      })
    }
  }
})

// Helper functions for chat functionality
export const chatTransmit = {
  /**
   * Broadcast typing indicator to conversation
   */
  broadcastTyping: async (conversationId: string, userId: string, isTyping: boolean) => {
    transmit.broadcast(`conversation.${conversationId}`, {
      type: 'typing_indicator',
      data: JSON.stringify({
        userId,
        isTyping,
        timestamp: new Date().toISOString(),
      }),
    })
  },

  /**
   * Broadcast user online status
   */
  broadcastUserStatus: async (userId: string, isOnline: boolean) => {
    transmit.broadcast(`user.${userId}`, {
      type: isOnline ? 'user_online' : 'user_offline',
      data: JSON.stringify({
        userId,
        timestamp: new Date().toISOString(),
      }),
    })
  },

  /**
   * Get active users in a conversation
   */
  getActiveUsersInConversation: (conversationId: string): string[] => {
    const channelName = `conversation.${conversationId}`
    const activeUsersInChannel: string[] = []

    for (const [uid, channels] of activeUsers.entries()) {
      if (channels.has(channelName)) {
        activeUsersInChannel.push(uid)
      }
    }

    return activeUsersInChannel
  },

  /**
   * Check if user is online
   */
  isUserOnline: (userId: string): boolean => {
    return activeUsers.has(userId)
  },
}

export default transmit
