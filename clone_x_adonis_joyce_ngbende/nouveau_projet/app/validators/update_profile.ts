import vine from '@vinejs/vine'


export const updateProfileValidator = vine.compile(
  vine.object({
       // Nouveaux champs
    bio: vine.string().trim().maxLength(255).nullable().optional(),
    location: vine.string().trim().maxLength(100).nullable().optional(),
    website: vine.string().url().trim().nullable().optional(),
//     photoProfil: vine.file({ size: '5mb', extnames: ['jpg', 'jpeg', 'png'] }).nullable().optional(),
// coverPicture: vine.file({ size: '5mb', extnames: ['jpg', 'jpeg', 'png'] }).nullable().optional(),

    // isPrivate: vine.boolean().optional(),
  })
)
