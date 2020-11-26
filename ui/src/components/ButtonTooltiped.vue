<template>
  <v-tooltip :left="tooltipPosition==='left'"
             :right="tooltipPosition==='right'"
             :bottom="tooltipPosition==='bottom'"
             :top="tooltipPosition==='top'"
  >
    <template v-slot:activator="{ on }">
      <v-btn :icon="!label" @click="click()" v-on="on" :id="id" :color="color" :class="classes" :loading="loading">
        <v-badge v-if="badgeContent" :color="badgeColor" :content="badgeContent" overlap>
          <v-icon v-if="icon">{{ icon }}</v-icon>
          <template v-if="label">{{ label }}</template>
        </v-badge>
        <template v-else>
          <v-icon v-if="icon">{{ icon }}</v-icon>
          <template v-if="label">{{ label }}</template>
        </template>
      </v-btn>
    </template>
    <span>{{ content }}</span>
  </v-tooltip>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({})
export default class ButtonTooltiped extends Vue {
  @Prop({ required: true })
  tooltipPosition: string

  @Prop({})
  icon: string

  @Prop({})
  id: string

  @Prop({})
  label: string

  @Prop({})
  content: string

  @Prop({})
  badgeContent: string

  @Prop({})
  badgeColor: string

  @Prop({})
  color: string

  @Prop({ default: () => [] })
  classes: []

  @Prop({ required: false, default: false })
  loading: boolean

  click () {
    this.$emit('click')
  }
}
</script>
