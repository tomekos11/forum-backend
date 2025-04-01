import vine from '@vinejs/vine'

export const postsForForumValidator = vine.compile(
  vine.object({
    forumId: vine.number().exists({ table: 'forums', column: 'id' }),
  })
)

export const createForumValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(1).maxLength(100),
    description: vine.string().minLength(10).maxLength(500),
  })
)
