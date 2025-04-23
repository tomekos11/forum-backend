import vine from '@vinejs/vine'

export const banUserValidator = vine.compile(
  vine.object({
    userId: vine.number().positive().exists({ table: 'users', column: 'id' }),
    reason: vine.string().trim().minLength(3),
    duration: vine
      .string()
      .trim()
      .regex(/^(forever|\d+d|\d+m|\d+y)$/),
    customDays: vine.number().positive().optional(),
  })
)

export const unbanValidator = vine.compile(
  vine.object({
    unbanReason: vine.string().trim().minLength(3).optional(),
  })
)
