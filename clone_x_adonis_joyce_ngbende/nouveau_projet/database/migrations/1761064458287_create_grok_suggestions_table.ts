import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'grok_suggestions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      // ses Relations
      table.integer('tweet_id').unsigned().references('tweets.id').onDelete('CASCADE')
      table.integer('user_id').unsigned().references('users.id').onDelete('SET NULL')

      // les Données Grok
      table.text('generated_content') // contenu généré par Grok
      table.text('suggested_hashtags') // hashtags suggérés (JSON ou CSV)
      table.json('statistics').nullable() // statistiques / recommandations supplémentaires

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
