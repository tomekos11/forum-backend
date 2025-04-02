import Forum from '#models/forum'
import Post from '#models/post'

export const forumsList = async () => {
  try {

      // forums.forEach(forum => {
      //   let latestPost: Post | null = null;

      //   forum.topics.forEach(topic => {
      //     if (topic.posts && topic.posts.length > 0) {
      //       const post = topic.posts[0]

      //       if(!latestPost || latestPost.createdAt.toMillis < post.createdAt.toMillis) {
      //         latestPost = post;
      //         console.log(post.title)
      //       }
      //     }
      //   })
      //   forum.$extras.latestPost = latestPost;
      // })

      // const finalResult = forums.map((forum) => {
      //   const serializedForum = forum.serialize()
      //   delete serializedForum.topics
      //   return serializedForum
      // })

      // return finalResult


      const forums = await Forum.query().preload('topics', (topicsQuery) => {
        topicsQuery.preload('posts', (postsQuery) => {
            postsQuery.preload('user').orderBy('created_at', 'desc')
        })
    })

    for (const forum of forums) {
        forum.$extras.postCounter = 0
        for (const topic of forum.topics) {
            forum.$extras.postCounter += topic.posts.length
            const latestPost = topic.posts[0];

            if (latestPost) {
                if (!forum.$extras.latestPost || forum.$extras.latestPost.createdAt < latestPost.createdAt) {
                    forum.$extras.latestPost = latestPost
                }
            }
        }
    }

    const finalResult = forums.map((forum) => {
      const serializedForum = forum.serialize()
      delete serializedForum.topics
      return serializedForum
    })

      return finalResult

  } catch (error) {
    console.error('Błąd podczas pobierania forów:', error)
    return []
  }
}
