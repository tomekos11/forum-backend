import env from '../build/start/env.js';
import chakram from 'chakram';

const expect = chakram.expect

const BASE_URL = 'http://localhost:3333'
const testTopicId = 1;

describe('API Posts Tests', () => {

    it('Powinien zwrócić 401 bez tokena JWT', async () => {
      const response = await chakram.post(`${BASE_URL}/posts`, {
        content: 'Testowa treść',
        topicId: testTopicId
      });
      
      expect(response).to.have.status(401);
      return chakram.wait();
    });

    it('Powinien dodać post po zalogowaniu (z tokenem w ciastku)', async () => {
        // Krok 1: zaloguj się i wyciągnij ciasteczko
        const loginResponse = await chakram.post(`${BASE_URL}/login`, {
            username: env.get('USER_LOGIN'),
            password: env.get('USER_PASSWORD'),
        });

        expect(loginResponse).to.have.status(200);

        const setCookieHeader = loginResponse.response.headers['set-cookie'];

        let tokenCookie;
        if (setCookieHeader) {
            const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
            for (const cookie of cookies) {
            if (cookie.startsWith('token=')) {
                tokenCookie = cookie
                break;
            }
            }
        }
        expect(tokenCookie).to.exist;

        // Krok 2: wyślij żądanie z ciastkiem token
        const postResponse = await chakram.post(`${BASE_URL}/posts`, {
            content: 'Testowa treść',
            topicId: testTopicId
        }, {
            headers: {
                Cookie: tokenCookie
            }
        });

        expect(postResponse).to.have.status(201);
        return chakram.wait();
    });

})