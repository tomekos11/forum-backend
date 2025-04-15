import Cache from '@adonisjs/cache/services/main'
import Post from '#models/post'
import Reaction from '#models/reaction'

export default class UserService {
  private static getCacheKey(userId: number): string {
    return `user:stats:${userId}`
  }

  public static async getUserStats(userId: number) {
    const cacheKey = this.getCacheKey(userId)

    const cached = await Cache.get({ key: cacheKey })
    if (cached) {
      return cached
    }

    try {
      const postsCountResult = await Post.query()
        .where('userId', userId)
        .andWhere('isDeleted', false)
        .count('* as total')

      const reactionResults = await Reaction.query()
        .join('posts', 'posts.id', '=', 'reactions.post_id')
        .where('posts.user_id', userId)
        .groupBy('reactions.reaction_type')
        .select('reactions.reaction_type')
        .count('* as total')

      const postsCount = Number(postsCountResult[0]?.$extras?.total || 0)
      const plusReps = Number(reactionResults[0]?.$extras?.total || 0)
      const minusReps = Number(reactionResults[1]?.$extras?.total || 0)

      const stats = {
        posts: postsCount,
        repPlus: plusReps,
        repMinus: minusReps,
      }

      await Cache.set({ key: cacheKey, value: stats })

      return stats
    } catch (error) {
      console.error('Błąd podczas zapytań lub przetwarzania danych:', error)
      throw error
    }
  }

  public static async updatePostStatsCache(userId: number) {
    setImmediate(async () => {
      try {
        const cacheKey = this.getCacheKey(userId)
        const cachedStats = await Cache.get({ key: cacheKey })

        if (cachedStats) {
          const postsCountResult = await Post.query()
            .where('userId', userId)
            .andWhere('isDeleted', false)
            .count('* as total')

          const postsCount = Number(postsCountResult[0]?.$extras?.total || 0)
          cachedStats.posts = postsCount

          await Cache.set({ key: cacheKey, value: cachedStats })
        } else {
          await this.getUserStats(userId)
        }
      } catch (error) {
        console.error('Błąd podczas aktualizacji statystyk postów:', error)
      }
    })
  }

  public static async updateReactionStatsCache(userId: number) {
    setImmediate(async () => {
      try {
        const cacheKey = this.getCacheKey(userId)
        const cachedStats = await Cache.get({ key: cacheKey })

        if (cachedStats) {
          const reactionResults = await Reaction.query()
            .join('posts', 'posts.id', '=', 'reactions.post_id')
            .where('posts.user_id', userId)
            .groupBy('reactions.reaction_type')
            .select('reactions.reaction_type')
            .count('* as total')

          const plusReps = Number(reactionResults[0]?.$extras?.total || 0)
          const minusReps = Number(reactionResults[1]?.$extras?.total || 0)

          cachedStats.repPlus = plusReps
          cachedStats.repMinus = minusReps

          await Cache.set({ key: cacheKey, value: cachedStats })
        } else {
          await this.getUserStats(userId)
        }
      } catch (error) {
        console.error('Błąd podczas aktualizacji statystyk reakcji:', error)
      }
    })
  }

  public static async clearUserStatsCache(userId: number) {
    const cacheKey = this.getCacheKey(userId)
    await Cache.delete({ key: cacheKey })
  }
}
