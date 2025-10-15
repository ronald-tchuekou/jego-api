import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Message from './message.js'

export default class MessageAttachment extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare messageId: string

  @column()
  declare name: string

  @column()
  declare url: string

  @column()
  declare type: string

  @column()
  declare size: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Message)
  declare message: BelongsTo<typeof Message>
}
