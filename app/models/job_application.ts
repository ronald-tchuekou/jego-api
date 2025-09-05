import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Job from './job.js'
import User from './user.js'

export enum JobApplicationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export default class JobApplication extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare jobId: string

  @column()
  declare userId: string

  @column()
  declare status: JobApplicationStatus

  @column()
  declare resumePath: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Job)
  declare job: BelongsTo<typeof Job>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
