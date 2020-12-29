import { client } from '@/service/axios'
import Account from '@/model/Account'
import AccountCreationRequest from '@/model/Request/AccountCreationRequest'
import AccountState from '@/model/Request/AccountState'
import UserCreationRequest from '@/model/Request/UserCreationRequest'
import User from '@/model/User'

export default class AccountsApi {

  static getAll (): Promise<Account[]> {
    return client.get('accounts')
  }

  static create (item: AccountCreationRequest): Promise<Account> {
    return client.post('accounts', item)
  }

  static get (name: string): Promise<Account> {
    return client.get(`accounts/${name}`)
  }

  static updateState (account: Account): Promise<AccountState> | void {
    if (account.name === 'admin') {
      return
    }
    if (account.state === 'deleting') {
      return
    }
    return new Promise<AccountState>(async () => {
      if (account.state === 'enabled') {
        account.state = 'disabled'
      } else {
        account.state = 'enabled'
      }
      try {
        await client.put(`accounts/${account.name}/state`, { state: account.state })
      } catch (e) {
        if (account.state === 'enabled') {
          account.state = 'disabled'
        } else {
          account.state = 'enabled'
        }
      }
    })
  }

  static getUsers (account: Account): Promise<User[]> {
    return client.get(`accounts/${account.name}/users`)
  }

  static addUser (account: Account, request: UserCreationRequest): Promise<User> {
    return client.post(`accounts/${account.name}/users`, request)
  }

  static deleteUser (account: Account, user: User): void | Promise<void> {
    if (user.username === 'admin') {
      return
    }
    return client.delete(`accounts/${account.name}/users/${user.username}`)
  }

}