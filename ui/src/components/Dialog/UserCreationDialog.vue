<template>
  <app-dialog :open.sync="openSynced">
    <template v-slot:title>Ajout d'un utilisateur</template>
    <v-form @submit.prevent="save">
      <v-container fluid>
        <v-row>
          <v-col cols="12">
            <v-text-field v-model="item.username"
                          label="Identifiant"
                          :disabled="loading"/>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-text-field v-model="item.password"
                          label="Mot de passe"
                          :disabled="loading"
                          :rules="passwordRules"
                          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                          @click:append="showPassword = !showPassword"
                          :type="showPassword ? 'text' : 'password'"/>
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
import UserCreationRequest from '@/model/Request/UserCreationRequest'
import Account from '@/model/Account'
import AccountsApi from '@/service/api/AccountsApi'

@Component({
  components: { AppDialog }
})
export default class UserCreationDialog extends Vue {
  @PropSync('open', { required: true, default: false })
  openSynced: boolean

  @Prop({ required: true })
  account: Account

  @Prop({ required: true })
  item: UserCreationRequest

  loading: boolean = false
  showPassword: boolean = false

  passwordRules = [
    (v:string) => !!v || 'Password is required',
    (v:string) => (v.length >= 6 && v.length <= 128) || 'Name must be at least 6 characters, up to 128'
  ]

  async save () {
    this.loading = true
    try {
      await (new AccountsApi()).addUser(this.account, this.item)
    } catch (e) {
      console.error('Une erreur est survenue')
    }
    this.openSynced = false
    this.$emit('done')
    this.loading = false
  }
}
</script>
