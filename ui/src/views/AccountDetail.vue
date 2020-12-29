<template>
  <div id="image-detail">
    <v-overlay value="true" v-if="loading" absolute>
      <v-progress-circular indeterminate size="128"></v-progress-circular>
    </v-overlay>

    <v-container fluid>
      <v-row>
        <v-col cols="12" class="pl-0 pr-0 pt-0 pb-0 mb-2">
          <page-card v-if="!loading && item" :body-padding="false">
            <template v-slot:title>
              <v-chip :color="accountStateChipColor" @click="updateState()">
                {{ accountStateLabel }}
              </v-chip>
              {{ item.name }}
              <small>{{ item.email }}</small>
            </template>
          </page-card>
        </v-col>
        <v-col cols="12" class="pl-0 pr-0 pt-0 pb-0 mb-2">
          <user-data-table :account="item" v-if="!loading && item"/>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import Account from '@/model/Account'
import PageCard from '@/components/Layout/PageCard.vue'
import { ACCOUNT_STATE, getNomenclatureLabel } from '@/nomenclature'
import UserDataTable from '@/components/DataTable/UserDataTable.vue'
import AccountsApi from '@/service/api/AccountsApi'

@Component({
  components: { UserDataTable, PageCard }
})
export default class ImageDetail extends Vue {
  @Prop({ required: true })
  name: string

  item: Account | null = null
  loading: boolean = false

  async mounted () {
    await this.loadItems()
  }

  async loadItems () {
    this.loading = true
    this.item = (await AccountsApi.get(this.name)).data
    this.loading = false
  }

  get accountStateLabel () {
    if (!this.item) {
      return '#N/C'
    }
    return getNomenclatureLabel(ACCOUNT_STATE, this.item.state)
  }

  get accountStateChipColor (): string {
    if (!this.item) {
      return 'primary'
    }
    switch (this.item.state) {
      case 'enabled':
        return 'green'
      default:
      case 'disabled':
        return 'orange'
      case 'deleting':
        return 'red'
    }
  }

  async updateState () {
    if(this.item){
      await AccountsApi.updateState(this.item)
    }
  }

}
</script>

<style lang="scss" scoped>
pre {
  white-space: normal;
}

.vue-html2pdf::v-deep {
  display: none;
}
</style>
