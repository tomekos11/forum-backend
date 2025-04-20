import { DateTime } from 'luxon'
import UserActive from '#events/user_active'
import UserData from '#models/user_data'

export default class UpdateUserLastActivity {
  public async handle(event: UserActive) {
    const userData = await UserData.query().where('user_id', event.user.id).first()

    if (userData) {
      userData.lastActivity = DateTime.now()

      await userData.save()
    }
  }
}
