import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'likes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.integer('user_id').unsigned().notNullable() // clé étrangère vers users
      table.integer('tweet_id').unsigned().notNullable() // clé étrangère vers tweets
      // relations avec cascade pour la suppression
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE') // supprime les likes si l'utilisateur est supprimé

      table.foreign('tweet_id').references('id').inTable('tweets').onDelete('CASCADE') // supprime les likes si le tweet est supprimé

      table.unique(['user_id', 'tweet_id']) // un utilisateur ne peut liker un tweet qu'une seule fois
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
