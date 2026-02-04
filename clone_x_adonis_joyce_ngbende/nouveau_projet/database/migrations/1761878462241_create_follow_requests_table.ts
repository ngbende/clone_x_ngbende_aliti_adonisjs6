import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'follow_requests'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      // Colonnes pour la relation follow
      table.integer('demandeur_id').unsigned().notNullable()
      table.integer('cible_id').unsigned().notNullable()

      // Statut de la demande
      table.enu('statut', ['en_attente', 'acceptee', 'refusee']).defaultTo('en_attente')

      // Timestamps
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())

      // Clés étrangères
      table.foreign('demandeur_id').references('id').inTable('users').onDelete('CASCADE')
      table.foreign('cible_id').references('id').inTable('users').onDelete('CASCADE')

      // Unique pour éviter les doublons
      table.unique(['demandeur_id', 'cible_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
