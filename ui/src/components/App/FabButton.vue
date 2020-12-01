<template>
  <div>
    <v-overlay :value="contextualMenu" color="white" opacity=".1"></v-overlay>
    <v-btn v-if="linksCount === 1"
           :color="color"
           @click="firstLinkAction()"
           :to="firstLink.to"
           fixed
           bottom
           right
           fab
    >
      <v-icon>{{ icon }}</v-icon>
    </v-btn>
    <v-btn v-else-if="linksCount > 1"
           fixed
           bottom
           right
           fab
           :color="color"
           @click="displayMenu"
    >
      <v-icon>{{ icon }}</v-icon>
      <contextual-menu :open.sync="contextualMenu"
                       :position-x="contextualMenuPositionX"
                       :position-y="contextualMenuPositionY"
                       :links="links"
                       position="top left"/>
    </v-btn>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { NavigationLink } from '@/components/Navigation/model'
import ContextualMenu from '@/components/ContextualMenu.vue'

@Component({
  components: { ContextualMenu }
})
export default class FabButton extends Vue {
  @Prop({
    required: true,
    default: () => {
      return []
    }
  })
  links: NavigationLink[]

  @Prop({ default: 'primary' })
  color: string

  contextualMenu: boolean = false
  contextualMenuPositionX: number = 0
  contextualMenuPositionY: number = 0

  get icon (): string {
    if (this.linksCount === 1 && this.links[0].icon) {
      return this.links[0].icon
    }
    return 'mdi-cog-outline'
  }

  get linksCount (): number {
    if (!this.links) {
      return 0
    }
    return this.links.length
  }

  get firstLink () {
    return this.links[0]
  }

  get firstLinkAction (): Function {
    return this.firstLink.action ? this.firstLink.action : () => {
    }
  }

  displayMenu ($event: MouseEvent) {
    $event.preventDefault()
    this.contextualMenuPositionX = $event.x
    this.contextualMenuPositionY = $event.y
    this.contextualMenu = true
  }
}
</script>
