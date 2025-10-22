import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'retweets'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      // Clé étrangère vers users
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .index() //  retrouver les retweets d'un utilisateur // supprime les retweets si l'utilisateur est supprimé
      table
        .integer('tweet_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('tweets')
        .onDelete('CASCADE')
        .index() //  retrouver les retweets d’un tweet // supprime les retweets si le tweet est supprimé
      table.unique(['user_id', 'tweet_id']) // un utilisateur ne peut retweeter un tweet qu'une seule fois
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
