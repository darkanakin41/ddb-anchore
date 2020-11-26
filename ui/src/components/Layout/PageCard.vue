<template>
  <v-card flat tile :height="height" ref="card" :class="classes">
    <v-toolbar>
      <v-app-bar-nav-icon v-if="icon" @click="toolbarIconAction">
        <v-icon color="white">{{ icon }}</v-icon>
      </v-app-bar-nav-icon>
      <v-toolbar-title>
        <slot name="title"></slot>
      </v-toolbar-title>
      <template v-if="hasToolbarActions">
        <v-spacer/>
        <slot name="toolbar-actions"></slot>
      </template>
      <template v-if="collapsible !== false">
        <v-spacer v-if="!hasToolbarActions"/>
        <button-tooltiped :content="collapsed ? 'Agrandir' : 'Réduire'"
                          :icon="collapsed ? 'mdi-unfold-more-horizontal' : 'mdi-unfold-less-horizontal'"
                          @click="collapsed = !collapsed"
                          tooltip-position="left"
        />
      </template>
    </v-toolbar>
    <v-card-text :class="{'pa-0' : !bodyPadding}" transition="scale-transition">
      <slot></slot>
    </v-card-text>
    <v-card-actions v-if="hasCardActions">
      <slot name="card-actions"></slot>
    </v-card-actions>
    <v-navigation-drawer v-if="hasRightDrawerContent"
                         absolute
                         right
                         stateless
                         temporary
                         :width="drawerWidth"
                         v-model="rightDrawerOpenSynced">
      <slot name="right-drawer"></slot>
    </v-navigation-drawer>
  </v-card>
</template>

<script lang="ts">
import { Component, Prop, PropSync, Vue } from 'vue-property-decorator'
import ButtonTooltiped from '@/components/ButtonTooltiped.vue'

@Component({
  components: { ButtonTooltiped }
})
export default class PageCard extends Vue {
  @Prop({ default: null })
  icon: string | null

  @Prop({ default: null })
  iconAction: Function | null

  @Prop({ default: null })
  height: string | null

  @PropSync('rightDrawerOpen', { default: false })
  rightDrawerOpenSynced: boolean

  @Prop({ default: true })
  bodyPadding: boolean

  @Prop({ default: true })
  updateTitle: boolean

  @Prop({ default: false })
  fullheight: boolean | string

  @Prop({ default: false })
  collapsible: boolean | string

  @Prop({ default: false })
  collapsedInit: boolean | string

  collapsed: boolean = (this.collapsedInit !== false)

  mounted () {
    document.addEventListener('keyup', (event: KeyboardEvent) => {
      if (this.rightDrawerOpenSynced) {
        const target: EventTarget | null = event.target
        // @ts-ignore
        if (event.key === 'Escape' && target !== null && target.tagName === 'BODY') {
          this.rightDrawerOpenSynced = false
        }
      }
    })
  }

  get hasCardActions () {
    return this.$slots['card-actions'] !== undefined
  }

  get hasToolbarActions () {
    return this.$slots['toolbar-actions'] !== undefined
  }

  get hasRightDrawerContent () {
    return this.$slots['right-drawer'] !== undefined
  }

  get drawerWidth () {
    return 360
  }

  get classes () {
    const classes = ['page-card']
    if (this.fullheight !== false) {
      classes.push('full-page')
    }
    if (this.collapsed) {
      classes.push('collapsed')
    }
    return classes
  }

  get toolbarIconAction () {
    return this.iconAction ? this.iconAction : () => {
      if (this.collapsible === '' || this.collapsible === true) {
        this.collapsed = !this.collapsed
      }
    }
  }
}
</script>

<style lang="scss">
.page-card {
  &.collapsed {
    .v-card__text {
      display: none;
    }
  }
}
</style>