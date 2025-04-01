import Forum from '#models/forum'

export const topicsList = async (forumId: boolean) => {
  try {
    const forum = await Forum.query().where('id', forumId).first()

    if (!forum) {
      return []
    }

    const topics = await forum.related('topics').query()
    for (const topic of topics) {
      const latestPost = await topic.related('posts').query().orderBy('created_at', 'desc').first()
      topic.$extras.latestPost = latestPost

      const postCount = await topic.related('posts').query().count('* as count')
      topic.$extras.postCounter = postCount[0]?.$extras?.count || 0
    }

    const PrimaryTopics = topics.filter((topic) => (topic.is_primary as any) === 1)
    const nonPrimaryTopics = topics.filter((topic) => (topic.is_primary as any) === 0)

    return { PrimaryTopics, nonPrimaryTopics }
  } catch (error) {
    console.error('Błąd podczas pobierania forów:', error)
    return []
  }
}
