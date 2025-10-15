# Chat API Documentation

This document describes the chat functionality implemented in the JeGo API, including REST endpoints and real-time features using Transmit.

## Overview

The chat system consists of:
- **Conversations**: Group chats between multiple participants
- **Messages**: Text or media messages within conversations
- **Real-time features**: Live messaging, typing indicators, and presence status
- **Message attachments**: File attachments support

## Models

### Conversation
- `id`: Unique identifier
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp
- **Relations**: `participants`, `messages`

### Participant
- `id`: Unique identifier
- `conversationId`: Reference to conversation
- `userId`: Reference to user
- **Relations**: `conversation`, `user`

### Message
- `id`: Unique identifier
- `conversationId`: Reference to conversation
- `senderId`: Reference to sender user
- `content`: Message text content
- `isRead`: Read status
- `type`: Message type (text, attachment, text_attachment)
- **Relations**: `conversation`, `sender`, `attachments`

### MessageAttachment
- `id`: Unique identifier
- `messageId`: Reference to message
- `name`: File name
- `url`: File URL
- `type`: MIME type
- `size`: File size
- **Relations**: `message`

## Message Types

The system supports three message types:

- **`text`**: Text-only messages with content but no attachments
- **`attachment`**: Attachment-only messages with files but no text content
- **`text_attachment`**: Messages with both text content and file attachments

These types are defined in the `MessageType` enum and help clients render messages appropriately.

## REST API Endpoints

All chat endpoints are prefixed with `/v1/chat` and require authentication.

### Conversations

#### GET /v1/chat/conversations
Get all conversations for the authenticated user with only the last message.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "conv_123",
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T12:00:00Z",
      "participants": [
        {
          "id": "part_1",
          "userId": "user_456",
          "user": {
            "id": "user_456",
            "firstName": "John",
            "lastName": "Doe",
            "profileImage": "..."
          }
        }
      ],
      "messages": [
        {
          "id": "msg_789",
          "content": "Last message content",
          "type": "text",
          "createdAt": "2023-01-01T12:00:00Z",
          "sender": {
            "id": "user_456",
            "firstName": "John",
            "lastName": "Doe",
            "profileImage": "..."
          },
          "attachments": []
        }
      ]
    }
  ]
}
```

#### POST /v1/chat/conversations
Create a new conversation.

**Body:**
```json
{
  "participantIds": ["user_1", "user_2"]
}
```

#### GET /v1/chat/conversations/:id
Get a specific conversation details (without messages).

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "conv_123",
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T12:00:00Z",
    "participants": [
      {
        "id": "part_1",
        "userId": "user_456",
        "user": {
          "id": "user_456",
          "firstName": "John",
          "lastName": "Doe",
          "profileImage": "..."
        }
      }
    ]
  }
}
```

#### GET /v1/chat/conversations/:id/messages
Get all messages for a specific conversation with pagination.

