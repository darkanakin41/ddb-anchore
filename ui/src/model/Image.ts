import ImageDetail from '@/model/ImageDetail'
import ImageContent from '@/model/ImageContent'


export default interface Image {
  analysis_status: string // Values: ANALYSIS_STATUS
  annotations: any
  imageDigest: string
  image_status: string // Values: IMAGE_STATUS
  userId: string
  image_type: string

  created_at: string // DateTime
  last_updated: string // DateTime

  image_content: ImageContent
  image_detail: ImageDetail[]
}