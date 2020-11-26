import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import fr from 'vuetify/src/locale/fr'

Vue.use(Vuetify)

export default new Vuetify({
  lang: {
    locales: { fr },
    current: 'fr'
  },
  theme: {
    dark: true,
    themes: {
      dark: {
        primary: '#307fe2'
      },
      light: {
        primary: '#307fe2'
      }
    }
  }
})
