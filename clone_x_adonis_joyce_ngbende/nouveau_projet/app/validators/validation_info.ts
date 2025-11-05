import vine from '@vinejs/vine'

export const createAcountValidator = vine.compile(
  vine.object({
    nom: vine.string().trim().minLength(3),
    prenom: vine.string().trim().minLength(3).nullable(),
    email: vine.string().email(),
    telephone: vine.string().trim().minLength(10).optional(),
    password: vine.string().minLength(8).confirmed({ confirmationField: 'confirmPassword' }),
    confirmPassword: vine.string(),

 
  })
)
