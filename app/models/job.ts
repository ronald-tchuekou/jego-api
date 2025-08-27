import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import JobApplication from './job_application.js'
import User from './user.js'

export enum JobStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

export default class Job extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare title: string

  @column()
  declare description: string

  @column()
  declare companyName: string | null

  @column()
  declare companyLogo: string | null

  @column()
  declare companyWebsite: string | null

  @column()
  declare companyEmail: string | null

  @column()
  declare companyPhone: string | null

  @column()
  declare companyAddress: string | null

  @column()
  declare companyCity: string | null

  @column()
  declare companyState: string | null

  @column()
  declare companyZip: string | null

  @column()
  declare companyCountry: string | null

  @column()
  declare expiresAt: DateTime | null

  @column()
  declare status: JobStatus

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => JobApplication)
  declare applications: HasMany<typeof JobApplication>
}
