import type { HttpContext } from '@adonisjs/core/http'
import { editProfileValidator } from '#validators/profile'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'
import { unlinkSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import User from '#models/user'
import Topic from '#models/topic'
import db from '@adonisjs/lucid/services/db'

export default class ProfilesController {
  public async show({ request, response }: HttpContext) {
    try {
      const user = await User.query()
        .where('username', request.param('username'))
        .preload('data')
        .preload('followedTopics', (followedTopicsQuery) =>
          followedTopicsQuery
            .preload('forum')
            .withCount('posts', (query) => {
              query.as('postCounter')
            })
            .preload('posts', (postQuery) => postQuery.groupOrderBy('id', 'asc').groupLimit(1))
        )
        .firstOrFail()

      const topics = await Topic.query()
        .where('user_id', user.id)
        .withCount('posts', (query) => {
          query.as('postCounter')
        })
        .preload('forum')
        .limit(3)
        .orderBy('postCounter', 'desc')
        .preload('posts', (query) => {
          query.groupLimit(1)
        })

      const totalReplies = await db
        .from('posts')
        .join('post_replies', 'posts.id', 'post_replies.post_id')
        .join('posts as reply_posts', 'reply_posts.id', 'post_replies.reply_id')
        .where('posts.user_id', user.id)
        .whereNot('reply_posts.user_id', user.id)
        .count('* as total')
        .first()

      const mostRepliedPosts = await db
        .from('posts')
        .join('post_replies', 'posts.id', 'post_replies.post_id')
        .join('posts as reply_posts', 'reply_posts.id', 'post_replies.reply_id')
        .where('posts.user_id', user.id)
        .whereNot('reply_posts.user_id', user.id)
        .select('posts.id', 'posts.content')
        .count('post_replies.id as reply_count')
        .groupBy('posts.id', 'posts.content')
        .orderBy('reply_count', 'desc')
        .limit(3)

      return response.ok({
        user,
        userTopics: topics,
        replies: {
          totalReplies: totalReplies?.total || 0,
          mostRepliedPosts: mostRepliedPosts,
        },
      })
    } catch (error) {
      console.log(error)
      return response.status(422).send(error.messages)
    }
  }

  public async showTopics({ request, response }: HttpContext) {
    try {
      const user = await User.query().where('username', request.param('username')).firstOrFail()

      const topics = await Topic.query()
        .where('user_id', user.id)
        .withCount('posts', (query) => {
          query.as('postCounter')
        })
        .preload('forum')
        .orderBy('postCounter', 'desc')
        .preload('posts', (query) => {
          query.groupLimit(1)
        })

      return response.ok({ user, userTopics: topics })
    } catch (error) {
      return response.status(422).send(error.messages)
    }
  }

  public async edit({ request, auth, response }: HttpContext) {
    try {
      const currentUser = await auth.use('jwt').authenticate()

      const { description, bio, username } = await editProfileValidator.validate(request.all())

      let targetUser = currentUser

      if (username && currentUser.isAtLeastModerator) {
        const foundUser = await User.findBy('username', username)

        if (!foundUser) {
          return response.status(404).send({ message: 'Użytkownik nie został znaleziony.' })
        }

        targetUser = foundUser
      }

      await targetUser.load('data')

      if (description !== undefined) {
        targetUser.data.description = description
      }

      if (bio !== undefined) {
        targetUser.data.bio = bio
      }

      await targetUser.data.save()

      return response.created({ message: 'Profil został zaktualizowany!', user: targetUser })
    } catch (error) {
      return response.status(422).send(error.messages)
    }
  }

  public async addPhoto({ request, auth, response }: HttpContext) {
    try {
      const currentUser = await auth.use('jwt').authenticate()
      const username = request.input('username')

      let targetUser = currentUser

      if (username && currentUser.isAtLeastModerator) {
        const foundUser = await User.findBy('username', username)
        if (!foundUser) {
          return response.status(404).send({ message: 'Użytkownik nie został znaleziony.' })
        }
        targetUser = foundUser
      }

      await targetUser.load('data')

      const avatar = request.file('avatar', {
        size: '2mb',
        extnames: ['jpg', 'png', 'jpeg', 'webp'],
      })

      if (avatar) {
        const port = request.request.socket.localPort

        if (
          targetUser.data.image &&
          targetUser.data.image.startsWith(
            `${request.protocol()}://${request.hostname()}:${port}/uploads/avatars/`
          )
        ) {
          const oldImagePath = join(
            app.publicPath('uploads/avatars'),
            targetUser.data.image.split('/uploads/avatars/')[1]
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

        const fullUrl = `${request.protocol()}://${request.hostname()}:${port}/uploads/avatars/${fileName}`

        targetUser.data.image = fullUrl
      }

      await targetUser.data.save()

      return {
        message: 'Profil zaktualizowany',
        data: targetUser.data,
      }
    } catch (error) {
      return response.status(422).send(error.message)
    }
  }

  public async find({ request, auth, response }: HttpContext) {
    const { name } = request.only(['name'])

    if (!name || name.trim() === '') {
      return response.badRequest({ message: 'Brak nazwy do wyszukania' })
    }

    const users = await User.query()
      .where('username', 'like', `${name}%`)
      .limit(10)
      .preload('data')
      .select(['id', 'username'])

    return response.ok(users)
  }
}
