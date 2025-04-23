import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'reports'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('reporter_id').unsigned().references('id').inTable('users').onDelete('CASCADE')

      table.string('reportable_type')
      table.integer('reportable_id')
      table.text('reason') // do wyboru z listy -> osobne dla postów, tematów, forów
      table.enum('status', ['pending', 'in_progress', 'resolved']).defaultTo('pending')

      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
