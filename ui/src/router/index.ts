import Vue from 'vue'
import VueRouter, { Route, RouteConfig } from 'vue-router'

Vue.use(VueRouter)

function inject (fields: string[]) {
  return (route:Route) => {
    const params: { [key: string]: string } = {}
    fields.forEach((field) => {
      params[field] = route.params[field]
    })
    return params
  }
}

const routes: Array<RouteConfig> = [
  {
    path: '/subscription/list',
    name: 'subscription-list',
    component: () => import('@/views/SubscriptionList.vue')
  },
  {
    path: '/image/list',
    name: 'image-list',
    component: () => import('@/views/ImageList.vue')
  },
  {
    path: '/image/:id',
    name: 'image-view',
    component: () => import('@/views/ImageDetail.vue'),
    props: inject(['id'])
  },
  {
    path: '/account/list',
    name: 'account-list',
    component: () => import('@/views/AccountList.vue'),
  },
  {
    path: '/account/:name',
    name: 'account-view',
    component: () => import('@/views/AccountDetail.vue'),
    props: inject(['name'])
  },
  {
    path: '/registry/list',
    name: 'registry-list',
    component: () => import('@/views/RegistryList.vue'),
    props: inject(['id'])
  },
  {
    path: '*',
    redirect: { name: 'image-list' }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
