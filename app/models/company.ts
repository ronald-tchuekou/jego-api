import Category from '#models/category'
import CompanyImage from '#models/company_image'
import Job from '#models/job'
import Post from '#models/post'
import User from '#models/user'
import { BaseModel, belongsTo, column, hasMany, hasManyThrough } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasManyThrough } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import CompanyAppointmentRequest from './company_appointment_request.js'
import CompanyDoc from './company_doc.js'
import CompanyReview from './company_review.js'
import CompanyService from './company_service.js'

type DayForProgram = 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi' | 'Dimanche'

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

  @column()
  declare location: { lat?: number; lng?: number } | null

  @column()
  declare daily_program: Record<DayForProgram, { open?: string; close?: string }> | null

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

  @hasMany(() => CompanyDoc)
  declare docs: HasMany<typeof CompanyDoc>

  @hasMany(() => CompanyService)
  declare services: HasMany<typeof CompanyService>

  @hasMany(() => CompanyReview)
  declare reviews: HasMany<typeof CompanyReview>

  @hasMany(() => CompanyAppointmentRequest)
  declare appointmentRequests: HasMany<typeof CompanyAppointmentRequest>

  @hasManyThrough([() => Job, () => User])
  declare jobs: HasManyThrough<typeof Job>
}
