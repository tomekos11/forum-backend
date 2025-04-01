import vine from '@vinejs/vine'

export const createUserValidator = vine.compile(
  vine.object({
    username: vine.string().minLength(3).maxLength(30),
    password: vine
      .string()
      .minLength(8)
      .maxLength(30)
      .regex(/[A-Z]/)
      .regex(/\d/)
      .regex(/[!@#$%^&*(),.?":{}|<>]/),
  })
)
