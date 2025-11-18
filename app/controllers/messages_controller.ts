import ChatService from '#services/chat_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class MessagesController {
  constructor(private chatService: ChatService) {}

  /**
   * Send a message in a conversation
   */
  async store({ auth, request, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const { conversationId, content, type, attachments } = request.only([
        'conversationId',
        'content',
        'type',
        'attachments',
      ])

      if (!conversationId) {
        return response.badRequest({
          success: false,
          message: 'Conversation ID and content are required',
        })
      }

      if (!content && attachments.length === 0) {
        return response.badRequest({
          success: false,
          message: 'Content or attachments are required',
        })
      }

      const message = await this.chatService.sendMessage({
        conversationId,
        senderId: user.id,
        content,
        type: type || 'text',
        attachments: attachments || [],
      })

      return response.created({
        success: true,
        data: message,
        message: 'Message sent successfully',
      })
    } catch (error) {
      return response.badRequest({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * Delete a message
   */
  async destroy({ auth, params, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const { id } = params

      await this.chatService.deleteMessage(id, user.id)

      return response.ok({
        success: true,
        message: 'Message deleted successfully',
      })
    } catch (error) {
      return response.badRequest({
        success: false,
        message: error.message,
      })
    }
  }
}
