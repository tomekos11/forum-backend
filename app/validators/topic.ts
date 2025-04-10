import vine from '@vinejs/vine'

export const createTopicValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(1).maxLength(100),
    isPrimary: vine.boolean().nullable().optional(),
    postContent: vine.string().minLength(1).maxLength(100),
  })
)
