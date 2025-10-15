import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Message from './message.js'
import Participant from './participant.js'

export default class Conversation extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Participant)
  declare participants: HasMany<typeof Participant>

  @hasMany(() => Message)
  declare messages: HasMany<typeof Message>
}
