<template>
  <app-dialog :open.sync="openSynced">
    <template v-slot:title>Ajout d'un compte</template>
    <v-form @submit.prevent="save">
      <v-container fluid>
        <v-row>
          <v-col cols="12">
            <v-text-field v-model="item.name"
                          label="Nom"
                          :disabled="loading"/>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-text-field v-model="item.email"
                          label="Adresse e-mail"
                          :disabled="loading"/>
          </v-col>
        </v-row>
      </v-container>
      <div class="text-right">
        <v-btn type="submit" :loading="loading">Ajouter</v-btn>
      </div>
    </v-form>
  </app-dialog>
</template>

<script lang="ts">
import { Component, Prop, PropSync, Vue } from 'vue-property-decorator'
import AppDialog from '@/components/App/AppDialog.vue'
import AccountCreationRequest from '@/model/Request/AccountCreationRequest'
import AccountsApi from '@/service/api/AccountsApi'

@Component({
  components: { AppDialog }
})
export default class AccountCreationDialog extends Vue {
  @PropSync('open', { required: true, default: false })
  openSynced: boolean

  @Prop({ required: true })
  item: AccountCreationRequest

  loading: boolean = false

  async save () {
    this.loading = true
    try {
      await (new AccountsApi()).create(this.item)
    } catch (e) {
      console.error('Une erreur est survenue')
    }
    this.openSynced = false
    this.$emit('done')
    this.loading = false
  }
}
</script>

<style lang="scss" scoped>
.row-action {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
