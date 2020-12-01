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
          :items-per-page="10"
          :loading="loading"
          :options.sync="options"
          class="elevation-1"
      >
        <template v-slot:item.active="{ value }">
          <v-chip color="green" v-if="value">
            Oui
          </v-chip>
          <v-chip color="red" v-else>
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
      </v-data-table>
    </page-card>
    <subscription-creation :open.sync="creationDialog" @done="loadItems"/>
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

@Component({
  components: { SubscriptionCreation, PageCard }
})
export default class SubscriptionList extends Vue {
  items: Subscription[] = []
  loading: boolean = false

  creationDialog: boolean = false

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
      { text: 'Actif', value: 'active' }
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
}
</script>