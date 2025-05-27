import { test } from '@japa/runner'
import User from '#models/user'
import { ApiClient } from '@japa/api-client'
import Ban from '#models/ban'
import { DateTime } from 'luxon'

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

  return tokenCookie
}

test.group('Bans', (group) => {
  let userToBan: null | User = null
  group.setup(async () => {
    await User.create({ username: 'admin', password: 'password', role: 'admin' })
    const user = await User.create({ username: 'test', password: 'test' })
    userToBan = user
  })

  test('ban a user successfully', async ({ client, assert }) => {
    const tokenCookie = await getAdminTokenCookie(client)

    const response = await client
      .post('/bans')
      .header('Cookie', tokenCookie) // użycie tokenu z ciasteczka
      .json({
        userId: userToBan?.id,
        duration: '7d',
        reason: 'Test ban',
      })

    response.assertStatus(200)

    response.assertBodyContains({
      ban: {
        userId: userToBan?.id,
        reason: 'Test ban',
      },
    })
    // Sprawdź, czy ban jest w bazie
    const ban = await Ban.query().where('user_id', userToBan?.id!).first()
    assert.isNotNull(ban)
    assert.isTrue(ban && ban.bannedUntil && ban.bannedUntil > DateTime.now())
  })

  test('cannot ban user who is already banned', async ({ client }) => {
    const tokenCookie = await getAdminTokenCookie(client)

    const response = await client.post('/bans').header('Cookie', tokenCookie).json({
      userId: userToBan?.id,
      duration: '7d',
      reason: 'Test ban',
    })

    response.assertStatus(400)
    response.assertBodyContains({ message: 'Użytkownik już ma aktywnego bana' })
  })

  test('unban a user successfully', async ({ client, assert }) => {
    const tokenCookie = await getAdminTokenCookie(client)

    const response = await client
      .delete(`/bans/${userToBan?.username}`)
      .header('Cookie', tokenCookie)

    response.assertStatus(200)
    response.assertBodyContains({ message: 'Użytkownik został odbanowany' })
  })

  test('cannot unban a user who is not banned', async ({ client }) => {
    const tokenCookie = await getAdminTokenCookie(client)

    const response = await client
      .delete(`/bans/${userToBan?.username}`)
      .header('Cookie', tokenCookie)

    response.assertStatus(404)
    response.assertBodyContains({ message: 'Użytkownik nie jest zbanowany' })
  })

  test('list active bans', async ({ client, assert }) => {
    const tokenCookie = await getAdminTokenCookie(client)

    await Ban.create({
      userId: userToBan?.id,
      bannedBy: 1,
      bannedUntil: DateTime.now().plus({ days: 5 }),
      reason: 'Active ban',
    })

    const response = await client.get('/bans').header('Cookie', tokenCookie)

    response.assertStatus(200)
    const bans = response.body()

    assert.isArray(bans)
    assert.isTrue(bans.some((b: any) => b.reason === 'Active ban'))
    assert.isFalse(bans.some((b: any) => b.reason === 'Expired ban'))
  })
})
