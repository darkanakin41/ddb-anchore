<template>
  <v-dialog v-model="openSync"
            :max-width="maxWidth"
            :persistent="persistent"
            overlay-color="white"
            overlay-opacity=".1"
            transition="dialog-bottom-transition"
            scrollable>
    <v-card :id="id" :class="classes">
      <v-card-title v-if="hasTitle || persistent" :elevation="1">
        <slot name="title"/>
        <v-spacer/>
        <slot name="top-actions"/>
        <v-btn icon @click="openSync=false" color="error">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <slot></slot>
      </v-card-text>
      <v-card-actions v-if="hasActions">
        <slot name="actions"></slot>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, PropSync, Vue } from 'vue-property-decorator'

@Component({})
export default class AppDialog extends Vue {
  @PropSync('open', { required: true })
  openSync: boolean

  @Prop({ required: false, default: 800 })
  maxWidth: number

  @Prop({ required: false, default: false })
  persistent: boolean

  @Prop({ required: false, default: () => [] })
  classes: string[]

  @Prop({ required: false, default: '' })
  id: string

  get hasActions () {
    return this.$slots.actions !== undefined
  }

  get hasTitle () {
    return this.$slots.title !== undefined
  }
}
</script>
