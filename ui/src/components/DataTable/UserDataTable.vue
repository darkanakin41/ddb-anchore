<template>
  <page-card :body-padding="false">
    <template v-slot:title>
      <v-progress-circular indeterminate size="32" v-if="loading"/>
      Utilisateurs
    </template>
    <template v-slot:toolbar-actions>
      <div class="filters">
        <v-btn icon @click="loadItems">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
        <v-btn icon @click="openCreationDialog()">
          <v-icon>mdi-plus-circle-outline</v-icon>
        </v-btn>
      </div>
    </template>
    <v-data-table v-if="items"
                  :headers="headers"
                  :items="items"
                  :loading="loading"
                  :options.sync="options"
                  :footer-props="footerProps"
                  class="elevation-1"
                  multi-sort>
      <template v-slot:item.type="{ value }">
        {{ getTypeLabel(value) }}
      </template>
      <template v-slot:item.created_at="{ value }">
        {{ formatDate(value) }}
      </template>
      <template v-slot:item.last_updated="{ value }">
        {{ formatDate(value) }}
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn icon @click="openDeleteDialog(item)">
          <v-icon>mdi-delete-outline</v-icon>
        </v-btn>
      </template>
    </v-data-table>
    <user-creation-dialog :account="account" :item="item" :open.sync="creationDialog" @done="loadItems"/>
    <validation-dialog v-model="deleteDialog" @confirmed="confirmDelete()" v-if="item">
      <template v-slot:title>
        Supprimer
      </template>
      Attention, vous êtes sur le point de supprimer l'identifiant <b>{{ (item || { registry: '' }).registry }}</b>
      <br/>
      Cette action est définitive. Êtes-vous sûre de vouloir réaliser cette action ?
    </validation-dialog>
  </page-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import PageCard from '@/components/Layout/PageCard.vue'
import User from '@/model/User'
import { DataOptions, DataTableHeader } from 'vuetify'
import config from '@/config'
import { getNomenclatureLabel, USER_TYPE } from '@/nomenclature'
import { formatDateTimeShort } from '@/utils/date'
import UserCreationDialog from '@/components/Dialog/UserCreationDialog.vue'
import UserCreationRequest from '@/model/Request/UserCreationRequest'
import ValidationDialog from '@/components/Dialog/ValidationDialog.vue'
import AccountsApi from '@/service/api/AccountsApi'

@Component({
  components: { ValidationDialog, UserCreationDialog, PageCard }
})
export default class UserDataTable extends Vue {
  @Prop({ required: true })
  account: Account

  loading: boolean = false
  items: User[] | null = null

  // Table configuration

  headers: DataTableHeader[] = [
    { text: 'Identifiant', value: 'username' },
    { text: 'Type', value: 'type' },
    { text: 'Source', value: 'source' },
    { text: 'Créé le', value: 'created_at' },
    { text: 'Mis à jour le', value: 'last_updated' },
    { text: 'Actions', value: 'actions' }
  ]

  options: DataOptions = {
    page: 1,
    itemsPerPage: config.app.itemsPerPageTableOptions[0],
    sortBy: ['username'],
    sortDesc: [false],
    groupBy: [],
    groupDesc: [],
    multiSort: false,
    mustSort: false
  }

  footerProps = {
    itemsPerPageOptions: config.app.itemsPerPageTableOptions
  }

  async mounted () {
    await this.loadItems()
  }

  async loadItems () {
    this.loading = true
    const res = await AccountsApi.getUsers(this.account)
    this.items = res.data
    this.loading = false
  }

  // Render functions

  formatDate = formatDateTimeShort

  getTypeLabel (value: string) {
    return getNomenclatureLabel(USER_TYPE, value)
  }

  // Actions

  item: UserCreationRequest = this.getNewItem()
  creationDialog: boolean = false
  deleteDialog: boolean = false

  getNewItem (): UserCreationRequest {
    return {
      username: '',
      password: ''
    }
  }

  openCreationDialog () {
    this.item = this.getNewItem()
    this.creationDialog = true
  }

  openDeleteDialog (item: User): void {
    this.item = item
    this.deleteDialog = true
  }

  async confirmDelete (): Promise<void> {
    if (!this.item) {
      return
    }
    try {
      this.loading = true
      await AccountsApi.deleteUser(this.account, this.item)
    } catch (e) {
    }

    await this.loadItems()
    this.loading = false
    this.deleteDialog = false
  }

}
</script>
