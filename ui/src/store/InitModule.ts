import { Module, Mutation, VuexModule } from 'vuex-module-decorators'
import store from '.'

const _namespace = 'init'

export interface InitState {
  hydrated: boolean
  hydrating: boolean
}

@Module({ dynamic: true, store, namespaced: true, name: _namespace })
export default class InitModule extends VuexModule implements InitState {
  hydrated = false
  hydrating = false

  @Mutation
  resetState () {
    this.hydrated = false
    this.hydrating = false
  }

  @Mutation
  setHydrated (hydrated: boolean) {
    this.hydrated = hydrated
  }

  @Mutation
  setHydrating (hydrating: boolean) {
    this.hydrating = hydrating
  }
}
