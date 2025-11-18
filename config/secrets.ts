import { getSecret } from './aws.js'
import env from '#start/env'

interface AppEnv {
  CORS_ALLOWED_ORIGINS?: string
  REDIS_HOST?: string
  REDIS_PORT?: number
  LIMITER_STORE?: string
  SESSION_DRIVER: string
  DB_DATABASE: string
  TZ: string | undefined
  PORT: number
  LOG_LEVEL: string
  APP_KEY: string
}

let cachedEnv: AppEnv | null = null

export async function loadEnv() {
  if (cachedEnv) {
    return cachedEnv
  }

  try {
    const secrets = await getSecret<AppEnv | undefined>('forum/env')

    cachedEnv = {
      CORS_ALLOWED_ORIGINS: secrets?.CORS_ALLOWED_ORIGINS ?? env.get('CORS_ALLOWED_ORIGINS'),
      REDIS_HOST: secrets?.REDIS_HOST ?? env.get('REDIS_HOST'),
      REDIS_PORT: secrets?.REDIS_PORT ?? env.get('REDIS_PORT'),
      LIMITER_STORE: secrets?.LIMITER_STORE ?? env.get('LIMITER_STORE'),
      SESSION_DRIVER: secrets?.SESSION_DRIVER ?? env.get('SESSION_DRIVER'),
      DB_DATABASE: secrets?.DB_DATABASE ?? env.get('DB_DATABASE'),
      TZ: secrets?.TZ ?? env.get('TZ'),
      PORT: secrets?.PORT ?? env.get('PORT'),
      LOG_LEVEL: secrets?.LOG_LEVEL ?? env.get('LOG_LEVEL'),
      APP_KEY: secrets?.APP_KEY ?? env.get('APP_KEY'),
    }
  } catch {
    cachedEnv = {
      CORS_ALLOWED_ORIGINS: env.get('CORS_ALLOWED_ORIGINS'),
      REDIS_HOST: env.get('REDIS_HOST'),
      REDIS_PORT: env.get('REDIS_PORT'),
      LIMITER_STORE: env.get('LIMITER_STORE'),
      SESSION_DRIVER: env.get('SESSION_DRIVER'),
      DB_DATABASE: env.get('DB_DATABASE'),
      TZ: env.get('TZ'),
      PORT: env.get('PORT'),
      LOG_LEVEL: env.get('LOG_LEVEL'),
      APP_KEY: env.get('APP_KEY'),
    }
  }

  console.log(cachedEnv)
  return cachedEnv
}
