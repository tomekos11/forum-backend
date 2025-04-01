import Forum from '#models/forum'

export const forums = async () => {
  const topicsPosts = []

  const res = await Forum.query().preload('topics', (topics) => {
    topics.preload('posts', async (posts) => {
      const latestPost = await posts.orderBy('created_at', 'desc').first()

      topicsPosts.push(latestPost)
    })
  })

  return {
    res,
    latestTopic: topicsPosts.sort((a, b) => a.createdAt - b.createdAt),
  }
}
