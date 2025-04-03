import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'post_histories'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      table.integer('post_id').unsigned().references('posts.id').onDelete('CASCADE')

      table.integer('user_id').unsigned().nullable().references('users.id').onDelete('SET NULL')

      table.text('content').notNullable()

      table.integer('deleted_by').unsigned().nullable().references('users.id').onDelete('SET NULL')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