**Query Parameters:**
- `page` (optional): Page number for messages (default: 1)
- `limit` (optional): Messages per page (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "msg_123",
      "conversationId": "conv_123",
      "senderId": "user_456",
      "content": "Hello world!",
      "type": "text",
      "isRead": true,
      "createdAt": "2023-01-01T12:00:00Z",
      "sender": {
        "id": "user_456",
        "firstName": "John",
        "lastName": "Doe",
        "profileImage": "..."
      },
      "attachments": []
    }
  ]
}
```

#### PATCH /v1/chat/conversations/:id/mark-read
Mark all messages in a conversation as read.

#### GET /v1/chat/conversations/unread-count
Get total unread message count for the user.

#### GET /v1/chat/conversations/search-messages
Search messages across all conversations.

**Query Parameters:**
- `query`: Search term (minimum 2 characters)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

#### POST /v1/chat/conversations/:id/participants
Add a participant to a conversation.

**Body:**
```json
{
  "userId": "user_123"
}
```

#### DELETE /v1/chat/conversations/:id/participants
Remove a participant from a conversation.

**Body:**
```json
{
  "userId": "user_123"
}
```

### Real-time Features

#### POST /v1/chat/conversations/:id/typing
Send typing indicator.

**Body:**
```json
{
  "isTyping": true
}
```

#### GET /v1/chat/conversations/:id/active-users
Get list of currently active users in a conversation.

#### GET /v1/chat/conversations/user-status/:userId
Check if a user is currently online.

### Messages

#### POST /v1/chat/messages
Send a message.

**Body Examples:**

Text message:
```json
{
  "conversationId": "conv_123",
  "content": "Hello world!",
  "type": "text"
}
```

Attachment only message:
```json
{
  "conversationId": "conv_123",
  "type": "attachment",
  "attachments": [
    {
      "name": "image.jpg",
      "url": "/storage/uploads/image.jpg",
      "type": "image/jpeg",
      "size": "1024000"
    }
  ]
}
```

Text with attachments:
```json
{
  "conversationId": "conv_123",
  "content": "Check out this image!",
  "type": "text_attachment",
  "attachments": [
    {
      "name": "image.jpg",
      "url": "/storage/uploads/image.jpg",
      "type": "image/jpeg",
      "size": "1024000"
    }
  ]
}
```

**Validation Rules:**
- Either `content` or `attachments` must be provided (or both)
- `conversationId` is required
- `type` defaults to "text" if not specified

#### DELETE /v1/chat/messages/:id
Delete a message (only sender can delete).

## Real-time Events (Transmit)

The chat system uses WebSocket connections through Transmit for real-time features.

### Connection

Connect to the WebSocket endpoint and authenticate:
```javascript
const transmit = new Transmit({
  baseUrl: 'ws://localhost:3333',
  // Add authentication headers
})
```

### Channels

#### Conversation Channels
Subscribe to `conversation.{conversationId}` to receive:

- `new_message`: New message in conversation
- `message_deleted`: Message was deleted
- `messages_read`: Messages marked as read
- `typing_indicator`: User typing status
- `participant_added`: New participant joined
- `participant_removed`: Participant left

#### User Presence Channels
Subscribe to `user.{userId}` to receive:

- `user_online`: User came online
- `user_offline`: User went offline

### Event Examples

#### New Message Event
```json
{
  "type": "new_message",
  "data": "{\"id\":\"msg_123\",\"conversationId\":\"conv_123\",\"senderId\":\"user_456\",\"content\":\"Hello!\",\"type\":\"text\",\"isRead\":false,\"createdAt\":\"2023-01-01T12:00:00Z\",\"sender\":{\"id\":\"user_456\",\"firstName\":\"John\",\"lastName\":\"Doe\",\"profileImage\":\"...\"},\"attachments\":[]}"
}
```

#### Messages Read Event
```json
{
  "type": "messages_read",
  "data": "{\"userId\":\"user_456\",\"conversationId\":\"conv_123\"}"
}
```

#### Message Deleted Event
```json
{
  "type": "message_deleted",
  "data": "{\"messageId\":\"msg_123\",\"conversationId\":\"conv_123\"}"
}
```

#### Participant Added Event
```json
{
  "type": "participant_added",
  "data": "{\"conversationId\":\"conv_123\",\"userId\":\"user_789\",\"addedBy\":\"user_456\"}"
}
```

#### Participant Removed Event
```json
{
  "type": "participant_removed",
  "data": "{\"conversationId\":\"conv_123\",\"userId\":\"user_789\",\"removedBy\":\"user_456\"}"
}
```

#### Typing Indicator Event
```json
{
  "type": "typing_indicator",
  "data": "{\"userId\":\"user_456\",\"isTyping\":true,\"timestamp\":\"2023-01-01T12:00:00Z\"}"
}
```

#### User Status Event
```json
{
  "type": "user_online",
  "data": "{\"userId\":\"user_456\",\"timestamp\":\"2023-01-01T12:00:00Z\"}"
}
```

## Usage Examples

### Frontend Integration

```javascript
// Connect to WebSocket
const transmit = new Transmit({
  baseUrl: 'ws://localhost:3333'
})

// Subscribe to conversation
transmit.subscribe('conversation.conv_123')

// Listen for events
transmit.on('conversation.conv_123', (event) => {
  switch (event.type) {
    case 'new_message':
      const message = JSON.parse(event.data)
      displayMessage(message)
      break
    case 'messages_read':
      const readData = JSON.parse(event.data)
      updateReadStatus(readData.userId, readData.conversationId)
      break
    case 'message_deleted':
      const deleteData = JSON.parse(event.data)
      removeMessage(deleteData.messageId)
      break
    case 'participant_added':
      const addData = JSON.parse(event.data)
      addParticipant(addData.userId, addData.addedBy)
      break
    case 'participant_removed':
      const removeData = JSON.parse(event.data)
      removeParticipant(removeData.userId, removeData.removedBy)
      break
    case 'typing_indicator':
      const typingData = JSON.parse(event.data)
      showTypingIndicator(typingData.userId, typingData.isTyping)
      break
  }
})

// Send typing indicator
fetch('/v1/chat/conversations/conv_123/typing', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ isTyping: true })
})

// Send message
fetch('/v1/chat/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    conversationId: 'conv_123',
    content: 'Hello world!',
    type: 'text'
  })
})
```

## Security Considerations

1. **Authentication**: All endpoints require valid authentication
2. **Participant Validation**: Users can only access conversations they participate in
3. **Channel Access**: WebSocket channel subscriptions are validated
4. **Message Ownership**: Users can only delete their own messages
5. **File Uploads**: Validate file types and sizes for attachments

## Performance Notes

1. **Conversation List Optimization**: Returns all conversations with only the last message for quick loading
2. **Message Pagination**: Large message lists are paginated separately for better performance  
3. **Connection Management**: Transmit handles connection pooling and reconnection
4. **Channel Cleanup**: Inactive channels are automatically cleaned up
5. **Database Indexing**: Ensure proper indexing on conversation_id, sender_id, and created_at fields
6. **Event Data Structure**: All real-time events now use consistent JSON stringified data format in the `data` field for better parsing and structure

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common error scenarios:
- User not participant in conversation (403)
- Message not found or unauthorized (404)
- Invalid input data (400)
- Authentication required (401)
