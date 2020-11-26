export default interface ImageDetail {
  created_at: string
  dockerfile: string
  fulldigest: string
  fulltag: string
  tag: string
  imageDigest: string
  imageId: string
  last_updated: string // DateTime
  registry: string
  repo: string
  userId: string
}