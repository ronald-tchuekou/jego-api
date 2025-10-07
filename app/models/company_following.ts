import { DateTime } from 'luxon'
import { afterCreate, BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Company from '#models/company'
import User from '#models/user'
import logger from '@adonisjs/core/services/logger'

export default class CompanyFollowing extends BaseModel {
  @column({ isPrimary: true })
  declare userId: string

  @column({ isPrimary: true })
  declare companyId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Company)
  declare company: BelongsTo<typeof Company>

  @afterCreate()
  static async handleAfterCreated(following: CompanyFollowing) {
    const company = await Company.find(following.companyId)
    if (!company) {
      logger.info('Company not found', following.companyId)
    } else {
      await company.fill({ followingCount: Math.max(0, company.followingCount + 1) }).save()
    }
  }

  @afterCreate()
  static async handleAfterDeleted(following: CompanyFollowing) {
    const company = await Company.find(following.companyId)
    if (!company) {
      logger.info('Company not found', following.companyId)
    } else {
      await company.fill({ followingCount: Math.max(0, company.followingCount - 1) }).save()
    }
  }
}
