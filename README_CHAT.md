# JeGo API - Chat System

A real-time chat system built with AdonisJS and Transmit for the JeGo platform.

## 🚀 Features

- **Real-time messaging** with WebSocket support
- **Group conversations** with multiple participants
- **Message attachments** (images, files, documents)
- **Typing indicators** and user presence
- **Read receipts** and message status
- **Message search** across conversations
- **Participant management** (add/remove users)
- **Online/offline status** tracking
- **Message deletion** by sender
- **Pagination** for performance optimization

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- AdonisJS v6
- @adonisjs/transmit package

## 🛠️ Installation

The chat system is already integrated into the JeGo API. If you're setting up from scratch:

1. **Install dependencies** (already included in package.json):
```bash
npm install @adonisjs/transmit
```

2. **Run database migrations**:
```bash
node ace migration:run
```

3. **Start the server**:
```bash
npm run dev
```

## 📊 Database Schema

### Tables Created

- `conversations` - Chat conversation containers
- `participants` - Users participating in conversations  
- `messages` - Individual messages within conversations
- `message_attachments` - File attachments for messages

### Relationships

```
User (1) ←→ (N) Participant (N) ←→ (1) Conversation (1) ←→ (N) Message (1) ←→ (N) MessageAttachment
```

## 🔧 Configuration

### Transmit Setup

The WebSocket server is configured in `config/transmit.ts`:

```typescript
export default defineConfig({
  pingInterval: false,
  transport: null,
})
```

### Real-time Events

Event handlers are configured in `start/transmit.ts` for:
- Connection/disconnection tracking
- Channel subscription management
- User presence monitoring
- Typing indicators

## 📡 API Endpoints

### Base URL
All chat endpoints are prefixed with `/v1/chat` and require authentication.

### Conversations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/conversations` | List user's conversations (with last message only) |
| POST | `/conversations` | Create new conversation |
| GET | `/conversations/:id` | Get conversation details (without messages) |
| GET | `/conversations/:id/messages` | Get all messages in conversation (paginated) |
| PATCH | `/conversations/:id/mark-read` | Mark messages as read |
| GET | `/conversations/unread-count` | Get unread message count |
| GET | `/conversations/search-messages` | Search messages |
| POST | `/conversations/:id/participants` | Add participant |
| DELETE | `/conversations/:id/participants` | Remove participant |
| POST | `/conversations/:id/typing` | Send typing indicator |
| GET | `/conversations/:id/active-users` | Get active users |
| GET | `/conversations/user-status/:userId` | Check user online status |

### Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/messages` | Send message |
| DELETE | `/messages/:id` | Delete message |

## 🔄 Real-time Events

### WebSocket Connection

```javascript
// Connect to WebSocket
const transmit = new Transmit({
  baseUrl: 'ws://localhost:3333'
})

// Subscribe to conversation
transmit.subscribe('conversation.{conversationId}')

// Subscribe to user presence
transmit.subscribe('user.{userId}')
```

### Event Types

#### Conversation Events (`conversation.{id}`)

- `new_message` - New message received
- `message_deleted` - Message was deleted
- `messages_read` - Messages marked as read
- `typing_indicator` - User typing status
- `participant_added` - New participant joined
- `participant_removed` - Participant left

#### User Presence Events (`user.{id}`)

- `user_online` - User came online
- `user_offline` - User went offline

**Note**: All events now use a consistent JSON stringified data format in the `data` field for better structure and parsing.

## 💻 Usage Examples

### Getting Conversations List

```javascript
// Get all conversations with last message only
const response = await fetch('/v1/chat/conversations', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})

const { data: conversations } = await response.json()
// Each conversation includes participants and the last message
```

### Getting Conversation Messages

```javascript
// Get paginated messages for a specific conversation
const response = await fetch('/v1/chat/conversations/conv_123/messages?page=1&limit=50', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})

const { data: messages } = await response.json()
```

### Creating a Conversation

```javascript
const response = await fetch('/v1/chat/conversations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    participantIds: ['user_1', 'user_2']
  })
})

const { data: conversation } = await response.json()
```

### Sending a Message

```javascript
// Text message
const response = await fetch('/v1/chat/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    conversationId: 'conv_123',
    content: 'Hello world!',
    type: 'text'
  })
})

// Message with attachments only
const response = await fetch('/v1/chat/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    conversationId: 'conv_123',
    type: 'attachment',
    attachments: [
      {
        name: 'document.pdf',
        url: '/storage/uploads/document.pdf',
        type: 'application/pdf',
        size: '1024000'
      }
    ]
  })
})

// Text message with attachments
const response = await fetch('/v1/chat/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    conversationId: 'conv_123',
    content: 'Check out this document!',
    type: 'text_attachment',
    attachments: [
      {
        name: 'document.pdf',
        url: '/storage/uploads/document.pdf',
        type: 'application/pdf',
        size: '1024000'
      }
    ]
  })
})
```

### Real-time Message Listening

