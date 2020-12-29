import { client } from '@/service/axios'

export default class AuthentificationApi {
  static login (username: string, password: string) {
    const data = new FormData()
    data.set('username', username)
    data.set('password', password)
    data.set('grant_type', 'password')
    data.set('client_id', 'anonymous')
    return client.post('oauth/token',
      data,
      {
        auth: undefined,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )
  }

  static getUserData() {
    return client.get('account')
  }

  static refreshToken() {
    return client.post('oauth/token')
  }
}