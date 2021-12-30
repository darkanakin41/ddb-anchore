import { client } from '@/service/axios'
import { AxiosResponse } from 'axios'

export default class _AbstractApi {
  readonly endpoint: string

  /**
   * Send a POST request
   * @param url the url to call
   * @param data the data to send
   * @protected
   */
  protected async sendPost<T> (url: string, data: any): Promise<T> {
    return this.wrapResponse(await client.post(`${this.endpoint}/${url}`, data)) as Promise<T>
  }

  /**
   * Send a PUT request
   * @param url the url to call
   * @param data the data to send
   * @protected
   */
  protected async sendPut<T> (url: string, data: any): Promise<T> {
    return this.wrapResponse(await client.put(`${this.endpoint}/${url}`, data)) as Promise<T>
  }

  /**
   * Send a DELETE request
   * @param url the url to call
   * @protected
   */
  protected async sendDelete<T> (url: string): Promise<T> {
    return this.wrapResponse(await client.delete(`${this.endpoint}/${url}`)) as Promise<T>
  }

  /**
   * Send a GET request
   * @param url the url to call
   * @protected
   */
  protected async sendGet<T> (url: string): Promise<T[]> {
    return this.wrapResponse(await client.get(`${this.endpoint}/${url}`)) as Promise<T[]>
  }

  /**
   * Send a POST request
   * @param url the url to call
   * @protected
   */
  protected async sendGetOne<T> (url: string): Promise<T> {
    return this.wrapResponse(await client.get(`${this.endpoint}/${url}`)) as Promise<T>
  }

  /**
   * Wrap the response
   * @param res the response to wrap
   * @protected
   */
  protected wrapResponse (res: AxiosResponse) {
    const data = res.data

    return new Promise((resolve) => {
      return resolve(data)
    })
  }
}