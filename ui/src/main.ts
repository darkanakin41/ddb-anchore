import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import store from '@/store'

Vue.config.productionTip = false

require('../style/app.scss')

new Vue({
  store,
  vuetify,
  router,
  render: h => h(App)
}).$mount('#app')
