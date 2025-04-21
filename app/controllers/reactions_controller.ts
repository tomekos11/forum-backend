import type { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'
import Reaction from '#models/reaction'
import ReactionService from '#services/reaction_service'
import UserService from '#services/user_service'

export default class ReactionsController {
  public async react({ request, response, auth }: HttpContext) {
    try {
      const { postId, reactionType } = request.only(['postId', 'reactionType'])

      const validReactions = ['like', 'dislike', null]
      if (!validReactions.includes(reactionType)) {
        return response.status(422).send({ message: 'Nieprawidłowy typ reakcji' })
      }

      const post = await Post.find(postId)
      if (!post) {
        return response.status(404).send({ message: 'Post nie istnieje' })
      }

      const user = await auth.use('jwt').authenticate()

      if (post.userId === user.id) {
        return response.status(402).send({ message: 'Nie można dodawać reakcji na swoje posty' })
      }

      const existingReaction = await Reaction.query()
        .where('user_id', user.id)
        .where('post_id', postId)
        .first()

      // Usuń reakcję
      if (existingReaction && !reactionType) {
        await existingReaction.delete()
      }

      // Zmień istniejącą reakcję
      if (existingReaction && reactionType) {
        existingReaction.reactionType = reactionType
        await existingReaction.save()
      }

      // Dodaj nową reakcję
      if (!existingReaction && reactionType) {
        await Reaction.create({
          userId: user.id,
          postId,
          reactionType,
        })
      }

      // Załaduj zaktualizowany post z reakcjami i userem
      await post.load('reaction')
      await post.load('user')
      await post.user.load('data')
      const postWithSummary = ReactionService.summarizeReactions([post.serialize()], user)[0]

      UserService.updateReactionStatsCache(post.user.id) // Aktualizacja countera

      return response.status(200).send({
        message: 'Reakcja została zaktualizowana',
        post: postWithSummary,
      })
    } catch (error) {
      return response.status(500).send({ message: 'Wystąpił błąd', error: error.message })
    }
  }
}
