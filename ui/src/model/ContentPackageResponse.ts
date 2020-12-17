import ContentPackage from '@/model/ContentPackage'

export default interface ContentPackageResponse {
  content: ContentPackage[]
  content_type: string
  imageDigest: string
}