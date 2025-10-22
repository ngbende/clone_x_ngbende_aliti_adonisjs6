import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tweet_hashtags'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('tweet_id')
        .unsigned()
        .references('id')
        .inTable('tweets')
        .onDelete('CASCADE')
        .index() //  retrouver hashtags d’un tweet

      table
        .integer('hashtag_id')
        .unsigned()
        .references('id')
        .inTable('hashtags')
        .onDelete('CASCADE')
        .index() //  retrouver tous les tweets d’un hashtag

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
