import type Reaction from '#models/reaction'
import User from '#models/user'

type PostWithReactions = {
  reaction?: Reaction[]
  [key: string]: any
}

type ReactionSummary = {
  like: number
  dislike: number
  myReaction: string | null
}

export default class ReactionService {
  public static summarizeReactions(posts: PostWithReactions[], currentUser: User | undefined) {
    return posts.map((post) => {
      const reactions = post.reaction || []

      const summary = reactions.reduce<ReactionSummary>(
        (acc, reaction) => {
          if (reaction.reactionType === 'like') acc.like++
          if (reaction.reactionType === 'dislike') acc.dislike++
          if (currentUser && reaction.userId === currentUser.id) {
            acc.myReaction = reaction.reactionType
          }
          return acc
        },
        { like: 0, dislike: 0, myReaction: null }
      )

      return {
        ...post,
        reaction: {
          like: summary.like,
          dislike: summary.dislike,
        },
        myReaction: summary.myReaction,
      }
    })
  }
}
