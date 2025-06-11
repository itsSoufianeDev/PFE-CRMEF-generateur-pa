import vine from '@vinejs/vine'

export const registerUserValidator = vine.compile(
  vine.object({
    fullName: vine.string().minLength(3),
    email: vine.string().trim().email().unique(async (db, value) => {
      const exists = await db.from('users').where('email', value).first()
      return !exists
    }),
    password: vine.string().minLength(6),
  })
)