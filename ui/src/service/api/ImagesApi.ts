import Image from '@/model/Image'
import DeleteImageResponse from '@/model/Request/DeleteImageResponse'
import _AbstractApi from '@/service/api/_abstractApi'

export default class ImagesApi extends _AbstractApi {
  readonly endpoint: string = 'images'

  get (id: string): Promise<Image[]> {
    return this.sendGet<Image>(`by_id/${id}`)
  }

  delete (id: string): Promise<DeleteImageResponse> {
    return this.sendDelete<DeleteImageResponse>(`by_id/${id}?force=true`)
  }
}