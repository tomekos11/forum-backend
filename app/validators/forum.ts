import vine from '@vinejs/vine'

export const postsForForumValidator = vine.compile(
  vine.object({
    forumId: vine.number().exists({ table: 'forums', column: 'id' }),
  })
)
