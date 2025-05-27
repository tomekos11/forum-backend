import { test } from '@japa/runner'
import User from '#models/user'
import { hash } from 'bcryptjs'
import redis from '@adonisjs/redis/services/main'
import Database from '@adonisjs/lucid/services/db'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Auth', (group) => {
  test('should register a new user', async ({ client, assert }) => {
    const response = await client.post('/register').form({
      username: 'newuser123',
      password: 'Secret123!',
    })

    response.assertStatus(200)
    assert.equal(response.body().username, 'newuser123')

    const user = await User.findBy('username', 'newuser123')
    assert.isNotNull(user)
  })

  // test('should not register an existing user', async ({ client }) => {
  //   await User.create({ username: 'existing', password: await hash('password', 10) })

  //   const response = await client.post('/register').form({
  //     username: 'existing',
  //     password: 'secret123',
  //   })

  //   response.assertStatus(400)
  //   response.assertBodyContains({ error: 'Użytkownik o tej nazwie już istnieje' })
  // })

  // test('should login valid user', async ({ client }) => {
  //   await User.create({ username: 'testuser', password: await hash('secret123', 10) })

  //   const response = await client.post('/login').form({
  //     username: 'testuser',
  //     password: 'secret123',
  //   })

  //   response.assertStatus(200)
  //   response.assertBodyContains({
  //     user: { username: 'testuser' },
  //     notifications: [],
  //     reports: { count: 0 },
  //   })
  // })

  // test('should not login with invalid credentials', async ({ client }) => {
  //   await User.create({ username: 'invaliduser', password: await hash('correctpass', 10) })

  //   const response = await client.post('/login').form({
  //     username: 'invaliduser',
  //     password: 'wrongpass',
  //   })

  //   response.assertStatus(401)
  //   response.assertBodyContains({ error: 'Nieprawidłowe dane logowania' })
  // })

  // test('should logout and clear token', async ({ client }) => {
  //   const user = await User.create({
  //     username: 'logoutuser',
  //     password: await hash('secret123', 10),
  //   })

  //   const login = await client.post('/login').form({
  //     username: 'logoutuser',
  //     password: 'secret123',
  //   })

  //   const token = login.response.headers['set-cookie']
  //   const response = await client.post('/logout').header('cookie', token)

  //   response.assertStatus(200)
  //   response.assertBodyContains({ message: 'Wylogowano' })
  // })
})
