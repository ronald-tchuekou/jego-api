import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from '#models/user'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import PostComment from '#models/post_comment'

export default class PostCommentResponse extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare postCommentId: string

  @column()
  declare userId: string

  @column()
  declare comment: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => PostComment)
  declare postComment: BelongsTo<typeof PostComment>
}
