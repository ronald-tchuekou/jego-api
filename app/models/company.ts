import Post from '#models/post'
import User from '#models/user'
import { BaseModel, column, hasManyThrough } from '@adonisjs/lucid/orm'
import type { HasManyThrough } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class Company extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare email: string

  @column()
  declare phone: string

  @column()
  declare address: string

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
}
