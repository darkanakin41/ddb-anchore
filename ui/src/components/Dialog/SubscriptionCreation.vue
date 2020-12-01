<template>
  <app-dialog :open.sync="openSynced">
    <template v-slot:title>Ajout d'un abonnement</template>
    <v-form @submit.prevent="save">
      <v-textarea v-model="textarea"
                  label="Liste des abonnements"
                  :disabled="loading"
      />
      <div class="text-right">
        <v-btn type="submit" :loading="loading">Ajouter</v-btn>
      </div>
    </v-form>
  </app-dialog>
</template>

<script lang="ts">
import { Component, PropSync, Vue } from 'vue-property-decorator'
import AppDialog from '@/components/App/AppDialog.vue'
import { SubscriptionRequest } from '@/model/Request/SubscriptionRequest'
import { client } from '@/service/axios'

@Component({
  components: { AppDialog }
})
export default class SubscriptionCreation extends Vue {
  @PropSync('open', { required: true, default: false })
  openSynced: boolean

  loading: boolean = false
  textarea: string = ''

  async save () {
    if (this.textarea.trim().length === 0) {
      return
    }
    this.loading = true
    let keys: string = this.textarea.split('\n')
    if (keys.length === 0) {
      return
    }
    keys = keys.filter((value: string, index: number) => {
      return keys.indexOf(value) === index
    })
    const requests: SubscriptionRequest[] = []
    keys.forEach((key: string) => {
      requests.push({
        subscription_key: key,
        subscription_type: 'repo_update',
        subscription_value: null
      })
    })
    for (const request: SubscriptionRequest of requests) {
      try {
        // @ts-ignore
        const res = await client.post('subscriptions', request)
        const subscriptions = res.data
        if (subscriptions[0]) {
          await client.put(`subscriptions/${subscriptions[0].subscription_id}`, { active: true })
        }
      } catch (e: DOMException) {
        console.error(`Une erreur est survenue sur la demande ${request.subscription_key} du type ${request.subscription_type}`)
        console.log(e)
      }
    }
    this.openSynced = false
    this.$emit('done')
    this.loading = false
  }
}
</script>
