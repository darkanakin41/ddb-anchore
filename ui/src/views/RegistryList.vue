<template>
  <div id="subscription-list">
    <page-card :body-padding="false">
      <template v-slot:title>
        Registries
      </template>
      <template v-slot:toolbar-actions>
        <div class="filters">
          <v-text-field placeholder="Rechercher ..."
                        v-model="registryFilter.search"
                        hide-details/>
          <!--          <v-select v-model="registryFilter.type"-->
          <!--                    :items="subscriptionType"-->
          <!--                    clearable-->
          <!--                    hide-details-->
          <!--                    item-text="label"-->
          <!--                    item-value="code"-->
          <!--                    label="Type"/>-->
          <v-btn icon @click="loadItems">
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
          <v-btn icon @click="openCreationDialog()">
            <v-icon>mdi-plus-circle-outline</v-icon>
          </v-btn>
        </div>
      </template>
      <v-data-table
          :headers="headers"
          :items="itemsFiltered"
          :loading="loading"
          :options.sync="options"
          :footer-props="footerProps"
          class="elevation-1"
      >
        <template v-slot:item.registry_verify="{ value }">
          <v-chip color="green" v-if="value">
            Oui
          </v-chip>
          <v-chip color="red" v-else>
            Non
          </v-chip>
        </template>
        <template v-slot:item.created_at="{ value }">
          {{ formatDate(value) }}
        </template>
        <template v-slot:item.last_updated="{ value }">
          {{ formatDate(value) }}
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon @click="openItemDeleteDialog(item)">
            <v-icon>mdi-delete-outline</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </page-card>
    <registry-creation :open.sync="creationDialog" :item="item" @done="loadItems"/>
    <validation-dialog v-model="itemDeleteDialog" @confirmed="confirmDeleteItem()">
      <template v-slot:title>
        Supprimer
      </template>
      Attention, vous êtes sur le point de supprimer la registry <b>{{ (item || { registry: '' }).registry }}</b>
      <br/>
      Cette action est définitive. Êtes-vous sûre de vouloir réaliser cette action ?
    </validation-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { client } from '@/service/axios'
import { DataOptions, DataTableHeader } from 'vuetify'
import config from '@/config'
import { formatDateTimeShort } from '@/utils/date'
import PageCard from '@/components/Layout/PageCard.vue'
import ValidationDialog from '@/components/Dialog/ValidationDialog.vue'
import RegistryConfiguration from '@/model/RegistryConfiguration'
import RegistryCreation from '@/components/Dialog/RegistryCreation.vue'
import RegistryConfigurationRequest from '@/model/Request/RegistryConfigurationRequest'

@Component({
  components: { RegistryCreation, ValidationDialog, PageCard }
})
export default class RegistryList extends Vue {
  items: RegistryConfiguration[] = []
  loading: boolean = false

  creationDialog: boolean = false
  itemDeleteDialog: boolean = false
  item: RegistryConfigurationRequest | RegistryConfiguration = this.getNewItem()

  async mounted (): Promise<void> {
    await this.loadItems()
  }

  async loadItems (): Promise<void> {
    this.loading = true
    const res = await client.get('registries')
    this.items = res.data
    this.loading = false
  }

  getNewItem (): RegistryConfigurationRequest {
    return {
      registry: '',
      registry_name: '',
      registry_pass: '',
      registry_type: 'docker_v2',
      registry_user: '',
      registry_verify: true
    }
  }

  get headers (): DataTableHeader[] {
    return [
      { text: 'Nom', value: 'registry_name' },
      { text: 'Type', value: 'registry_type' },
      { text: 'Host', value: 'registry' },
      { text: 'SSL/TLS Verification', value: 'registry_verify' },
      { text: 'Créé le', value: 'created_at' },
      { text: 'Mis à jour le', value: 'last_updated' },
      { text: 'Actions', value: 'actions' }
    ]
  }

  formatDate = formatDateTimeShort

  options: DataOptions = {
    page: 1,
    itemsPerPage: config.app.itemsPerPageTableOptions[0],
    sortBy: ['registry_name'],
    sortDesc: [false],
    groupBy: [],
    groupDesc: [],
    multiSort: false,
    mustSort: false
  }

  footerProps = {
    itemsPerPageOptions: config.app.itemsPerPageTableOptions
  }

  registryFilter = {
    type: null,
    search: ''
  }

  get itemsFiltered (): RegistryConfiguration[] {
    if (!this.items) {
      return []
    }
    return this.items.filter((item: RegistryConfiguration) => {
      // if (this.registryFilter.type && item.subscription_type !== this.registryFilter.type) {
      //   return false
      // }
      return !(this.registryFilter.search.trim().length > 0 && item.registry_name.toLowerCase().indexOf(this.registryFilter.search.trim().toLowerCase()) === -1)
    })
  }

  openCreationDialog () {
    this.item = this.getNewItem()
    this.creationDialog = true
  }

  openItemDeleteDialog (item: RegistryConfiguration): void {
    this.item = item
    this.itemDeleteDialog = true
  }

  async confirmDeleteItem (): Promise<void> {
    if (!this.item) {
      return
    }
    try {
      this.loading = true
      await client.delete(`registries/${this.item.registry}`)
    } catch (e) {
    }

    await this.loadItems()
    this.loading = false
    this.itemDeleteDialog = false
  }
}
</script>