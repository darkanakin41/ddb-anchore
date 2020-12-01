export default interface Subscription {
  active: boolean
  created_at: number
  last_updated: number
  subscription_id: string
  subscription_key: string
  subscription_type: string
  subscription_value: string
  userId: string
}
