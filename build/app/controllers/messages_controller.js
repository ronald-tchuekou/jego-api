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
import { inject } from '@adonisjs/core';
let MessagesController = class MessagesController {
    chatService;
    constructor(chatService) {
        this.chatService = chatService;
    }
    async store({ auth, request, response }) {
        try {
            const user = auth.getUserOrFail();
            const { conversationId, content, type, attachments } = request.only([
                'conversationId',
                'content',
                'type',
                'attachments',
            ]);
            if (!conversationId) {
                return response.badRequest({
                    success: false,
                    message: 'Conversation ID and content are required',
                });
            }
            if (!content && attachments.length === 0) {
                return response.badRequest({
                    success: false,
                    message: 'Content or attachments are required',
                });
            }
            const message = await this.chatService.sendMessage({
                conversationId,
                senderId: user.id,
                content,
                type: type || 'text',
                attachments: attachments || [],
            });
            return response.created({
                success: true,
                data: message,
                message: 'Message sent successfully',
            });
        }
        catch (error) {
            return response.badRequest({
                success: false,
                message: error.message,
            });
        }
    }
    async destroy({ auth, params, response }) {
        try {
            const user = auth.getUserOrFail();
            const { id } = params;
            await this.chatService.deleteMessage(id, user.id);
            return response.ok({
                success: true,
                message: 'Message deleted successfully',
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
MessagesController = __decorate([
    inject(),
    __metadata("design:paramtypes", [ChatService])
], MessagesController);
export default MessagesController;
//# sourceMappingURL=messages_controller.js.map