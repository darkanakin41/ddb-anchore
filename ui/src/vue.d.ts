import './vue'

import { Vue } from 'vue/types/vue'
declare module 'vue/types/vue' {
  interface Vue {
    $rules: { [key: string]: Function }
  }
}