```javascript
// Listen for events
transmit.on('conversation.conv_123', (event) => {
  const data = JSON.parse(event.data)
  
  switch (event.type) {
    case 'new_message':
      displayMessage(data) // Full message object
      break
    case 'typing_indicator':
      showTypingIndicator(data.userId, data.isTyping)
      break
    case 'messages_read':
      updateReadStatus(data.userId, data.conversationId)
      break
    case 'message_deleted':
      removeMessage(data.messageId)
      break
    case 'participant_added':
      addParticipant(data.userId, data.addedBy)
      break
    case 'participant_removed':
      removeParticipant(data.userId, data.removedBy)
      break
  }
})

// Listen for user presence events
transmit.on('user.user_456', (event) => {
  const data = JSON.parse(event.data)
  
  switch (event.type) {
    case 'user_online':
      updateUserStatus(data.userId, true)
      break
    case 'user_offline':
      updateUserStatus(data.userId, false)
      break
  }
})
```

### Sending Typing Indicator

```javascript
// User starts typing
await fetch('/v1/chat/conversations/conv_123/typing', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({ isTyping: true })
})

// User stops typing (after delay)
setTimeout(async () => {
  await fetch('/v1/chat/conversations/conv_123/typing', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_TOKEN'
    },
    body: JSON.stringify({ isTyping: false })
  })
}, 3000)
```

## 🏗️ Architecture

### Service Layer

**ChatService** (`app/services/chat_service.ts`)
- Core business logic for chat operations
- Conversation and message management
- Real-time event broadcasting
- Security validation

### Controllers

**ConversationsController** (`app/controllers/conversations_controller.ts`)
- HTTP endpoints for conversation management
- Real-time feature endpoints

**MessagesController** (`app/controllers/messages_controller.ts`)
- Message sending and deletion endpoints

### Models

**Conversation** (`app/models/conversation.ts`)
- Conversation entity with participants and messages

**Message** (`app/models/message.ts`)
- Message entity with sender and attachments
- Supports message types: `text`, `attachment`, `text_attachment`

**Participant** (`app/models/participant.ts`)
- User participation in conversations

**MessageAttachment** (`app/models/message_attachment.ts`)
- File attachments for messages

## 🔒 Security

### Authentication
- All endpoints require valid JWT authentication
- User identity verified through `auth.getUserOrFail()`

### Authorization
- Users can only access conversations they participate in
- Message deletion restricted to sender
- Participant management validated

### Channel Security
- WebSocket channel subscriptions validated
- Conversation access verified before joining channels

## ⚡ Performance

### Optimization Features
- **Conversation List**: Returns all conversations with only the last message for quick loading
- **Message Pagination**: Large message lists are paginated separately for better performance
- **Selective Loading**: Only necessary relations loaded
- **Connection Pooling**: Transmit handles WebSocket connections efficiently
- **Channel Cleanup**: Inactive channels automatically cleaned up

### Database Indexing
Ensure these indexes exist for optimal performance:

```sql
-- Conversations
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);

-- Participants
CREATE INDEX idx_participants_user_conversation ON participants(user_id, conversation_id);
CREATE INDEX idx_participants_conversation ON participants(conversation_id);

-- Messages
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_read ON messages(is_read, conversation_id);

-- Message Attachments
CREATE INDEX idx_message_attachments_message ON message_attachments(message_id);
```

## 🧪 Testing

### Manual Testing

1. **Get conversations list**:
```bash
curl -X GET http://localhost:3333/v1/chat/conversations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

2. **Get conversation messages**:
```bash
curl -X GET "http://localhost:3333/v1/chat/conversations/conv_123/messages?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

3. **Create conversation**:
```bash
curl -X POST http://localhost:3333/v1/chat/conversations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"participantIds": ["user_1", "user_2"]}'
```

4. **Send message**:
```bash
curl -X POST http://localhost:3333/v1/chat/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"conversationId": "conv_123", "content": "Hello!", "type": "text"}'
```

3. **WebSocket testing**:
Use a WebSocket client to connect to `ws://localhost:3333/__transmit/events` and test real-time features.

## 🐛 Troubleshooting

### Common Issues

1. **WebSocket connection fails**:
   - Check if Transmit is properly configured
   - Verify server is running on correct port
   - Check firewall/proxy settings

2. **Messages not appearing in real-time**:
   - Verify WebSocket connection is active
   - Check if user is subscribed to correct channel
   - Ensure proper authentication

3. **Permission errors**:
   - Verify user is participant in conversation
   - Check JWT token validity
   - Ensure proper user authentication

### Debug Mode

Enable detailed logging in `start/transmit.ts` by adding:

```typescript
transmit.on('connect', ({ uid }) => {
  console.log(`[DEBUG] Client connected: ${uid}`)
})

transmit.on('broadcast', ({ channel, data }) => {
  console.log(`[DEBUG] Broadcasting to ${channel}:`, data)
})
```

## 📝 API Response Examples

### Successful Response
```json
{
  "success": true,
  "data": {
    "id": "conv_123",
    "createdAt": "2023-01-01T00:00:00Z",
    "participants": [...],
    "messages": [...]
  },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "message": "You are not a participant in this conversation"
}
```

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Add proper error handling and validation
3. Include JSDoc comments for new methods
4. Test real-time functionality thoroughly
5. Update documentation for new features

## 📄 License

This chat system is part of the JeGo API project. Please refer to the main project license.

## 🔗 Related Documentation

- [Full API Documentation](./CHAT_API_DOCUMENTATION.md)
- [AdonisJS Documentation](https://docs.adonisjs.com/)
- [Transmit Documentation](https://docs.adonisjs.com/guides/transmit)
- [WebSocket API Reference](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
