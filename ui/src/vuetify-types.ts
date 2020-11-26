import { Vue } from 'vue/types/vue'

export interface VForm extends Vue {
  reset (): void,

  resetValidation (): void,

  validate (): boolean
}

export interface Validatable extends Vue {
  errorBucket: string[],
  hasColor: boolean,
  hasFocused: boolean,
  hasInput: boolean,
  isFocused: boolean,
  isResetting: boolean,
  lazyValue: any,
  valid: boolean,

  reset (): void
  resetValidation (): void
  validate (force?: boolean, value?: any): boolean
}
