import vine from '@vinejs/vine'


export const updateProfileValidator = vine.compile(
  vine.object({
       // Nouveaux champs
    bio: vine.string().trim().maxLength(255).nullable().optional(),
    location: vine.string().trim().maxLength(100).nullable().optional(),
    website: vine.string().url().trim().nullable().optional(),
//     photoProfil: vine.file({ size: '5mb', extnames: ['jpg', 'jpeg', 'png'] }).nullable().optional(),
// coverPicture: vine.file({ size: '5mb', extnames: ['jpg', 'jpeg', 'png'] }).nullable().optional(),
      // Champs mot de passe (optionnels)
    current_password: vine.string().minLength(1).optional(),
    new_password: vine
      .string()
      .minLength(8)
      .maxLength(255)
      .confirmed({ confirmationField: 'new_password_confirmation' })
      .optional(),
    new_password_confirmation: vine.string().optional(),
    // isPrivate: vine.boolean().optional(),
  })
)
