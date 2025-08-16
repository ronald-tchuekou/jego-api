import Category from '#models/category'
import Post from '#models/post'
import User from '#models/user'
import { BaseModel, belongsTo, column, hasMany, hasManyThrough } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasManyThrough } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class Company extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare category_id: string | null

  @column()
  declare name: string

  @column()
  declare email: string

  @column()
  declare phone: string

  @column()
  declare address: string | null

  @column()
  declare city: string | null

  @column()
  declare state: string | null

  @column()
  declare zip_code: string | null

  @column()
  declare country: string | null

  @column()
  declare website: string | null

  @column()
  declare logo: string | null

  @column()
  declare description: string | null

  @column()
  declare verified_at: DateTime | null

  @column()
  declare blocked_at: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasManyThrough([() => Post, () => User])
  declare posts: HasManyThrough<typeof Post>

  @hasMany(() => User)
  declare users: HasMany<typeof User>

  @belongsTo(() => Category)
  declare category: BelongsTo<typeof Category>
}
