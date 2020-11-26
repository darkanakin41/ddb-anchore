<template>
  <v-container fluid class="pa-0 fill-height">
    <v-app-bar app id="top-bar">
      <v-toolbar-title>
        <slot name="title">
        </slot>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn v-for="link in appBarLinks"
             v-bind:key="link.label"
             :to="link.to"
             :exact="true"
             class="ml-2" color="primary">
        {{ link.label }}
      </v-btn>

    </v-app-bar>
    <v-row no-gutters class="fill-height">
      <v-col>
        <v-main class="fill-height">
          <slot/>
        </v-main>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { RawLocation } from 'vue-router'

@Component({
  components: {}
})
export default class ViewContainer extends Vue {
  @Prop({ type: Array, default: () => [] })
  appBarLinks: { label: string, to: RawLocation }[]
}
</script>
