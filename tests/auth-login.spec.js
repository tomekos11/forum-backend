import env from '../build/start/env.js';
import chakram from 'chakram'

const expect = chakram.expect

const BASE_URL = 'http://localhost:3333'

describe('API Login Tests', () => {
  // Test poprawnego logowania
  it('Powinien zalogować użytkownika i zwrócić pełne dane', async () => {
    const payload = {
      username: env.get('USER_LOGIN'),
      password: env.get('USER_PASSWORD'),
    }

    const response = await chakram.post(`${BASE_URL}/login`, payload)

    expect(response).to.have.status(200)
    expect(response).to.have.header('content-type', /json/)

    // Walidacja struktury odpowiedzi
    expect(response.body).to.have.property('user')
    expect(response.body.user).not.to.have.property('reports')
    expect(response.body).to.have.property('notifications')
    expect(response.body).to.have.property('reports')

    // Szczegółowa walidacja raportów
    expect(response.body.reports).to.have.property('userReports')
    expect(response.body.reports).to.have.property('count')
    expect(response.body.reports.count).to.be.a('number')

    return chakram.wait()
  })

  // Test niepoprawnych danych
  it('Powinien zwrócić błąd 401 dla niepoprawnych danych', async () => {
    const payload = {
      username: 'nieistniejacyUser',
      password: 'złeHasło',
    }

    const response = await chakram.post(`${BASE_URL}/login`, payload)

    expect(response).to.have.status(401)
    expect(response.body.error).to.equal('Nieprawidłowe dane logowania')

    return chakram.wait()
  })


  const payloads = [
    { username: "' OR 1=1 --", password: "abc" },
    { username: "admin' --", password: "abc" },
    { username: "\" OR \"1\"=\"1", password: "abc" }
  ];

  payloads.forEach((payload, idx) => {
    it(`Nie powinien przepuścić SQL injection wariant ${idx + 1}`, async () => {
      const response = await chakram.post(`${BASE_URL}/login`, payload);
      expect(response).to.have.status(401);
      expect(response.body.error).to.equal('Nieprawidłowe dane logowania');
      return chakram.wait();
    });
  });


  // Test zablokowanego użytkownika
  it('Powinien zwrócić informacje o banie dla zablokowanego konta', async () => {
    const payload = {
      username: env.get('BANNED_USER_LOGIN'),
      password: env.get('BANNED_USER_PASSWORD'),
    }

    const response = await chakram.post(`${BASE_URL}/login`, payload)

    expect(response).to.have.status(401)
    expect(response.body).to.have.property('reason')
    expect(response.body).to.have.property('bannedUntil')
    expect(response.body).to.have.property('isBanned')

    return chakram.wait()
  })
})
