import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager'

export const client = new SecretsManagerClient({
  region: 'eu-north-1',
})

export async function getSecret<T = Record<string, any>>(secretName: string): Promise<T> {
  let secretResponse

  try {
    secretResponse = await client.send(
      new GetSecretValueCommand({
        SecretId: secretName,
        VersionStage: 'AWSCURRENT',
      })
    )
  } catch (error) {
    // tutaj możesz obsłużyć błąd, np. logować lub propagować dalej
    throw error
  }

  const secretString = secretResponse.SecretString
  if (!secretString) throw new Error('Secret string is empty')

  try {
    return JSON.parse(secretString)
  } catch (parseError) {
    throw new Error('Failed to parse secret JSON: ' + parseError)
  }
}
