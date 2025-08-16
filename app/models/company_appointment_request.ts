import Company from '#models/company'
import User from '#models/user'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class CompanyAppointmentRequest extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare companyId: string

  @column()
  declare userId: string

  @column()
  declare object: string

  @column()
  declare content: string

  @column()
  declare isRead: boolean

  @column()
  declare date: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Company)
  declare company: BelongsTo<typeof Company>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
