/*
|--------------------------------------------------------------------------
| Define HTTP limiters
|--------------------------------------------------------------------------
|
| The "limiter.define" method creates an HTTP middleware to apply rate
| limits on a route or a group of routes. Feel free to define as many
| throttle middleware as needed.
|
*/

import limiter from '@adonisjs/limiter/services/main'
import env from '#start/env'

const isTest = env.get('NODE_ENV') === 'test'

export const throttle = limiter.define('global', () => {
  return limiter.allowRequests(isTest ? 30 : 10).every('1 minute')
})
