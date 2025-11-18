import { Env } from '@adonisjs/core/env';
export default await Env.create(new URL('../', import.meta.url), {
    NODE_ENV: Env.schema.enum(['development', 'production', 'test']),
    PORT: Env.schema.number(),
    APP_KEY: Env.schema.string(),
    HOST: Env.schema.string({ format: 'host' }),
    LOG_LEVEL: Env.schema.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']),
    FRONTEND_URL: Env.schema.string(),
    FRONTEND_URL_VERIFY: Env.schema.string(),
    FRONTEND_URL_RESET_PASSWORD: Env.schema.string(),
    DB_HOST: Env.schema.string({ format: 'host' }),
    DB_PORT: Env.schema.number(),
    DB_USER: Env.schema.string(),
    DB_PASSWORD: Env.schema.string.optional(),
    DB_DATABASE: Env.schema.string(),
    SMTP_HOST: Env.schema.string(),
    SMTP_PORT: Env.schema.string(),
    SMTP_USER: Env.schema.string(),
    SMTP_PASSWORD: Env.schema.string(),
    SMTP_FROM: Env.schema.string(),
    SMTP_FROM_NAME: Env.schema.string(),
});
//# sourceMappingURL=env.js.map