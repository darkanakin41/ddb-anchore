import { getModule } from 'vuex-module-decorators'
import AuthModule from '@/store/AuthModule.ts'
import InitModule from '@/store/InitModule.ts'

export const auth = getModule(AuthModule)
export const init = getModule(InitModule)
