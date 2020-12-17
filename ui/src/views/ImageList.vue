<template>
  <div id="image-list">
    <page-card :body-padding="false">
      <template v-slot:title>
        Images
      </template>
      <template v-slot:toolbar-actions>
        <div class="filters">
          <v-text-field placeholder="Rechercher ..."
                        v-model="imageFilter.search"
                        hide-details/>
          <v-select v-model="imageFilter.registry"
                    :items="registries"
                    clearable
                    hide-details
                    item-text="label"
                    item-value="code"
                    label="Registry"
                    v-if="registries.length > 1"/>
          <v-select v-model="imageFilter.status"
                    :items="imageStatus"
                    clearable
                    hide-details
                    item-text="label"
                    item-value="code"
                    label="Status"
                    v-if="imageStatus.length > 1"/>
          <v-select v-model="imageFilter.analysis"
                    :items="analysisStatus"
                    clearable
                    hide-details
                    item-text="label"
                    item-value="code"
                    label="Analyse"
                    v-if="analysisStatus.length > 1"/>
          <v-btn icon @click="loadItems">
            <v-icon>mdi-refresh</v-icon>
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
          @click:row="goToDetail($event)"
      >
        <template v-slot:item.image_status="{ value }">
          {{ getImageStatusLabel(value) }}
        </template>
        <template v-slot:item.analysis_status="{ value }">
          {{ getAnalysisStatusLabel(value) }}
        </template>
        <template v-slot:item.base_os="{ item }">
          {{ getBaseOs(item) }}
        </template>
        <template v-slot:item.image_content.metadata.image_size="{ value }">
          {{ getImageSize(value) }}
        </template>
        <template v-slot:item.image_detail[0].created_at="{ value }">
          {{ formatDate(value) }}
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon :to="{name: 'image-detail', params: { id: item.image_detail[0].imageId }}">
            <v-icon>mdi-magnifier</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </page-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { client } from '@/service/axios'
import Image from '@/model/Image'
import { DataOptions } from 'vuetify'
import config from '@/config'
import _Nomenclature, { ANALYSIS_STATUS, getNomenclatureLabel, IMAGE_STATUS } from '@/nomenclature'
import getReadableFileSizeString from '@/utils/file'
import { formatDateTimeShort } from '@/utils/date'
import PageCard from '@/components/Layout/PageCard.vue'

@Component({
  components: { PageCard }
})
export default class ImageList extends Vue {
  items: Image[] = []
  loading: boolean = false

  async mounted () {
    await this.loadItems()
  }

  async loadItems () {
    this.loading = true
    const res = await client.get('images')
    this.items = res.data
    this.loading = false
  }

  get headers () {
    return [
      { text: 'Registry', value: 'image_detail[0].registry' },
      { text: 'Image', value: 'image_detail[0].repo' },
      { text: 'Tag', value: 'image_detail[0].tag' },
      { text: 'Créé le', value: 'image_detail[0].created_at' },
      { text: 'Status', value: 'image_status' },
      { text: 'Type', value: 'image_type' },
      { text: 'Analyse', value: 'analysis_status' },
      { text: 'OS', value: 'base_os', sortable: false, align: 'center' },
      { text: 'Taille', value: 'image_content.metadata.image_size', align: 'right' },
      { text: 'Layers', value: 'image_content.metadata.layer_count', align: 'right' }
    ]
  }

  getImageStatusLabel (value: string) {
    return getNomenclatureLabel(IMAGE_STATUS, value)
  }

  getAnalysisStatusLabel (value: string) {
    return getNomenclatureLabel(ANALYSIS_STATUS, value)
  }

  getBaseOs (item: Image) {
    if (!item.image_content.metadata) {
      return '#N/A'
    }
    return item.image_content.metadata.distro + ':' + item.image_content.metadata.distro_version
  }

  getImageSize (value: number) {
    return getReadableFileSizeString(value)
  }

  formatDate = formatDateTimeShort

  options: DataOptions = {
    page: 1,
    itemsPerPage: config.app.itemsPerPageTableOptions[0],
    sortBy: ['image_detail[0].created_at'],
    sortDesc: [true],
    groupBy: [],
    groupDesc: [],
    multiSort: false,
    mustSort: false
  }

  footerProps = {
    itemsPerPageOptions: config.app.itemsPerPageTableOptions
  }

  async goToDetail (item: Image) {
    if (item.image_detail[0] && item.image_detail[0].imageId) {
      await this.$router.push({ name: 'image-view', params: { id: item.image_detail[0].imageId } })
    }
  }

  analysisStatus = ANALYSIS_STATUS
  imageStatus = IMAGE_STATUS

  imageFilter = {
    registry: null,
    status: null,
    analysis: null,
    search: ''
  }

  get registries (): _Nomenclature[] {
    if (!this.items) {
      return []
    }
    const nomenclature: _Nomenclature[] = []
    this.items.forEach((i: Image) => {
      // @ts-ignore
      if (nomenclature.findIndex((s: _Nomenclature) => s.code === i.image_detail[0].registry) === -1) {
        // @ts-ignore
        nomenclature.push({ code: i.image_detail[0].registry, label: i.image_detail[0].registry })
      }
    })
    nomenclature.sort((s1: _Nomenclature, s2: _Nomenclature) => s1.code.localeCompare(s2.code))
    return nomenclature
  }

  get itemsFiltered () {
    if (!this.items) {
      return []
    }
    return this.items.filter((item: Image) => {
      if (this.imageFilter.registry && item.image_detail[0].registry !== this.imageFilter.registry) {
        return false
      }
      if (this.imageFilter.analysis && item.analysis_status !== this.imageFilter.analysis) {
        return false
      }
      return !(this.imageFilter.search.trim().length > 0 && item.image_detail[0].repo.toLowerCase().indexOf(this.imageFilter.search.trim().toLowerCase()) === -1 && item.image_detail[0].tag.toLowerCase().indexOf(this.imageFilter.search.trim().toLowerCase()) === -1
      )
    })
  }
}
</script>