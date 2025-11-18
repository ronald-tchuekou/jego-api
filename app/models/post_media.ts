import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Post from './post.js'

export default class PostMedia extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare postId: string

  @column()
  declare name: string

  @column()
  declare type: string

  @column()
  declare url: string

  @column()
  declare size: number

  @column()
  declare thumbnailUrl: string

  @column()
  declare alt: string

  @column()
  declare metadata: Record<string, any> // { width: number, height: number, duration: number, size: number, aspectRatio: number }

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Post)
  declare post: BelongsTo<typeof Post>
}
