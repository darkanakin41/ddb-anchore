<template>
  <v-app id="app">
    <view-container :app-bar-links="appBarLinks">
      <template v-slot:title>
        Anchore UI
      </template>
      <v-container fluid>
        <router-view/>
      </v-container>
    </view-container>
    <v-footer fixed height="48">
      <v-col cols="4">
        {{ new Date().getFullYear() }} — <strong>Pierre LEJEUNE</strong>
      </v-col>
      <v-col cols="8" class="text-right">
        <v-btn icon href="https://github.com/darkanakin41/" target="_blank">
          <v-icon>mdi-github</v-icon>
        </v-btn>
        <v-btn icon href="https://www.linkedin.com/in/pierre-lejeune/" target="_blank">
          <v-icon>mdi-linkedin</v-icon>
        </v-btn>
        <v-btn icon href="https://twitter.com/pierrelejeune" target="_blank">
          <v-icon>mdi-twitter</v-icon>
        </v-btn>
      </v-col>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { RawLocation } from 'vue-router'
import ViewContainer from '@/components/Layout/ViewContainer.vue'

@Component({
  components: { ViewContainer }
})
export default class App extends Vue {
  appBarLinks: { label: string, to: RawLocation }[] = [
    {
      label: 'Abonnements',
      to: { name: 'subscription-list' }
    },
    {
      label: 'Images',
      to: { name: 'image-list' }
    }
  ]
}
</script>