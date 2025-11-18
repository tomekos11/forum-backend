import { Env } from '@adonisjs/core/env'

const isProd = process.env.NODE_ENV === 'production'

/*
|--------------------------------------------------------------------------
| DEV SCHEMA – pełna walidacja
|--------------------------------------------------------------------------
*/
const devSchema = {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'] as const),

  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),

  REDIS_HOST: Env.schema.string({ format: 'host' }),
  REDIS_PORT: Env.schema.number(),
  REDIS_PASSWORD: Env.schema.string.optional(),

  CORS_ALLOWED_ORIGINS: Env.schema.string(),

  LIMITER_STORE: Env.schema.enum(['database', 'memory'] as const),
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory'] as const),

  USER_LOGIN: Env.schema.string(),
  USER_PASSWORD: Env.schema.string(),
  BANNED_USER_LOGIN: Env.schema.string(),
  BANNED_USER_PASSWORD: Env.schema.string(),
}

/*
|--------------------------------------------------------------------------
| PROD SCHEMA – ZERO walidacji
|--------------------------------------------------------------------------
*/
const prodSchema = {}

export default await Env.create(new URL('../', import.meta.url), isProd ? prodSchema : devSchema)
