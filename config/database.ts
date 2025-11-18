import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'
import { getSecret } from './aws.js'
import { loadEnv } from './secrets.js'

async function getDbConfig() {
  interface DbSecret {
    host: string
    port: number
    username: string
    password: string
    engine: string
    dbInstanceIdentifier: string
  }

  const secrets = await getSecret<DbSecret | undefined>('forum/db')
  const awsEnv = await loadEnv()

  return defineConfig({
    prettyPrintDebugQueries: true,
    connection: 'mysql',
    connections: {
      mysql: {
        client: 'mysql2',
        connection: {
          host: secrets?.host ?? env.get('DB_HOST'),
          port: secrets?.port ?? env.get('DB_PORT'),
          user: secrets?.username ?? env.get('DB_USER'),
          password: secrets?.password ?? env.get('DB_PASSWORD'),
          database: awsEnv?.DB_DATABASE ?? env.get('DB_DATABASE'),
        },
        migrations: {
          naturalSort: true,
          paths: ['database/migrations'],
        },
      },
    },
  })
}

export default await getDbConfig()
