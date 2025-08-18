import Company from '#models/company'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export enum CompanyDocStatus {
  WAITING = 'waiting',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export default class CompanyDoc extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare companyId: string

  @column()
  declare name: string

  @column()
  declare path: string | null

  @column()
  declare type: string | null

  @column()
  declare size: string | null

  @column()
  declare status: CompanyDocStatus

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Company)
  declare company: BelongsTo<typeof Company>
}
