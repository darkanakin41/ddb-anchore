import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import store from '.'
import JwtDecode from 'jwt-decode'
import { auth } from '@/store/modules.ts'
import User from '@/model/User'
import AuthentificationApi from '@/service/api/AuthentificationApi'
import Account from '@/model/Account'

const _namespace = 'auth'

const CHECK_TOKEN_EACH = 60
const LIMIT_EXPIRE_IN = 120

export interface TokenData{
  iss: string
  sub: string
  exp: number
  iat: number
  jti: string
}


@Module({ dynamic: true, store, namespaced: true, name: _namespace })
export default class AuthModule extends VuexModule {
  _user: Account | null = null
  _token: string | null = null
  _renewInterval: number | null = null
  _renewing: boolean = false

  get authenticated (): boolean {
    return this.token !== null
  }

  get user (): Account | null {
    return this._user
  }

  get token (): string | null {
    return this._token
  }


  get renewInterval (): number | null {
    return this._renewInterval
  }

  get isRenewing (): boolean {
    return this._renewing
  }

  get role (): string {
    if (this.user) {
      return this.user.type
    }
    return ''
  }

  @Action({ rawError: true })
  resetState () {
    this.setUser(null)
    this.setToken(null)
    this.setRenewInterval(null)
    this.setRenewing(false)
    localStorage.removeItem('token')
  }

  @Mutation
  setUser (user: Account | null) {
    this._user = user
  }

  @Mutation
  setToken (token: string | null) {
    this._token = token
  }

  @Mutation
  setRenewInterval (interval: number | null) {
    if (interval === null && this._renewInterval !== null) {
      clearInterval(this._renewInterval)
    }
    this._renewInterval = interval
  }

  @Mutation
  setRenewing (renewing: boolean) {
    this._renewing = renewing
  }

  @Action({ rawError: true })
  createRenewInterval () {
    const intervalNb = setInterval(() => {
      if (this.user && this.token) {
        const tokenData: TokenData = JwtDecode(this.token)
        const expireIn = (tokenData.exp * 1000) - new Date().getTime()
        if (expireIn < (LIMIT_EXPIRE_IN * 1000)) {
          this.renewToken().then(() => {
          })
        }
      }
    }, (CHECK_TOKEN_EACH * 1000))
    this.setRenewInterval(intervalNb)
  }

  @Action({ rawError: true })
  async login (token: string) {
    this.setToken(token)

    this.setUser((await AuthentificationApi.getUserData()).data) //TODO

    localStorage.setItem('token', token)

    if (this.renewInterval === null) {
      this.createRenewInterval()
    }
  }

  @Action({ rawError: true })
  async tryGetUser () {
    if (this.authenticated) {
      return this._user
    }

    const localStorageTokensRaw = localStorage.getItem('token')
    let userData
    if (localStorageTokensRaw) {
      try {
        this.setToken(localStorageTokensRaw)
        this.setRenewing(true)

        userData = (await AuthentificationApi.getUserData()).data
        this.setUser(userData)
        this.setRenewing(false)
      } catch (error) {
        await this.logout()
        return
      }
    }

    if (userData && this.renewInterval === null) {
      this.createRenewInterval()
    }
    return this.user
  }

  @Action({ rawError: true })
  async logout () {
    this.setToken(null)
    this.setUser(null)
    localStorage.removeItem('token')
  }

  @Action({ rawError: true })
  async renewToken () {
    if (this.user && this.token && !this.isRenewing) {
      this.setRenewing(true)
      const res = await AuthentificationApi.refreshToken()
      localStorage.setItem('tokens', res.data.access_token)
      this.setRenewing(false)
    }
  }
}
