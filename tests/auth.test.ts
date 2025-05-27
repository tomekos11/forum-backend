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

  test('should not register an existing user', async ({ client, assert }) => {
    const response = await client.post('/register').form({
      username: 'newuser123',
      password: 'Secret123!',
    })

    response.assertStatus(400)
    assert.deepEqual(response.body(), {
      error: 'Użytkownik o tej nazwie już istnieje',
    })
  })

  test('should not login with invalid credentials', async ({ client }) => {
    const response = await client.post('/login').form({
      username: 'newuser123',
      password: 'WrongPass1!',
    })

    response.assertStatus(401)
    response.assertBodyContains({ error: 'Nieprawidłowe dane logowania' })
  })

  test('should logout and clear token', async ({ client }) => {
    const login = await client.post('/login').form({
      username: 'newuser123',
      password: 'Secret123!',
    })

    const token = login.response.headers['set-cookie']
    const response = await client.get('/logout').header('cookie', token)

    response.assertStatus(200)
    response.assertBodyContains({ message: 'Wylogowano' })
  })

  test('should throttle after too many failed login attempts', async ({ client }) => {
    // Wysyłamy 10 błędnych prób logowania
    for (let i = 0; i < 28; i++) {
      await client.post('/login').form({
        username: 'newuser123',
        password: 'WrongPassword',
      })
    }

    // 11. próba powinna zostać zablokowana (HTTP 429)
    const response = await client.post('/login').form({
      username: 'throttleuser',
      password: 'WrongPassword',
    })

    response.assertStatus(429)
    response.assertBodyContains({
      errors: [{ message: 'Too many requests' }],
    })
  })
})
