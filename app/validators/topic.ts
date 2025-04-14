import vine from '@vinejs/vine'

export const createTopicValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(1).maxLength(100),
    isPrimary: vine.boolean().nullable().optional(),
    postContent: vine.string().minLength(1).maxLength(100),
  })
)
export const indexTopicValidator = vine.compile(
  vine.object({
    page: vine.number().positive().optional(),
    perPage: vine.number().positive().optional(),
    sortBy: vine.enum(['created_at', 'posts_count', 'name', 'is_closed'] as const).optional(),
    order: vine.enum(['asc', 'desc'] as const).optional(),
    title: vine.string().optional(),
  })
)
