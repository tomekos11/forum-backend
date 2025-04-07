import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Post from '#models/post'
export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
      const admin = await User.find(1)
      const user1 = await User.find(2)


  }
}
