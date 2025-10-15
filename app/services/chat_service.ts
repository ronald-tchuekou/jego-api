import Conversation from '#models/conversation'
import Message, { MessageType } from '#models/message'
import MessageAttachment from '#models/message_attachment'
import Participant from '#models/participant'
import { inject } from '@adonisjs/core'
import db from '@adonisjs/lucid/services/db'
import transmit from '@adonisjs/transmit/services/main'

export interface CreateConversationData {
  participantIds: string[]
}

export interface SendMessageData {
  conversationId: string
  senderId: string
  content: string
  type?: MessageType
  attachments?: {
    name: string
    url: string
    type: string
    size: string
  }[]
}

@inject()
export default class ChatService {
  /**
   * Create a new conversation with participants
   */
  async createConversation(data: CreateConversationData): Promise<Conversation> {
    const { participantIds } = data

    if (participantIds.length < 2) {
      throw new Error('A conversation must have at least 2 participants')
    }

    // Check if conversation already exists between these participants
    const existingConversation = await this.findExistingConversation(participantIds)
    if (existingConversation) {
      return existingConversation
    }

    // Create new conversation
    const conversation = await Conversation.create({})

    // Add participants
    const participantData = participantIds.map((userId) => ({
      conversationId: conversation.id,
      userId,
    }))

    await Participant.createMany(participantData)

    // Load participants and return
    await conversation.load('participants', (query) => {
      query.preload('user')
    })

    return conversation
  }

  /**
   * Find existing conversation between participants
   */
  private async findExistingConversation(participantIds: string[]): Promise<Conversation | null> {
    if (participantIds.length !== 2) {
      return null // Only check for direct conversations (2 participants)
    }

    const conversations = await db
      .from('conversations')
      .join('participants as p1', 'conversations.id', 'p1.conversation_id')
      .join('participants as p2', 'conversations.id', 'p2.conversation_id')
      .where('p1.user_id', participantIds[0])
      .where('p2.user_id', participantIds[1])
      .where('p1.user_id', '!=', 'p2.user_id')
      .select('conversations.id')
      .groupBy('conversations.id')
      .havingRaw('COUNT(DISTINCT participants.user_id) = ?', [participantIds.length])

    if (conversations.length > 0) {
      return await Conversation.query()
        .where('id', conversations[0].id)
        .preload('participants', (query) => {
          query.preload('user')
        })
        .firstOrFail()
    }

    return null
  }

  /**
   * Get conversations for a user (returns all conversations with last message only)
   */
  async getUserConversations(userId: string): Promise<Conversation[]> {
    const conversations = await Conversation.query()
      .whereHas('participants', (query) => {
        query.where('userId', userId)
      })
      .preload('participants', (query) => {
        query.preload('user', (userQuery) => {
          userQuery.select(['id', 'firstName', 'lastName', 'profileImage'])
        })
      })
      .preload('messages', (query) => {
        query
          .orderBy('createdAt', 'desc')
          .limit(1)
          .preload('sender', (senderQuery) => {
            senderQuery.select(['id', 'firstName', 'lastName', 'profileImage'])
          })
          .preload('attachments')
      })
      .orderBy('updatedAt', 'desc')

    return conversations
  }

  /**
   * Get a specific conversation (without messages)
   */
  async getConversation(conversationId: string, userId: string): Promise<Conversation> {
    // Verify user is participant
    const participant = await Participant.query()
      .where('conversationId', conversationId)
      .where('userId', userId)
      .first()

    if (!participant) {
      throw new Error('You are not a participant in this conversation')
    }

    const conversation = await Conversation.query()
      .where('id', conversationId)
      .preload('participants', (query) => {
        query.preload('user', (userQuery) => {
          userQuery.select(['id', 'firstName', 'lastName', 'profileImage'])
        })
      })
      .firstOrFail()

    return conversation
  }

  /**
   * Get all messages for a conversation with pagination
   */
  async getConversationMessages(conversationId: string, userId: string, page = 1, limit = 50) {
    // Verify user is participant
    const participant = await Participant.query()
      .where('conversationId', conversationId)
      .where('userId', userId)
      .first()

    if (!participant) {
      throw new Error('You are not a participant in this conversation')
    }

    const messages = await Message.query()
      .where('conversationId', conversationId)
      .preload('sender', (senderQuery) => {
        senderQuery.select(['id', 'firstName', 'lastName', 'profileImage'])
      })
      .preload('attachments')
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    return messages
  }

