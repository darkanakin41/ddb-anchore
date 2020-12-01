import { Location } from 'vue-router'

export interface NavigationLink {
  id?: any
  label: string
  icon?: string
  action?: () => any
  to?: Location
  childs?: NavigationLink[]
  exact?: boolean
  tooltiped?: string
  loading?: boolean
}
