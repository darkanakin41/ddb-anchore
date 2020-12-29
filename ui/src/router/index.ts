import Vue from 'vue'
import VueRouter, { RawLocation, Route, RouteConfig } from 'vue-router'
import { auth, init } from '@/store/modules'
import hydrateStore from '@/store/hydrate'

Vue.use(VueRouter)

function inject (fields: string[]) {
  return (route: Route) => {
    const params: { [key: string]: string } = {}
    fields.forEach((field) => {
      params[field] = route.params[field]
    })
    return params
  }
}

const routes: Array<RouteConfig> = [
  {
    path: '/security/login',
    name: 'security-login',
    component: () => import('@/views/Security/Login.vue'),
    meta:{
      access:{
        allowAnonymous: true
      }
    }
  },
  {
    path: '/security/logout',
    name: 'security-logout',
    component: () => import('@/views/Security/Logout.vue')
  },
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
    component: () => import('@/views/AccountList.vue')
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

router.beforeEach(async (to: Route, from: Route, next: (to?: RawLocation | false | ((vm: Vue) => any) | void) => void) => {
  try {
    await auth.tryGetUser()
    if (to.meta.access && to.meta.access.allowAnonymous) {
      return next()
    } else if (!auth.authenticated) {
      return next({ name: 'security-login' })
    }
    if (!init.hydrated && !init.hydrating) {
      await hydrateStore()
    }

    // if (!init.hydrated && !init.hydrating) {
    //   hydrateStore().then(() => checkRolesCb(to, from, next)).catch(() => next(false))
    // } else {
    //   checkRolesCb(to, from, next)
    // }
    return next()
  } catch (e) {
    return next({ name: 'security-login' })
  }
})

export default router
