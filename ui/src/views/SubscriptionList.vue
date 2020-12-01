<template>
  <div id="subscription-list">
    <page-card :body-padding="false">
      <template v-slot:title>
        Abonnements
      </template>
      <template v-slot:toolbar-actions>
        <div class="filters">
          <v-text-field placeholder="Rechercher ..."
                        v-model="subscriptionFilter.search"
                        hide-details/>
          <v-select v-model="subscriptionFilter.type"
                    :items="subscriptionType"
                    clearable
                    hide-details
                    item-text="label"
                    item-value="code"
                    label="Type"/>
          <v-checkbox v-model="subscriptionFilter.active" label="Actif"></v-checkbox>
          <v-btn icon @click="loadItems">
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
          <v-btn icon @click="creationDialog=true">
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
        <template v-slot:item.active="{ item, value }">
          <v-chip color="green" v-if="value" @click="updateActive(item)">
            Oui
          </v-chip>
          <v-chip color="red" v-else @click="updateActive(item)">
            Non
          </v-chip>
        </template>
        <template v-slot:item.subscription_type="{ value }">
          {{ getSubscriptionTypeLabel(value) }}
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
    <subscription-creation :open.sync="creationDialog" @done="loadItems"/>
    <validation-dialog v-model="itemDeleteDialog" @confirmed="confirmDeleteItem()">
      <template v-slot:title>
        Supprimer
      </template>
      Attention, vous êtes sur le point de supprimer le client <b>{{ (item || { name: '' }).name }}</b>
      <br/>
      Cette action est définitive. Êtes-vous sûre de vouloir réaliser cette action ?
    </validation-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { client } from '@/service/axios'
import Image from '@/model/Image'
import { DataOptions } from 'vuetify'
import config from '@/config'
import _Nomenclature, { ANALYSIS_STATUS, getNomenclatureLabel, IMAGE_STATUS, SUBSCRIPTION_TYPE } from '@/nomenclature'
import getReadableFileSizeString from '@/utils/file'
import { formatDateTimeShort } from '@/utils/date'
import PageCard from '@/components/Layout/PageCard.vue'
import Subscription from '@/model/Subscription'
import SubscriptionCreation from '@/components/Dialog/SubscriptionCreation.vue'
import ValidationDialog from '@/components/Dialog/ValidationDialog.vue'

@Component({
  components: { ValidationDialog, SubscriptionCreation, PageCard }
})
export default class SubscriptionList extends Vue {
  items: Subscription[] = []
  loading: boolean = false

  creationDialog: boolean = false

  item: Subscription | null = null
  itemDeleteDialog: boolean = false

  async mounted () {
    await this.loadItems()
  }

  async loadItems () {
    this.loading = true
    const res = await client.get('subscriptions')
    this.items = res.data
    this.loading = false
  }

  get headers () {
    return [
      { text: 'Image', value: 'subscription_key' },
      { text: 'Type', value: 'subscription_type' },
      { text: 'Créé le', value: 'created_at' },
      { text: 'Mis à jour le', value: 'last_updated' },
      { text: 'Actif', value: 'active' },
      { text: 'Actions', value: 'actions' }
    ]
  }

  getSubscriptionTypeLabel (value: string) {
    return getNomenclatureLabel(SUBSCRIPTION_TYPE, value)
  }

  formatDate = formatDateTimeShort

  options: DataOptions = {
    page: 1,
    itemsPerPage: config.app.itemsPerPageTableOptions[0],
    sortBy: ['subscription_key'],
    sortDesc: [false],
    groupBy: [],
    groupDesc: [],
    multiSort: false,
    mustSort: false
  }

  footerProps = {
    itemsPerPageOptions: config.app.itemsPerPageTableOptions
  }

  subscriptionFilter = {
    type: null,
    active: false,
    search: ''
  }

  subscriptionType = SUBSCRIPTION_TYPE

  get itemsFiltered () {
    if (!this.items) {
      return []
    }
    return this.items.filter((item: Subscription) => {
      if (this.subscriptionFilter.type && item.subscription_type !== this.subscriptionFilter.type) {
        return false
      }
      if (this.subscriptionFilter.active && !item.active) {
        return false
      }
      return !(this.subscriptionFilter.search.trim().length > 0 && item.subscription_key.toLowerCase().indexOf(this.subscriptionFilter.search.trim().toLowerCase()) === -1)
    })
  }

  async updateActive (item: Subscription) {
    item.active = !item.active
    try {
      await client.put(`subscriptions/${item.subscription_id}`, { active: item.active })
    } catch (e) {
      item.active = !item.active
    }
  }

  openItemDeleteDialog (item: Subscription) {
    this.item = item
    this.itemDeleteDialog = true
  }

  async confirmDeleteItem () {
    if (!this.item) {
      return
    }
    try {
      this.loading = true
      await client.delete(`subscriptions/${this.item.subscription_id}`)
    } catch (e) {
    }

    await this.loadItems()
    this.loading = false
    this.itemDeleteDialog = false
  }
}
</script>