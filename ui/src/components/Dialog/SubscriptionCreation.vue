<template>
  <app-dialog :open.sync="openSynced">
    <template v-slot:title>Ajout d'un abonnement</template>
    <v-form @submit.prevent="save">
      <v-container fluid>
        <v-row v-for="(item, index) in items" v-bind:key="index">
          <v-col cols="7">
            <v-text-field v-model="item.key"
                          label="Dépôt/Image/..."
                          :disabled="loading"/>
          </v-col>
          <v-col cols="3">
            <v-select v-model="item.type"
                      :items="SUBSCRIPTION_TYPE"
                      item-text="label"
                      item-value="code"
                      label="Type"
                      :disabled="loading"/>
          </v-col>
          <v-col cols="2">
            <div class="row-action">
              <v-btn icon
                     v-if="items.length > 1"
                     @click="removeItem(index)"
                     :disabled="loading">
                <v-icon>mdi-delete-outline</v-icon>
              </v-btn>
              <v-btn icon
                     v-if="index === (items.length - 1)"
                     @click="addItem()"
                     :disabled="loading">
                <v-icon>mdi-plus-circle-outline</v-icon>
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-container>
      <v-simple-table>
      </v-simple-table>
      <div class="text-right">
        <v-btn type="submit" :loading="loading">Ajouter</v-btn>
      </div>
    </v-form>
  </app-dialog>
</template>

<script lang="ts">
import { Component, PropSync, Vue } from 'vue-property-decorator'
import AppDialog from '@/components/App/AppDialog.vue'
import { SUBSCRIPTION_TYPE } from '@/nomenclature'
import { SubscriptionRequest } from '@/model/Request/SubscriptionRequest'
import { client } from '@/service/axios'

interface SubscriptionEntryForm {
  key: string
  type: string
}

@Component({
  components: { AppDialog }
})
export default class SubscriptionCreation extends Vue {
  @PropSync('open', { required: true, default: false })
  openSynced: boolean

  loading: boolean = false
  items: SubscriptionEntryForm[] = [{ key: '', type: 'repo_update' }]

  SUBSCRIPTION_TYPE = SUBSCRIPTION_TYPE

  mounted () {
    this.items = []
    this.addItem()
  }

  addItem () {
    this.items.push({ key: '', type: 'repo_update' })
  }

  removeItem (index: number) {
    this.items.splice(index, 1)
  }

  async save () {
    const entries: SubscriptionEntryForm[] = this.items.filter((item: SubscriptionEntryForm) => {
      return item.key.trim().length > 0
    })
    if (entries.length === 0) {
      return
    }
    this.loading = true
    for (const entry of entries) {
      const request: SubscriptionRequest = {
        subscription_key: entry.key,
        subscription_type: entry.type,
        subscription_value: null
      }
      try {
        const res = await client.post('subscriptions', request)
        const subscriptions = res.data
        if (subscriptions[0]) {
          await client.put(`subscriptions/${subscriptions[0].subscription_id}`, { active: true })
        }
      } catch (e) {
        console.error(`Une erreur est survenue sur la demande ${request.subscription_key} du type ${request.subscription_type}`)
      }
    }
    this.items = []
    this.addItem()
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
