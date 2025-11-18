import { defineConfig } from '@adonisjs/cors'
import { loadEnv } from './secrets.js'

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */

const { CORS_ALLOWED_ORIGINS: allowedOriginsString } = await loadEnv()

const corsConfig = defineConfig({
  enabled: true,
  origin: allowedOriginsString?.split(','),
  methods: ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE'],
  headers: true,
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
})

export default corsConfig
