<template>
  <app-dialog :open.sync="dialog" max-width="500" :persistent="true">
    <template v-slot:title>
      Validation
    </template>
    <slot>Êtes-vous sûr de vouloir faire cela ?</slot>
    <template v-slot:actions>
      <v-spacer/>
      <v-btn color="error" text @click="dialog = false">Non</v-btn>
      <v-btn color="primary" depressed @click="confirm">Oui</v-btn>
    </template>
  </app-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import AppDialog from '@/components/App/AppDialog.vue'

@Component({
  components: { AppDialog }
})
export default class ValidationDialog extends Vue {
  @Prop({ type: Boolean, default: false })
  value: boolean

  dialog: boolean = false

  confirm () {
    this.$emit('confirmed')
    this.dialog = false
  }

  @Watch('value')
  @Watch('dialog')
  onValueChanged (newVal: boolean) {
    this.dialog = newVal
    this.$emit('input', newVal)
  }
}
</script>
