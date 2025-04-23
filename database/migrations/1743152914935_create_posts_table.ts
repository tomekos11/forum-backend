import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'posts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      table.integer('user_id').unsigned().nullable().references('users.id').onDelete('SET NULL')
      table.integer('topic_id').unsigned().nullable().references('topics.id').onDelete('CASCADE')
      table.text('content').notNullable()

      table.boolean('is_deleted').defaultTo(false)

      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
