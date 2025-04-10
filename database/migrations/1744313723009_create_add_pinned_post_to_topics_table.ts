import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'topics'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('pinned_post_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('posts')
        .onDelete('SET NULL')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
