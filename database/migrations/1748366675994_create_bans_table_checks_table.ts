import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'bans'

  async up() {
    await this.schema.raw(`
      ALTER TABLE ${this.tableName}
        DROP CONSTRAINT IF EXISTS bans_reason_length,
        DROP CONSTRAINT IF EXISTS bans_banned_until_future,
        DROP CONSTRAINT IF EXISTS bans_no_self_ban
    `)

    await this.schema.raw(`
      ALTER TABLE ${this.tableName}
        ADD CONSTRAINT bans_reason_length CHECK (char_length(reason) >= 3),
        ADD CONSTRAINT bans_banned_until_future CHECK (banned_until IS NULL OR banned_until > created_at),
        ADD CONSTRAINT bans_no_self_ban CHECK (user_id <> banned_by)
    `)
  }

  async down() {
    await this.schema.raw(`
      ALTER TABLE ${this.tableName}
        DROP CONSTRAINT IF EXISTS bans_reason_length,
        DROP CONSTRAINT IF EXISTS bans_banned_until_future,
        DROP CONSTRAINT IF EXISTS bans_no_self_ban
    `)
  }
}
