import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable().primary()
      table.string('nom').notNullable()
      table.string('prenom').nullable()
      table.string('email', 254).notNullable().unique()
      table.string('telephone').nullable()
      table.string('password').notNullable()
      table.string('bio').nullable()
      table.string('location').nullable()
      table.string('website').nullable()
      table.boolean('isPrivate').notNullable().defaultTo(false)
      table.boolean('verified').notNullable().defaultTo(false)
      table.string('verificationToken').nullable()
      table.string('photoProfil').nullable()
      table.string('coverPicture').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
