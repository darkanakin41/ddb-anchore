import Account from '@/model/Account'
import AccountCreationRequest from '@/model/Request/AccountCreationRequest'
import AccountState from '@/model/Request/AccountState'
import UserCreationRequest from '@/model/Request/UserCreationRequest'
import User from '@/model/User'
import _AbstractApi from '@/service/api/_abstractApi'

export default class AccountsApi extends _AbstractApi {
  readonly endpoint: string = 'accounts'

  getAll (): Promise<Account[]> {
    return this.sendGet<Account>('')
  }

  create (item: AccountCreationRequest): Promise<Account> {
    return this.sendPost<Account>('', item)
  }

  get (name: string): Promise<Account> {
    return this.sendGetOne<Account>(name)
  }

  updateState (account: Account): Promise<AccountState> | void {
    if (account.name === 'admin') {
      return
    }
    if (account.state === 'deleting') {
      return
    }
    // eslint-disable-next-line
    return new Promise<AccountState>(async () => {
      if (account.state === 'enabled') {
        account.state = 'disabled'
      } else {
        account.state = 'enabled'
      }
      try {
        return this.sendPut<AccountState>(`${account.name}/state`, { state: account.state })
      } catch (e) {
        if (account.state === 'enabled') {
          account.state = 'disabled'
        } else {
          account.state = 'enabled'
        }
      }
    })
  }

  getUsers (account: Account): Promise<User[]> {
    return this.sendGet<User>(`${account.name}/users`)
  }

  addUser (account: Account, request: UserCreationRequest): Promise<User> {
    return this.sendPost<User>(`${account.name}/users`, request)
  }

  deleteUser (account: Account, user: User): void | Promise<void> {
    return this.sendDelete(`/${account.name}/users/${user.username}`)
  }
}