import { client } from '@/service/axios'
import Image from '@/model/Image'
import DeleteImageResponse from '@/model/Request/DeleteImageResponse'

export default class ImagesApi {
  static get (id: string): Promise<Image[]> {
    return client.get(`images/by_id/${id}`)
  }
  static delete (id: string): Promise<DeleteImageResponse> {
    return client.delete(`images/by_id/${id}?force=true`)
  }
}