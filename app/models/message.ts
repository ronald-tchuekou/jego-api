import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Conversation from './conversation.js'
import MessageAttachment from './message_attachment.js'
import User from './user.js'

export enum MessageType {
  TEXT = 'text',
  ATTACHMENT = 'attachment',
  TEXT_ATTACHMENT = 'text_attachment',
}

export default class Message extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare conversationId: string

  @column()
  declare senderId: string

  @column()
  declare content: string

  @column()
  declare isRead: boolean

  @column()
  declare type: MessageType

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Conversation)
  declare conversation: BelongsTo<typeof Conversation>

  @belongsTo(() => User)
  declare sender: BelongsTo<typeof User>

  @hasMany(() => MessageAttachment)
  declare attachments: HasMany<typeof MessageAttachment>
}
