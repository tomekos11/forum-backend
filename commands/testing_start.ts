import { BaseCommand } from '@adonisjs/core/ace'
import { execSync } from 'node:child_process'

export default class TestingStart extends BaseCommand {
  static commandName = 'testing:start'
  static description = 'Resetuje bazę, seeduje i uruchamia testy w trybie testowym'

  async run() {
    // Ustaw zmienną środowiskową
    process.env.NODE_ENV = 'test'

    // 1. migration:fresh
    this.logger.info('Wykonuję migration:fresh...')
    execSync('node ace migration:fresh', {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'test' },
    })

    // 2. db:seed
    this.logger.info('Wykonuję db:seed...')
    execSync('node ace db:seed', { stdio: 'inherit', env: { ...process.env, NODE_ENV: 'test' } })

    // 3. ts-mocha
    this.logger.info('Uruchamiam testy...')
    execSync('npx ts-mocha --paths -p tsconfig.json tests/**/*.spec.js', {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'test' },
    })
  }
}
