import vine from '@vinejs/vine'

export const markAsReadValidator = vine.compile(
  vine.object({
    topicSlug: vine.string().exists({ table: 'topics', column: 'slug' }),
  })
)
