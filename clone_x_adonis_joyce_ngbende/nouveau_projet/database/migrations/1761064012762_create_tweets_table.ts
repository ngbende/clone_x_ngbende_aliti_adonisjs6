import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tweets'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.text('content').notNullable()
      // Clé étrangère vers users
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .index() // index ici, car on cherche souvent les tweets d'un utilisateur // si l'utilisateur est supprimé, ses tweets aussi
      // colonne pour gérer les réponses
      table
        .integer('parent_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('tweets')
        .onDelete('CASCADE') //  index utile pour retrouver les réponses à un tweet // si le tweet parent est supprimé, la réponse aussi
        .index()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
