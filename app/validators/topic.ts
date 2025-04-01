import vine from '@vinejs/vine'

export const createTopicValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(1).maxLength(100),
    is_primary: vine.boolean().nullable().optional(),
  })
)
