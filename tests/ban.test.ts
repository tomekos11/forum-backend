import { test } from '@japa/runner'
import User from '#models/user'
import { ApiClient } from '@japa/api-client'

export async function getAdminTokenCookie(client: ApiClient): Promise<string> {
  const response = await client.post('/login').json({
    username: 'admin',
    password: 'password',
  })

  const setCookieHeader = response.headers()['set-cookie']

  let tokenCookie: string | undefined
  const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader]

  for (const cookie of cookies) {
    if (cookie.startsWith('token=')) {
      tokenCookie = cookie
      break
    }
  }

  if (!tokenCookie) {
    throw new Error('Token cookie not found')
  }

  console.log('Token cookie:', tokenCookie)
  return tokenCookie
}

test.group('Bans', (group) => {
  group.setup(async () => {
    await User.create({ username: 'admin', password: 'password', role: 'admin' })
    await User.create({ username: 'test', password: 'test' })
  })

  test('ban a user successfully', async ({ client }) => {
    const tokenCookie = await getAdminTokenCookie(client)

    const response = await client
      .post('/bans')
      .header('Cookie', tokenCookie) // użycie tokenu z ciasteczka
      .json({
        userId: 2,
        duration: '7d',
        reason: 'Test ban',
      })

    console.log(response.body())
    //response.assertStatus(200)

    // response.assertStatus(200)
    // response.assertBodyContains({
    //   ban: {
    //     userId: userToBan.id,
    //     reason: 'Test ban',
    //   },
    // })
    // // Sprawdź, czy ban jest w bazie
    // const ban = await Ban.query().where('user_id', userToBan.id).first()
    // assert.isNotNull(ban)
    // assert.isTrue(ban?.bannedUntil > DateTime.now())
  })

  // test('cannot ban user who is already banned', async ({ client }) => {
  //   // Dodaj aktywnego bana ręcznie
  //   await Ban.create({
  //     userId: userToBan.id,
  //     bannedBy: 1, // admin id
  //     bannedUntil: DateTime.now().plus({ days: 3 }),
  //     reason: 'Already banned',
  //   })

  //   const response = await client
  //     .post('/bans')
  //     .header('Authorization', `Bearer ${adminToken}`)
  //     .json({
  //       userId: userToBan.id,
  //       duration: '7d',
  //       reason: 'Another ban attempt',
  //     })

  //   response.assertStatus(400)
  //   response.assertBodyContains({ message: 'Użytkownik już ma aktywnego bana' })
  // })

  // test('unban a user successfully', async ({ client }) => {
  //   // Najpierw upewnij się, że user ma bana
  //   const activeBan = await Ban.create({
  //     userId: userToBan.id,
  //     bannedBy: 1,
  //     bannedUntil: null, // ban forever
  //     reason: 'Permanent ban',
  //   })

  //   const response = await client
  //     .delete(`/bans/${userToBan.username}`)
  //     .header('Authorization', `Bearer ${adminToken}`)
  //     .json({ comment: 'Unbanning user after appeal' })

  //   response.assertStatus(200)
  //   response.assertBodyContains({ message: 'Użytkownik został odbanowany' })

  //   await activeBan.refresh()
  //   assert.isTrue(activeBan.bannedUntil <= DateTime.now())
  //   assert.isNotNull(activeBan.comment)
  // })

  // test('cannot unban a user who is not banned', async ({ client }) => {
  //   // Usuń wszystkie bany tego usera
  //   await Ban.query().where('user_id', userToBan.id).delete()

  //   const response = await client
  //     .delete(`/bans/${userToBan.username}`)
  //     .header('Authorization', `Bearer ${adminToken}`)
  //     .json({ comment: 'Trying to unban not banned user' })

  //   response.assertStatus(404)
  //   response.assertBodyContains({ message: 'Użytkownik nie jest zbanowany' })
  // })

  // test('list active bans', async ({ client }) => {
  //   // Dodaj kilka banów, aktywnych i wygasłych
  //   await Ban.create({
  //     userId: userToBan.id,
  //     bannedBy: 1,
  //     bannedUntil: DateTime.now().plus({ days: 5 }),
  //     reason: 'Active ban',
  //   })
  //   await Ban.create({
  //     userId: userToBan.id,
  //     bannedBy: 1,
  //     bannedUntil: DateTime.now().minus({ days: 1 }),
  //     reason: 'Expired ban',
  //   })

  //   const response = await client.get('/bans').header('Authorization', `Bearer ${adminToken}`)

  //   response.assertStatus(200)
  //   const bans = response.body()
  //   assert.isArray(bans)
  //   assert.isTrue(bans.some((b: any) => b.reason === 'Active ban'))
  //   assert.isFalse(bans.some((b: any) => b.reason === 'Expired ban'))
  // })
})
