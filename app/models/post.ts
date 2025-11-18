import User from '#models/user'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import PostMedia from './post_media.js'

export default class Post extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare title: string

  @column()
  declare description: string

  @column()
  declare status: string

  @column()
  declare type: string

  @column()
  declare category: string

  @column()
  declare mediaType: 'image' | 'video' | null

  @column()
  declare likeCount: number

  @column()
  declare commentCount: number

  @column()
  declare shareCount: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => PostMedia)
  declare medias: HasMany<typeof PostMedia>
}
