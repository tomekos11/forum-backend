import type { HttpContext } from '@adonisjs/core/http'
import { editProfileValidator } from '#validators/profile'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'
import { unlinkSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import User from '#models/user'

export default class ProfilesController {
  public async show({ request, response }: HttpContext) {
    try {
      console.log(request.param('username'))
      const user = await User.query()
        .where('username', request.param('username'))
        .preload('data')
        .firstOrFail()

      return user
    } catch (error) {
      return response.status(422).send(error.messages)
    }
  }

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

  public async addPhoto({ request, auth, response }: HttpContext) {
    try {
      const user = await auth.use('jwt').authenticate()
      await user.load('data')

      const avatar = request.file('avatar', {
        size: '2mb',
        extnames: ['jpg', 'png', 'jpeg', 'webp'],
      })

      if (avatar) {
        if (user.data.image) {
          const oldImagePath = join(
            app.publicPath('uploads/avatars'),
            user.data.image.split('/uploads/avatars/')[1]
          )
          if (existsSync(oldImagePath)) {
            unlinkSync(oldImagePath)
          }
        }

        const fileName = `${cuid()}.${avatar.extname}`
        await avatar.move(app.publicPath('uploads/avatars'), {
          name: fileName,
          overwrite: true,
        })

        user.data.image = `/uploads/avatars/${fileName}`
      }

      await user.data.save()

      return {
        message: 'Profil zaktualizowany',
        data: user.data,
      }
    } catch (error) {
      return response.status(422).send(error.message)
    }
  }
}
