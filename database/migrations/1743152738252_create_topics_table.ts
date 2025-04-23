import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'topics'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      table.string('name')
      table.string('slug').unique()

      table.integer('forum_id').unsigned().nullable().references('forums.id').onDelete('CASCADE')
      table.integer('user_id').unsigned().nullable().references('users.id').onDelete('SET NULL')

      table.boolean('is_primary').defaultTo(false)
      table.boolean('is_closed').defaultTo(false)

      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })

    await this.defer(async (db) => {
      await db.rawQuery(`ALTER TABLE topics ADD FULLTEXT(name)`)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
