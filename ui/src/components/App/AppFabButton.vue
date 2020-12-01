<template>
  <fab-button :links="fabLinks" color="primary"/>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import FabButton from '@/components/App/FabButton.vue'
import { fabMobule } from '@/store/modules'

@Component({
  components: { FabButton }
})
export default class AppFabButton extends Vue {
  get fabLinks () {
    if (!fabMobule.entries) {
      return []
    }
    return fabMobule.entries
  }
}
</script>
