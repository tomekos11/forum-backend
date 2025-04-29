import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'post_replies'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table
        .integer('post_id')
        .unsigned()
        .references('id')
        .inTable('posts')
        .onDelete('CASCADE')
        .notNullable()

      table
        .integer('reply_id')
        .unsigned()
        .references('id')
        .inTable('posts')
        .onDelete('CASCADE')
        .notNullable()

      table.unique(['post_id', 'reply_id'])

      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
