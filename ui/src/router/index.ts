import Vue from 'vue'
import VueRouter, { Route, RouteConfig } from 'vue-router'

Vue.use(VueRouter)

function injectId (route: Route) {
  return { id: route.params.id }
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
    props: injectId
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
