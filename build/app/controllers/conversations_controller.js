var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import ChatService from '#services/chat_service';
import { chatTransmit } from '#start/transmit';
import { inject } from '@adonisjs/core';
let ConversationsController = class ConversationsController {
    chatService;
    constructor(chatService) {
        this.chatService = chatService;
    }
    async index({ auth, response }) {
        try {
            const user = auth.getUserOrFail();
            const conversations = await this.chatService.getUserConversations(user.id);
            return response.ok({
                success: true,
                data: conversations,
            });
        }
        catch (error) {
            return response.badRequest({
                success: false,
                message: error.message,
            });
        }
    }
    async store({ auth, request, response }) {
        try {
            const user = auth.getUserOrFail();
            const { participantIds } = request.only(['participantIds']);
            const allParticipants = [...new Set([user.id, ...participantIds])];
            const conversation = await this.chatService.createConversation({
                participantIds: allParticipants,
            });
            return response.created({
                success: true,
                data: conversation,
                message: 'Conversation created successfully',
            });
        }
        catch (error) {
            return response.badRequest({
                success: false,
                message: error.message,
            });
        }
    }
    async show({ auth, params, response }) {
        try {
            const user = auth.getUserOrFail();
            const { id } = params;
            const conversation = await this.chatService.getConversation(id, user.id);
            return response.ok({
                success: true,
                data: conversation,
            });
        }
        catch (error) {
            return response.badRequest({
                success: false,
                message: error.message,
            });
        }
    }
    async getMessages({ auth, params, request, response }) {
        try {
            const user = auth.getUserOrFail();
            const { id } = params;
            const page = request.input('page', 1);
            const limit = request.input('limit', 50);
            const messages = await this.chatService.getConversationMessages(id, user.id, page, limit);
            return response.ok({
                success: true,
                data: messages,
            });
        }
        catch (error) {
            return response.badRequest({
                success: false,
                message: error.message,
            });
        }
    }
    async markAsRead({ auth, params, response }) {
        try {
            const user = auth.getUserOrFail();
            const { id } = params;
            await this.chatService.markMessagesAsRead(id, user.id);
            return response.ok({
                success: true,
                message: 'Messages marked as read',
            });
        }
        catch (error) {
            return response.badRequest({
                success: false,
                message: error.message,
            });
        }
    }
    async unreadCount({ auth, response }) {
        try {
            const user = auth.getUserOrFail();
            const count = await this.chatService.getUnreadCount(user.id);
            return response.ok({
                success: true,
                data: { count },
            });
        }
        catch (error) {
            return response.badRequest({
                success: false,
                message: error.message,
            });
        }
    }
    async searchMessages({ auth, request, response }) {
        try {
            const user = auth.getUserOrFail();
            const { query } = request.only(['query']);
            const page = request.input('page', 1);
            const limit = request.input('limit', 20);
            if (!query || query.trim().length < 2) {
                return response.badRequest({
                    success: false,
                    message: 'Search query must be at least 2 characters long',
                });
            }
            const messages = await this.chatService.searchMessages(user.id, query, page, limit);
            return response.ok({
                success: true,
                data: messages,
            });
        }
        catch (error) {
            return response.badRequest({
                success: false,
                message: error.message,
            });
        }
    }
    async addParticipant({ auth, params, request, response }) {
        try {
            const user = auth.getUserOrFail();
            const { id } = params;
            const { userId } = request.only(['userId']);
            await this.chatService.addParticipant(id, userId, user.id);
            return response.ok({
                success: true,
                message: 'Participant added successfully',
            });
        }
        catch (error) {
            return response.badRequest({
                success: false,
                message: error.message,
            });
        }
    }
    async removeParticipant({ auth, params, request, response }) {
        try {
            const user = auth.getUserOrFail();
            const { id } = params;
            const { userId } = request.only(['userId']);
            await this.chatService.removeParticipant(id, userId, user.id);
            return response.ok({
                success: true,
                message: 'Participant removed successfully',
            });
        }
        catch (error) {
            return response.badRequest({
                success: false,
                message: error.message,
            });
        }
    }
    async typing({ auth, params, request, response }) {
        try {
            const user = auth.getUserOrFail();
            const { id } = params;
            const { isTyping } = request.only(['isTyping']);
            chatTransmit.broadcastTyping(id, user.id, isTyping || false).then();
            return response.ok({
                success: true,
                message: 'Typing indicator sent',
            });
        }
        catch (error) {
            return response.badRequest({
                success: false,
                message: error.message,
            });
        }
    }
    async activeUsers({ params, response }) {
        try {
            const { id } = params;
            const activeUsers = chatTransmit.getActiveUsersInConversation(id);
            return response.ok({
                success: true,
                data: { activeUsers },
            });
        }
        catch (error) {
            return response.badRequest({
                success: false,
                message: error.message,
            });
        }
    }
    async userStatus({ params, response }) {
        try {
            const { userId } = params;
            const isOnline = chatTransmit.isUserOnline(userId);
            return response.ok({
                success: true,
                data: { userId, isOnline },
            });
        }
        catch (error) {
            return response.badRequest({
                success: false,
                message: error.message,
            });
        }
    }
};
ConversationsController = __decorate([
    inject(),
    __metadata("design:paramtypes", [ChatService])
], ConversationsController);
export default ConversationsController;
//# sourceMappingURL=conversations_controller.js.map