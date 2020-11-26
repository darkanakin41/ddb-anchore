import { AxiosRequestConfig } from 'axios'

export interface Config {
  api: AxiosRequestConfig
  app: {
    itemsPerPageTableOptions: number[]
    itemsPerPageGridOptions: number[]
    dateFormatShort: Intl.DateTimeFormatOptions
    dateFormatLong: Intl.DateTimeFormatOptions
    timeFormat: Intl.DateTimeFormatOptions
  }
}

const config: Config = {
  api: {
    baseURL: 'https://swagger.{{core.domain.sub}}.{{core.domain.ext}}/v1',
    auth: {
      username: 'admin',
      password: 'foobar'
    }
  },
  app: {
    itemsPerPageTableOptions: [10, 20, 30],
    itemsPerPageGridOptions: [8, 16, 24, 32],
    dateFormatShort: {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      timeZone: 'Europe/Paris'
    },
    dateFormatLong: {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Europe/Paris'
    },
    timeFormat: {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZone: 'Europe/Paris'
    }
  }
}

export default config
