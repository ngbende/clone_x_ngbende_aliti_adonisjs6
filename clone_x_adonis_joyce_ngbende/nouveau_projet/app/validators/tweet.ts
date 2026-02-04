import vine from '@vinejs/vine'

export const createTweetValidator = vine.compile(
  vine.object({
    inputTweet: vine.string().trim().minLength(1).maxLength(280).optional(),
  })
)
