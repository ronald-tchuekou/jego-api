import logger from '@adonisjs/core/services/logger';
import transmit from '@adonisjs/transmit/services/main';
const activeUsers = new Map();
transmit.on('connect', ({ uid }) => {
    logger.info(`Client connecté: ${uid}`);
    activeUsers.set(uid, new Set());
});
transmit.on('disconnect', ({ uid }) => {
    logger.info(`Client déconnecté: ${uid}`);
    activeUsers.delete(uid);
});
transmit.on('subscribe', ({ uid, channel }) => {
    logger.info(`Client ${uid} s'abonne au canal: ${channel}`);
    if (activeUsers.has(uid)) {
        activeUsers.get(uid).add(channel);
    }
    if (channel.startsWith('conversation.')) {
        logger.info(`User ${uid} joined conversation channel: ${channel}`);
    }
    if (channel.startsWith('user.')) {
        const userId = channel.split('.')[1];
        if (userId === uid) {
            transmit.broadcast(channel, {
                type: 'user_online',
                data: JSON.stringify({
                    userId: uid,
                    timestamp: new Date().toISOString(),
                }),
            });
        }
    }
});
transmit.on('unsubscribe', ({ uid, channel }) => {
    logger.info(`Client ${uid} se désabonne du canal: ${channel}`);
    if (activeUsers.has(uid)) {
        activeUsers.get(uid).delete(channel);
    }
    if (channel.startsWith('user.')) {
        const userId = channel.split('.')[1];
        if (userId === uid) {
            transmit.broadcast(channel, {
                type: 'user_offline',
                data: JSON.stringify({
                    userId: uid,
                    timestamp: new Date().toISOString(),
                }),
            });
        }
    }
});
export const chatTransmit = {
    broadcastTyping: async (conversationId, userId, isTyping) => {
        transmit.broadcast(`conversation.${conversationId}`, {
            type: 'typing_indicator',
            data: JSON.stringify({
                userId,
                isTyping,
                timestamp: new Date().toISOString(),
            }),
        });
    },
    broadcastUserStatus: async (userId, isOnline) => {
        transmit.broadcast(`user.${userId}`, {
            type: isOnline ? 'user_online' : 'user_offline',
            data: JSON.stringify({
                userId,
                timestamp: new Date().toISOString(),
            }),
        });
    },
    getActiveUsersInConversation: (conversationId) => {
        const channelName = `conversation.${conversationId}`;
        const activeUsersInChannel = [];
        for (const [uid, channels] of activeUsers.entries()) {
            if (channels.has(channelName)) {
                activeUsersInChannel.push(uid);
            }
        }
        return activeUsersInChannel;
    },
    isUserOnline: (userId) => {
        return activeUsers.has(userId);
    },
};
export default transmit;
//# sourceMappingURL=transmit.js.map