import axios, { AxiosRequestConfig } from 'axios'
import config from '@/config'
import { auth } from '@/store/modules'

export const client = axios.create(config.api)

client.interceptors.request.use((config: AxiosRequestConfig) => {
  if (auth.authenticated && auth.token) {
    // eslint-disable-next-line
    config.headers['Authorization'] = `Bearer ${auth.token}`
  }
  return config
})