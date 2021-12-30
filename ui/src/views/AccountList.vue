<template>
  <div id="image-list">
    <page-card :body-padding="false">
      <template v-slot:title>
        Comptes
      </template>
      <template v-slot:toolbar-actions>
        <div class="filters">
          <v-text-field placeholder="Rechercher ..."
                        v-model="accountFilter.search"
                        hide-details/>
          <v-select v-model="accountFilter.state"
                    :items="accountState"
                    clearable
                    hide-details
                    item-text="label"
                    item-value="code"
                    label="Status"/>
          <v-select v-model="accountFilter.type"
                    :items="accountType"
                    clearable
                    hide-details
                    item-text="label"
                    item-value="code"
                    label="Type"/>
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
          class="elevation-1 clickable"
          @click:row="goToDetail($event)">
        <template v-slot:item.state="{ item, value }">
          <v-chip :color="getAccountStateChipColor(value)" @click="updateState(item)">
            {{ getAccountStateLabel(value) }}
          </v-chip>
        </template>
        <template v-slot:item.type="{ value }">
          {{ getAccountTypeLabel(value) }}
        </template>
        <template v-slot:item.created_at="{ value }">
          {{ formatDate(value) }}
        </template>
        <template v-slot:item.last_updated="{ value }">
          {{ formatDate(value) }}
        </template>
      </v-data-table>
      <account-creation-dialog :open.sync="creationDialog" :item="item" @done="loadItems"/>
    </page-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { DataOptions } from 'vuetify'
import config from '@/config'
import { ACCOUNT_STATE, ACCOUNT_TYPE, getNomenclatureLabel } from '@/nomenclature'
import { formatDateTimeShort } from '@/utils/date'
import PageCard from '@/components/Layout/PageCard.vue'
import Account from '@/model/Account'
import AccountCreationDialog from '@/components/Dialog/AccountCreationDialog.vue'
import AccountCreationRequest from '@/model/Request/AccountCreationRequest'
import AccountsApi from '@/service/api/AccountsApi'

@Component({
  components: { AccountCreationDialog, PageCard }
})
export default class AccountList extends Vue {
  items: Account[] = []
  loading: boolean = false

  async mounted () {
    await this.loadItems()
  }

  async loadItems () {
    this.loading = true
    this.items = await (new AccountsApi()).getAll()
    this.loading = false
  }

  get headers () {
    return [
      { text: 'Nom', value: 'name' },
      { text: 'E-mail', value: 'email' },
      { text: 'Etat', value: 'state' },
      { text: 'Créé le', value: 'created_at' },
      { text: 'Mis à jour le', value: 'last_updated' },
      { text: 'Type', value: 'type' }
    ]
  }

  getAccountStateLabel (value: string) {
    return getNomenclatureLabel(ACCOUNT_STATE, value)
  }

  getAccountTypeLabel (value: string) {
    return getNomenclatureLabel(ACCOUNT_TYPE, value)
  }

  formatDate = formatDateTimeShort

  options: DataOptions = {
    page: 1,
    itemsPerPage: config.app.itemsPerPageTableOptions[0],
    sortBy: ['name'],
    sortDesc: [false],
    groupBy: [],
    groupDesc: [],
    multiSort: false,
    mustSort: false
  }

  footerProps = {
    itemsPerPageOptions: config.app.itemsPerPageTableOptions
  }

  async goToDetail (item: Account) {
    if (item.name) {
      await this.$router.push({ name: 'account-view', params: { name: item.name } })
    }
  }

  getAccountStateChipColor (state: string): string {
    switch (state) {
      case 'enabled':
        return 'green'
      default:
      case 'disabled':
        return 'orange'
      case 'deleting':
        return 'red'
    }
  }

  async updateState (item: Account) {
    await (new AccountsApi()).updateState(item)
  }

  accountState = ACCOUNT_STATE
  accountType = ACCOUNT_TYPE

  accountFilter = {
    search: '',
    state: '',
    type: ''
  }

  get itemsFiltered () {
    if (!this.items) {
      return []
    }
    return this.items.filter((item: Account) => {
      if (this.accountFilter.state && item.state !== this.accountFilter.state) {
        return false
      }
      if (this.accountFilter.type && item.state !== this.accountFilter.type) {
        return false
      }
      return !(this.accountFilter.search.trim().length > 0 && item.name.toLowerCase().indexOf(this.accountFilter.search.trim().toLowerCase()) === -1 && item.email.toLowerCase().indexOf(this.accountFilter.search.trim().toLowerCase()) === -1
      )
    })
  }

  // Actions
  item: AccountCreationRequest = this.getNewItem()
  creationDialog: boolean = false

  getNewItem (): AccountCreationRequest {
    return {
      email: '',
      name: ''
    }
  }

  openCreationDialog () {
    this.item = this.getNewItem()
    this.creationDialog = true
  }
}
</script>