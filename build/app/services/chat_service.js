var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import Conversation from '#models/conversation';
import Message from '#models/message';
import MessageAttachment from '#models/message_attachment';
import Participant from '#models/participant';
import { inject } from '@adonisjs/core';
import db from '@adonisjs/lucid/services/db';
import transmit from '@adonisjs/transmit/services/main';
let ChatService = class ChatService {
    async createConversation(data) {
        const { participantIds } = data;
        if (participantIds.length < 2) {
            throw new Error('A conversation must have at least 2 participants');
        }
        const existingConversation = await this.findExistingConversation(participantIds);
        if (existingConversation) {
            return existingConversation;
        }
        const conversation = await Conversation.create({});
        const participantData = participantIds.map((userId) => ({
            conversationId: conversation.id,
            userId,
        }));
        await Participant.createMany(participantData);
        await conversation.load('participants', (query) => {
            query.preload('user');
        });
        return conversation;
    }
    async getUserConversations(userId) {
        return Conversation.query()
            .whereHas('participants', (query) => {
            query.where('userId', userId);
        })
            .preload('participants', (query) => {
            query.preload('user');
        })
            .preload('messages', (query) => {
            query.orderBy('createdAt', 'desc').preload('sender');
        })
            .orderBy('updatedAt', 'desc');
    }
    async getConversation(conversationId, userId) {
        const participant = await Participant.query()
            .where('conversationId', conversationId)
            .where('userId', userId)
            .first();
        if (!participant) {
            throw new Error('You are not a participant in this conversation');
        }
        return Conversation.query()
            .where('id', conversationId)
            .preload('participants', (query) => {
            query.preload('user', (userQuery) => {
                userQuery.select(['id', 'firstName', 'lastName', 'profileImage']);
            });
        })
            .firstOrFail();
    }
    async getConversationMessages(conversationId, userId, page = 1, limit = 50) {
        const participant = await Participant.query()
            .where('conversationId', conversationId)
            .where('userId', userId)
            .first();
        if (!participant) {
            throw new Error('You are not a participant in this conversation');
        }
        return Message.query()
            .where('conversationId', conversationId)
            .preload('sender', (senderQuery) => {
            senderQuery.select(['id', 'firstName', 'lastName', 'profileImage']);
        })
            .preload('attachments')
            .orderBy('createdAt', 'desc')
            .paginate(page, limit);
    }
    async sendMessage(data) {
        const { conversationId, senderId, content, type, attachments = [] } = data;
        const participant = await Participant.query()
            .where('conversationId', conversationId)
            .where('userId', senderId)
            .first();
        if (!participant) {
            throw new Error('You are not a participant in this conversation');
        }
        const message = await Message.create({
            conversationId,
            senderId,
            content,
            type,
            isRead: false,
        });
        if (attachments.length > 0) {
            const attachmentData = attachments.map((attachment) => ({
                messageId: message.id,
                ...attachment,
            }));
            await MessageAttachment.createMany(attachmentData);
        }
        await message.load('sender', (query) => {
            query.select(['id', 'firstName', 'lastName', 'profileImage']);
        });
        await message.load('attachments');
        await Conversation.query().where('id', conversationId).update({
            updatedAt: new Date(),
        });
        await this.broadcastMessage(conversationId, message);
        return message;
    }
    async markMessagesAsRead(conversationId, userId) {
        const participant = await Participant.query()
            .where('conversationId', conversationId)
            .where('userId', userId)
            .first();
        if (!participant) {
            throw new Error('You are not a participant in this conversation');
        }
        await Message.query()
            .where('conversationId', conversationId)
            .where('senderId', '!=', userId)
            .where('isRead', false)
            .update({ isRead: true });
        await transmit.broadcast(`conversation.${conversationId}`, {
            type: 'messages_read',
            data: JSON.stringify({
                userId,
                conversationId,
            }),
        });
    }
    async getUnreadCount(userId) {
        const result = await db
            .from('messages')
            .join('participants', 'messages.conversation_id', 'participants.conversation_id')
            .where('participants.user_id', userId)
            .where('messages.sender_id', '!=', userId)
            .where('messages.is_read', false)
            .count('* as total');
        return result[0]?.total || 0;
    }
    async searchMessages(userId, query, page = 1, limit = 20) {
        return Message.query()
            .whereHas('conversation', (conversationQuery) => {
            conversationQuery.whereHas('participants', (participantQuery) => {
                participantQuery.where('userId', userId);
            });
        })
            .where('content', 'ILIKE', `%${query}%`)
            .preload('sender', (senderQuery) => {
            senderQuery.select(['id', 'firstName', 'lastName', 'profileImage']);
        })
            .preload('conversation', (conversationQuery) => {
            conversationQuery.preload('participants', (participantQuery) => {
                participantQuery.preload('user', (userQuery) => {
                    userQuery.select(['id', 'firstName', 'lastName', 'profileImage']);
                });
            });
        })
            .orderBy('createdAt', 'desc')
            .paginate(page, limit);
    }
    async deleteMessage(messageId, userId) {
        const message = await Message.query().where('id', messageId).where('senderId', userId).first();
        if (!message) {
            throw new Error('Message not found or you are not the sender');
        }
        await MessageAttachment.query().where('messageId', messageId).delete();
        await message.delete();
        await transmit.broadcast(`conversation.${message.conversationId}`, {
            type: 'message_deleted',
            data: JSON.stringify({
                messageId,
                conversationId: message.conversationId,
            }),
        });
    }
    async addParticipant(conversationId, userId, addedBy) {
        const adderParticipant = await Participant.query()
            .where('conversationId', conversationId)
            .where('userId', addedBy)
            .first();
        if (!adderParticipant) {
            throw new Error('You are not a participant in this conversation');
        }
        const existingParticipant = await Participant.query()
            .where('conversationId', conversationId)
            .where('userId', userId)
            .first();
        if (existingParticipant) {
            throw new Error('User is already a participant');
        }
        await Participant.create({
            conversationId,
            userId,
        });
        await transmit.broadcast(`conversation.${conversationId}`, {
            type: 'participant_added',
            data: JSON.stringify({
                conversationId,
                userId,
                addedBy,
            }),
        });
    }
    async removeParticipant(conversationId, userId, removedBy) {
        const removerParticipant = await Participant.query()
            .where('conversationId', conversationId)
            .where('userId', removedBy)
            .first();
        if (!removerParticipant) {
            throw new Error('You are not a participant in this conversation');
        }
        const participant = await Participant.query()
            .where('conversationId', conversationId)
            .where('userId', userId)
            .first();
        if (!participant) {
            throw new Error('User is not a participant');
        }
        await participant.delete();
        await transmit.broadcast(`conversation.${conversationId}`, {
            type: 'participant_removed',
            data: JSON.stringify({
                conversationId,
                userId,
                removedBy,
            }),
        });
    }
    async findExistingConversation(participantIds) {
        if (participantIds.length !== 2) {
            return null;
        }
        const conversations = await db
            .from('conversations')
            .join('participants as p1', 'conversations.id', 'p1.conversation_id')
            .join('participants as p2', 'conversations.id', 'p2.conversation_id')
            .where('p1.user_id', participantIds[0])
            .where('p2.user_id', participantIds[1])
            .whereRaw('p1.user_id != p2.user_id')
            .select('conversations.id')
            .groupBy('conversations.id')
            .havingRaw('COUNT(DISTINCT CASE WHEN p1.user_id = ? OR p1.user_id = ? THEN p1.user_id END) = ?', [participantIds[0], participantIds[1], participantIds.length]);
        if (conversations.length > 0) {
            return await Conversation.query()
                .where('id', conversations[0].id)
                .preload('participants', (query) => {
                query.preload('user');
            })
                .firstOrFail();
        }
        return null;
    }
    async broadcastMessage(conversationId, message) {
        await transmit.broadcast(`conversation.${conversationId}`, {
            type: 'new_message',
            data: JSON.stringify(message),
        });
    }
};
ChatService = __decorate([
    inject()
], ChatService);
export default ChatService;
//# sourceMappingURL=chat_service.js.map