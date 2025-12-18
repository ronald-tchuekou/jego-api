import ChatService from '#services/chat_service'
import { chatTransmit } from '#start/transmit'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class ConversationsController {
  constructor(private chatService: ChatService) {}

  /**
   * Get all conversations for the authenticated user (with last message only)
   */
  async index({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()

      const conversations = await this.chatService.getUserConversations(user.id)

      return response.ok({
        success: true,
        data: conversations,
      })
    } catch (error) {
      return response.badRequest({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * Create a new conversation
   */
  async store({ auth, request, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const { participantIds } = request.only(['participantIds'])

      // Add current user to participants if not already included
      const allParticipants = [...new Set([user.id, ...participantIds])]

      const conversation = await this.chatService.createConversation({
        participantIds: allParticipants,
      })

      return response.created({
        success: true,
        data: conversation,
        message: 'Conversation created successfully',
      })
    } catch (error) {
      return response.badRequest({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * Get a specific conversation (without messages)
   */
  async show({ auth, params, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const { id } = params

      const conversation = await this.chatService.getConversation(id, user.id)

      return response.ok({
        success: true,
        data: conversation,
      })
    } catch (error) {
      return response.badRequest({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * Get all messages for a specific conversation with pagination
   */
  async getMessages({ auth, params, request, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const { id } = params
      const page = request.input('page', 1)
      const limit = request.input('limit', 50)

      const messages = await this.chatService.getConversationMessages(id, user.id, page, limit)

      return response.ok({
        success: true,
        data: messages,
      })
    } catch (error) {
      return response.badRequest({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * Mark messages in a conversation as read
   */
  async markAsRead({ auth, params, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const { id } = params

      await this.chatService.markMessagesAsRead(id, user.id)

      return response.ok({
        success: true,
        message: 'Messages marked as read',
      })
    } catch (error) {
      return response.badRequest({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * Get unread message count for the user
   */
  async unreadCount({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const count = await this.chatService.getUnreadCount(user.id)

      return response.ok({
        success: true,
        data: { count },
      })
    } catch (error) {
      return response.badRequest({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * Search messages across all conversations
   */
  async searchMessages({ auth, request, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const { query } = request.only(['query'])
      const page = request.input('page', 1)
      const limit = request.input('limit', 20)

      if (!query || query.trim().length < 2) {
        return response.badRequest({
          success: false,
          message: 'Search query must be at least 2 characters long',
        })
      }

      const messages = await this.chatService.searchMessages(user.id, query, page, limit)

      return response.ok({
        success: true,
        data: messages,
      })
    } catch (error) {
      return response.badRequest({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * Add a participant to a conversation
   */
  async addParticipant({ auth, params, request, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const { id } = params
      const { userId } = request.only(['userId'])

      await this.chatService.addParticipant(id, userId, user.id)

      return response.ok({
        success: true,
        message: 'Participant added successfully',
      })
    } catch (error) {
      return response.badRequest({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * Remove a participant from a conversation
   */
  async removeParticipant({ auth, params, request, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const { id } = params
      const { userId } = request.only(['userId'])

      await this.chatService.removeParticipant(id, userId, user.id)

      return response.ok({
        success: true,
        message: 'Participant removed successfully',
      })
    } catch (error) {
      return response.badRequest({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * Send typing indicator
   */
  async typing({ auth, params, request, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const { id } = params
      const { isTyping } = request.only(['isTyping'])

      chatTransmit.broadcastTyping(id, user.id, isTyping || false).then()

      return response.ok({
        success: true,
        message: 'Typing indicator sent',
      })
    } catch (error) {
      return response.badRequest({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * Get active users in conversation
   */
  async activeUsers({ params, response }: HttpContext) {
    try {
      const { id } = params
      const activeUsers = chatTransmit.getActiveUsersInConversation(id)

      return response.ok({
        success: true,
        data: { activeUsers },
      })
    } catch (error) {
      return response.badRequest({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * Check if user is online
   */
  async userStatus({ params, response }: HttpContext) {
    try {
      const { userId } = params
      const isOnline = chatTransmit.isUserOnline(userId)

      return response.ok({
        success: true,
        data: { userId, isOnline },
      })
    } catch (error) {
      return response.badRequest({
        success: false,
        message: error.message,
      })
    }
  }
}
