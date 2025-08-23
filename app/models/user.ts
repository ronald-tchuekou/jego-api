import Company from '#models/company'
import Job from '#models/job'
import Post from '#models/post'
import UserToken from '#models/user_token'
import { AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { compose } from '@adonisjs/core/helpers'
import hash from '@adonisjs/core/services/hash'
import { BaseModel, belongsTo, column, computed, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  COMPANY_ADMIN = 'company:admin',
  COMPANY_AGENT = 'company:agent',
}

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare firstName: string

  @column()
  declare lastName: string

  @computed()
  get displayName() {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim() || null
  }

  @column()
  declare phone: string | null

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
  declare email: string

  @column()
  declare updateEmailRequest: string | null

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare role: UserRole

  @column()
  declare companyId: string | null

  @column()
  declare profileImage: string | null

  @column()
  declare verifiedAt: DateTime | null

  @column()
  declare lastLoginAt: DateTime | null

  @column()
  declare blockedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Company)
  declare company: BelongsTo<typeof Company>

  static accessTokens = DbAccessTokensProvider.forModel(User)

  @hasMany(() => UserToken)
  declare tokens: HasMany<typeof UserToken>

  @hasMany(() => Post)
  declare posts: HasMany<typeof Post>

  @hasMany(() => Job)
  declare jobs: HasMany<typeof Job>

  currentAccessToken?: AccessToken
}