  /**
   * Send a message in a conversation
   */
  async sendMessage(data: SendMessageData): Promise<Message> {
    const { conversationId, senderId, content, type, attachments = [] } = data

    // Verify sender is participant
    const participant = await Participant.query()
      .where('conversationId', conversationId)
      .where('userId', senderId)
      .first()

    if (!participant) {
      throw new Error('You are not a participant in this conversation')
    }

    // Create message
    const message = await Message.create({
      conversationId,
      senderId,
      content,
      type,
      isRead: false,
    })

    // Add attachments if any
    if (attachments.length > 0) {
      const attachmentData = attachments.map((attachment) => ({
        messageId: message.id,
        ...attachment,
      }))
      await MessageAttachment.createMany(attachmentData)
    }

    // Load relations
    await message.load('sender', (query) => {
      query.select(['id', 'firstName', 'lastName', 'profileImage'])
    })
    await message.load('attachments')

    // Update conversation timestamp
    await Conversation.query().where('id', conversationId).update({
      updatedAt: new Date(),
    })

    // Emit real-time event to conversation participants
    await this.broadcastMessage(conversationId, message)

    return message
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    // Verify user is participant
    const participant = await Participant.query()
      .where('conversationId', conversationId)
      .where('userId', userId)
      .first()

    if (!participant) {
      throw new Error('You are not a participant in this conversation')
    }

    // Mark all unread messages as read (except own messages)
    await Message.query()
      .where('conversationId', conversationId)
      .where('senderId', '!=', userId)
      .where('isRead', false)
      .update({ isRead: true })

    // Emit read status update
    await transmit.broadcast(`conversation.${conversationId}`, {
      type: 'messages_read',
      data: JSON.stringify({
        userId,
        conversationId,
      }),
    })
  }

  /**
   * Get unread message count for user
   */
  async getUnreadCount(userId: string): Promise<number> {
    const result = await db
      .from('messages')
      .join('participants', 'messages.conversation_id', 'participants.conversation_id')
      .where('participants.user_id', userId)
      .where('messages.sender_id', '!=', userId)
      .where('messages.is_read', false)
      .count('* as total')

    return result[0]?.total || 0
  }

  /**
   * Search messages in conversations
   */
  async searchMessages(userId: string, query: string, page = 1, limit = 20): Promise<Message[]> {
    const messages = await Message.query()
      .whereHas('conversation', (conversationQuery) => {
        conversationQuery.whereHas('participants', (participantQuery) => {
          participantQuery.where('userId', userId)
        })
      })
      .where('content', 'ILIKE', `%${query}%`)
      .preload('sender', (senderQuery) => {
        senderQuery.select(['id', 'firstName', 'lastName', 'profileImage'])
      })
      .preload('conversation', (conversationQuery) => {
        conversationQuery.preload('participants', (participantQuery) => {
          participantQuery.preload('user', (userQuery) => {
            userQuery.select(['id', 'firstName', 'lastName', 'profileImage'])
          })
        })
      })
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    return messages
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await Message.query().where('id', messageId).where('senderId', userId).first()

    if (!message) {
      throw new Error('Message not found or you are not the sender')
    }

    // Delete attachments first
    await MessageAttachment.query().where('messageId', messageId).delete()

    // Delete message
    await message.delete()

    // Emit deletion event
    await transmit.broadcast(`conversation.${message.conversationId}`, {
      type: 'message_deleted',
      data: JSON.stringify({
        messageId,
        conversationId: message.conversationId,
      }),
    })
  }

  /**
   * Broadcast message to conversation participants
   */
  private async broadcastMessage(conversationId: string, message: Message): Promise<void> {
    await transmit.broadcast(`conversation.${conversationId}`, {
      type: 'new_message',
      data: JSON.stringify(message),
    })
  }

  /**
   * Add participant to conversation
   */
  async addParticipant(conversationId: string, userId: string, addedBy: string): Promise<void> {
    // Verify addedBy is participant
    const adderParticipant = await Participant.query()
      .where('conversationId', conversationId)
      .where('userId', addedBy)
      .first()

    if (!adderParticipant) {
      throw new Error('You are not a participant in this conversation')
    }

    // Check if user is already participant
    const existingParticipant = await Participant.query()
      .where('conversationId', conversationId)
      .where('userId', userId)
      .first()

    if (existingParticipant) {
      throw new Error('User is already a participant')
    }

    // Add participant
    await Participant.create({
      conversationId,
      userId,
    })

    // Emit participant added event
    await transmit.broadcast(`conversation.${conversationId}`, {
      type: 'participant_added',
      data: JSON.stringify({
        conversationId,
        userId,
        addedBy,
      }),
    })
  }

  /**
   * Remove participant from conversation
   */
  async removeParticipant(
    conversationId: string,
    userId: string,
    removedBy: string
  ): Promise<void> {
    // Verify removedBy is participant
    const removerParticipant = await Participant.query()
      .where('conversationId', conversationId)
      .where('userId', removedBy)
      .first()

    if (!removerParticipant) {
      throw new Error('You are not a participant in this conversation')
    }

    // Remove participant
    const participant = await Participant.query()
      .where('conversationId', conversationId)
      .where('userId', userId)
      .first()

    if (!participant) {
      throw new Error('User is not a participant')
    }

    await participant.delete()

    // Emit participant removed event
    await transmit.broadcast(`conversation.${conversationId}`, {
      type: 'participant_removed',
      data: JSON.stringify({
        conversationId,
        userId,
        removedBy,
      }),
    })
  }
}
