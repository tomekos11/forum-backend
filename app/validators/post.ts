import vine from '@vinejs/vine'

export const indexPostValidator = vine.compile(
  vine.object({
    page: vine.number().positive().optional(),
    perPage: vine.number().positive().optional(),
    sortBy: vine.enum(['created_at', 'reaction_count'] as const).optional(),
    order: vine.enum(['asc', 'desc'] as const).optional(),
  })
)
export const storePostValidator = vine.compile(
  vine.object({
    content: vine.string().trim(),
    topicId: vine.number().exists({ table: 'topics', column: 'id' }),
  })
)

export const editPostValidator = vine.compile(
  vine.object({
    postId: vine.number().exists({ table: 'posts', column: 'id' }),
    content: vine.string().trim(),
  })
)

export const destroyPostValidator = vine.compile(
  vine.object({
    postId: vine.number().exists({ table: 'posts', column: 'id' }),
  })
)
