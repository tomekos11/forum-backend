import type { HttpContext } from '@adonisjs/core/http'
import { editProfileValidator } from '#validators/profile'

export default class ProfilesController {
  public async edit({ request, auth, response }: HttpContext) {
    try {
      const user = await auth.use('jwt').authenticate()

      const { description } = await editProfileValidator.validate(request.all())
      await user.load('data')

      user.data.description = description

      await user.data.save()

      return response.created({ message: 'Profil został zaktualizowany!', user })
    } catch (error) {
      return response.status(422).send(error.messages)
    }
  }
}
