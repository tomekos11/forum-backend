import vine from '@vinejs/vine'

export const editProfileValidator = vine.compile(
  vine.object({
    description: vine.string().maxLength(255).nullable().optional(),
    bio: vine.string().maxLength(255).nullable().optional(),
  })
)
