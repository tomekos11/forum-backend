import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

const roleHierarchy = {
  marketing: 0,
  user: 1,
  moderator: 2,
  admin: 3,
}

type Role = keyof typeof roleHierarchy

export default class RoleMiddleware {
  async handle({ auth, response }: HttpContext, next: NextFn, roles: Role) {
    const user = await auth.use('jwt').authenticate()
    const userRole = user?.role

    if (!userRole || !roleHierarchy[userRole]) {
      return response.unauthorized({ error: 'Brak uprawnień' })
    }

    if (roleHierarchy[userRole] < roleHierarchy[roles]) {
      return response.forbidden({ error: 'Brak odpowiednich uprawnień' })
    }

    const output = await next()
    return output
  }
}
