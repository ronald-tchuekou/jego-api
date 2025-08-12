import UserLoggedIn from '#events/user_logged_in'
import UserPasswordChanged from '#events/user_password_changed'
import UserPasswordReset from '#events/user_password_reset'
import UserPasswordResetRequested from '#events/user_password_reset_requested'
import UserRegistered from '#events/user_registered'
import UserUpdateEmailRequested from '#events/user_update_email_requested'
import emitter from '@adonisjs/core/services/emitter'

emitter.listen(UserPasswordChanged, [() => import('#listeners/send_user_password_changed_email')])
emitter.listen(UserRegistered, [() => import('#listeners/send_verification_email')])
emitter.listen(UserLoggedIn, [() => import('#listeners/update_user_last_login')])
emitter.listen(UserPasswordResetRequested, [() => import('#listeners/send_password_reset_email')])
emitter.listen(UserPasswordReset, [() => import('#listeners/send_password_reset_success_email')])
emitter.listen(UserUpdateEmailRequested, [
  () => import('#listeners/send_verification_for_new_email'),
])
