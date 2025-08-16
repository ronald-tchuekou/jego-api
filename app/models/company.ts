import Category from '#models/category'
import CompanyImage from '#models/company_image'
import Post from '#models/post'
import User from '#models/user'
import { BaseModel, belongsTo, column, hasMany, hasManyThrough } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasManyThrough } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class Company extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare categoryId: string | null

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
  declare zipCode: string | null

  @column()
  declare country: string | null

  @column()
  declare website: string | null

  @column()
  declare facebook: string | null

  @column()
  declare instagram: string | null

  @column()
  declare twitter: string | null

  @column()
  declare linkedin: string | null

  @column()
  declare youtube: string | null

  @column()
  declare tiktok: string | null

  @column()
  declare logo: string | null

  @column()
  declare bannerImage: string | null

  @column()
  declare description: string | null

  @column()
  declare verifiedAt: DateTime | null

  @column()
  declare blockedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasManyThrough([() => Post, () => User])
  declare posts: HasManyThrough<typeof Post>

  @hasMany(() => User)
  declare users: HasMany<typeof User>

  @hasMany(() => CompanyImage)
  declare images: HasMany<typeof CompanyImage>

  @belongsTo(() => Category)
  declare category: BelongsTo<typeof Category>
}
