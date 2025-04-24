import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'post_histories'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      table.integer('post_id').unsigned().references('posts.id').onDelete('CASCADE')

      table.integer('editor_id').unsigned().nullable().references('users.id').onDelete('SET NULL')

      table.text('content').notNullable()

      table.integer('is_deleted').defaultTo(0)

      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
