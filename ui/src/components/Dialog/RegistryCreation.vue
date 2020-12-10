<template>
  <app-dialog :open.sync="openSynced">
    <template v-slot:title>Ajout d'une registry</template>
    <v-form @submit.prevent="save">
      <v-container fluid>
        <v-row>
          <v-col cols="12">
            <v-text-field v-model="item.registry_name"
                          label="Nom de la registry"
                          :disabled="loading"/>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-text-field v-model="item.registry"
                          label="Adresse de la registry"
                          :disabled="loading"/>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6">
            <v-text-field v-model="item.registry_user"
                          label="Utilisateur"
                          hint="L'utilisateur doit avoir accès en lecture"
                          :disabled="loading"/>
          </v-col>
          <v-col cols="6">
            <v-text-field v-model="item.registry_pass"
                          label="Mot de passe"
                          :disabled="loading"
                          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                          @click:append="showPassword = !showPassword"
                          :type="showPassword ? 'text' : 'password'"/>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-switch v-model="item.registry_verify"
                      label="Validation SSL/TLS"
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
import { client } from '@/service/axios'
import RegistryConfigurationRequest from '@/model/Request/RegistryConfigurationRequest'

@Component({
  components: { AppDialog }
})
export default class RegistryCreation extends Vue {
  @PropSync('open', { required: true, default: false })
  openSynced: boolean

  @Prop({ required: true })
  item: RegistryConfigurationRequest

  loading: boolean = false
  showPassword: boolean = false

  async save () {
    this.loading = true
    try {
      await client.post('registries', this.item)
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
