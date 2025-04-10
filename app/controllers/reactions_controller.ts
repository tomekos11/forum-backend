import type { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'
import Reaction from '#models/reaction'

export default class ReactionsController {
  public async react({ request, response, auth }: HttpContext) {
    try {
      const { postId, reactionType } = request.only(['postId', 'reactionType'])

      if (!['like', 'dislike', null].includes(reactionType)) {
        return response.status(422).send({ message: 'Nieprawidłowy typ reakcji' })
      }

      const post = await Post.find(postId)
      if (!post) {
        return response.status(404).send({ message: 'Post nie istnieje' })
      }

      const user = await auth.use('jwt').authenticate()

      let reaction = await Reaction.query()
        .where('user_id', user.id)
        .where('post_id', postId)
        .first()

      if (reaction) {
        if (!reactionType) {
          await reaction.delete()
          return response.status(200).send({ message: 'Reakcja została usunięta', reaction: null })
        }

        reaction.reactionType = reactionType
        await reaction.save()
        return response.status(200).send({ message: 'Reakcja została zmieniona', reaction })
      } else {
        if (reactionType) {
          reaction = await Reaction.create({
            userId: user.id,
            postId: postId,
            reactionType: reactionType,
          })
          return response.status(200).send({ message: 'Reakcja została dodana', reaction })
        } else {
          return response.status(200).send({ message: 'Nie można dodać reakcji', reaction: null })
        }
      }
    } catch (error) {
      return response.status(500).send({ message: 'Wystąpił błąd', error: error.message })
    }
  }
}
