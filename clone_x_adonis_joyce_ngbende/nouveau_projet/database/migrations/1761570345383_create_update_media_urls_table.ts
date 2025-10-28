import { BaseSchema } from '@adonisjs/lucid/schema'

export default class UpdateMediaUrls extends BaseSchema {
  protected tableName = 'media'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Supprimer les anciennes colonnes
      table.dropColumn('image_url')
      table.dropColumn('video_url')

      // Ajouter les nouvelles colonnes type/url
      table.enum('type', ['image', 'video']).notNullable()
      table.text('url').nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // Revenir à l’ancien schéma
      table.string('image_url', 255).nullable()
      table.string('video_url', 255).nullable()

      table.dropColumn('type')
      table.dropColumn('url')
    })
  }
}
