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
              <v-chip>{{ analysisStatusLabel }}</v-chip>
              {{ item.image_detail[0].repo }}
            </template>
            <template v-slot:toolbar-actions>
              <template v-if="autoRefreshInterval">
                Rafraichissement auto dans {{ autoRefreshTimerState }}s
              </template>
              <v-btn icon @click="loadItems">
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
            </template>
            <v-container fluid>
              <v-row>
                <v-col cols="12">
                  <v-simple-table>
                    <tbody>
                    <tr>
                      <td>Image</td>
                      <td class="font-weight-bold">{{ item.image_detail[0].registry }}/{{
                          item.image_detail[0].repo
                        }}:{{ item.image_detail[0].tag }}
                      </td>
                      <td>Status</td>
                      <td class="font-weight-bold">{{ imageStatusLabel }}</td>
                      <td>Type</td>
                      <td class="font-weight-bold">{{ item.image_type }}</td>
                    </tr>
                    <tr>
                      <td>Créer le</td>
                      <td class="font-weight-bold">{{ formatDate(item.image_detail[0].created_at) }}</td>
                      <td></td>
                      <td class="font-weight-bold"></td>
                      <td></td>
                      <td class="font-weight-bold"></td>
                    </tr>
                    <tr>
                      <td>OS</td>
                      <td class="font-weight-bold">{{ baseOs }}</td>
                      <td>Taille</td>
                      <td class="font-weight-bold">{{ imageSize }}</td>
                      <td>Layers</td>
                      <td class="font-weight-bold">{{ item.image_content.metadata.layer_count }}</td>
                    </tr>
                    </tbody>
                  </v-simple-table>
                </v-col>
              </v-row>
            </v-container>
          </page-card>
        </v-col>
        <v-col cols="12" class="pl-0 pr-0 pt-0 pb-0 mb-2">
          <page-card v-if="!loading && item" :body-padding="false">
            <template v-slot:title>
              <v-progress-circular indeterminate size="32" v-if="vulnerabilitiesLoading"/>
              <v-chip v-if="vulnerabilityResponse" :color="vulnerabilitiesChipColor">
                {{ vulnerabilityResponse.vulnerabilities.length }}
              </v-chip>
              Vulnérabilités
            </template>
            <template v-slot:toolbar-actions>
              <div class="filters">
                <v-text-field placeholder="Rechercher ..."
                              v-model="vulnerabilityFilter.search"
                              hide-details/>
                <v-select v-model="vulnerabilityFilter.feedGroup"
                          :items="feedGroup"
                          clearable
                          hide-details
                          item-text="label"
                          item-value="code"
                          label="Group"
                          v-if="feedGroup.length > 1"/>
                <v-select v-model="vulnerabilityFilter.severities"
                          :items="severities"
                          clearable
                          multiple
                          hide-details
                          item-text="label"
                          item-value="code"
                          label="Sévérité"
                          v-if="severities.length > 1"/>
                <v-checkbox v-model="vulnerabilityFilter.haveFix" label="Corrigeable"></v-checkbox>
                <v-btn icon @click="loadVulnerabilities">
                  <v-icon>mdi-refresh</v-icon>
                </v-btn>
              </div>
            </template>
            <v-data-table v-if="vulnerabilities"
                          :headers="vulnerabilitiesHeaders"
                          :items="vulnerabilities"
                          :items-per-page="10"
                          :loading="vulnerabilitiesLoading"
                          :options.sync="vulnerabilitiesOptions"
                          class="elevation-1"
                          multi-sort
            >
              <template v-slot:item.severity="{ value }">
                <v-chip :color="vulnerabilitySeverityColor(value)">
                  {{ value }}
                </v-chip>
              </template>
              <template v-slot:item.vuln="{ item }">
                <a :href="item.url" target="_blank">{{ item.vuln }}</a>
              </template>
            </v-data-table>
          </page-card>
        </v-col>
        <v-col cols="12" class="pl-0 pr-0 pt-0 pb-0 mb-2">
          <page-card v-if="!loading && item" collapsible collapsed-init>
            <template v-slot:title>
              Dockerfile
            </template>
            <div v-html="dockerfile"/>
          </page-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { client } from '@/service/axios'
import Image from '@/model/Image'
import PageCard from '@/components/Layout/PageCard.vue'
import _Nomenclature, { ANALYSIS_STATUS, getNomenclatureLabel, IMAGE_STATUS } from '@/nomenclature'
import getReadableFileSizeString from '@/utils/file'
import VulnerabilityResponse from '@/model/VulnerabilityResponse'
import { DataOptions } from 'vuetify'
import config from '@/config'
import Vulnerability from '@/model/Vulnerability'
import { formatDockerfile } from '@/utils/dockerfile'
import { formatDateTimeLong } from '@/utils/date'

@Component({
  components: { PageCard }
})
export default class ImageDetail extends Vue {
  @Prop({ required: true })
  id: string

  item: Image | null = null
  loading: boolean = false

  autoRefreshInterval: number | null = null
  autoRefreshTimerInitial: number = 30
  autoRefreshTimerState: number = 0

  async mounted () {
    await this.loadItems()
  }

  async loadItems () {
    this.loading = true
    const res = await client.get(`images/by_id/${this.id}`)
    this.item = res.data[0]
    this.loading = false
    this.autoRefreshTimerState = this.autoRefreshTimerInitial
    if (this.item && this.item.analysis_status && this.item.analysis_status !== 'analyzed' && this.item.analysis_status !== 'analysis_failed' && !this.autoRefreshInterval) {
      this.autoRefreshInterval = setInterval(() => {
        this.autoRefreshTimerState--
        if(this.autoRefreshTimerState <= 0){
          this.loadItems()
        }
      }, 1000)
    }
  }

  get imageStatusLabel () {
    if (!this.item) {
      return '#N/C'
    }
    return getNomenclatureLabel(IMAGE_STATUS, this.item.image_status)
  }

  get analysisStatusLabel () {
    if (!this.item) {
      return '#N/C'
    }
    return getNomenclatureLabel(ANALYSIS_STATUS, this.item.analysis_status)
  }

  get baseOs () {
    if (!this.item || !this.item.image_content.metadata) {
      return '#N/C'
    }
    return this.item.image_content.metadata.distro + ':' + this.item.image_content.metadata.distro_version
  }

  get imageSize () {
    if (!this.item || !this.item.image_content.metadata) {
      return '#N/C'
    }
    return getReadableFileSizeString(this.item.image_content.metadata.image_size)
  }

  get dockerfile () {
    if (!this.item || !this.item.image_detail[0]) {
      return '#N/C'
    }

    const dockerfile = atob(this.item.image_detail[0].dockerfile)

    return formatDockerfile(dockerfile)
  }

  vulnerabilitiesLoading: boolean = false
  vulnerabilityResponse: VulnerabilityResponse | null = null

  @Watch('item')
  async loadVulnerabilities () {
    if (!this.item || this.item.analysis_status !== 'analysis_failed') {
      this.vulnerabilityResponse = null
      return
    }
    this.vulnerabilitiesLoading = true
    try {
      const res = await client.get(`images/by_id/${this.id}/vuln/all`)
      this.vulnerabilityResponse = res.data
    } catch (e) {
      this.vulnerabilityResponse = null
    } finally {
      this.vulnerabilitiesLoading = false
    }
  }

  get vulnerabilities (): Vulnerability[] {
    if (!this.vulnerabilityResponse) {
      return []
    }
    const items = this.vulnerabilityResponse.vulnerabilities
    return items.filter((item: Vulnerability) => {
      // @ts-ignore
      if (this.vulnerabilityFilter.severities.length > 0 && this.vulnerabilityFilter.severities.indexOf(item.severity) === -1) {
        return false
      }
      if (this.vulnerabilityFilter.feedGroup && item.feed_group !== this.vulnerabilityFilter.feedGroup) {
        return false
      }
      if (this.vulnerabilityFilter.haveFix && item.fix === 'None') {
        return false
      }
      return !(this.vulnerabilityFilter.search.trim().length > 0 && item.vuln.toLowerCase().indexOf(this.vulnerabilityFilter.search.trim().toLowerCase()) === -1 && item.package_name.toLowerCase().indexOf(this.vulnerabilityFilter.search.trim().toLowerCase()) === -1
      )
    })
  }

  get vulnerabilitiesChipColor () {
    if (!this.vulnerabilityResponse) {
      return ''
    }
    if (this.vulnerabilityResponse.vulnerabilities.length > 50) {
      return 'red'
    }
    if (this.vulnerabilityResponse.vulnerabilities.length > 10) {
      return 'orange'
    }
    if (this.vulnerabilityResponse.vulnerabilities.length > 0) {
      return 'blue'
    }
    return 'green'
  }

  get vulnerabilitiesHeaders () {
    return [
      { text: 'Severité', value: 'severity', align: 'center' },
      { text: 'Code', value: 'vuln' },
      { text: 'Feed', value: 'feed' },
      { text: 'Group', value: 'feed_group' },
      { text: 'Fix', value: 'fix' },
      { text: 'Package', value: 'package_name' },
      { text: 'Package Version', value: 'package_version' }
    ]
  }

  vulnerabilitySeverityColor (severity: string) {
    switch (severity) {
      default:
        return ''
      case 'Low':
        return 'green'
      case 'Negligible':
        return 'blue'
      case 'Medium':
        return 'orange'
      case 'High':
        return 'red'
      case 'Critical':
        return 'red accent-4'
    }
  }

  get severities (): _Nomenclature[] {
    return this.extractNomenclature('severity')
  }

  get feedGroup (): _Nomenclature[] {
    return this.extractNomenclature('feed_group')
  }

  formatDate = formatDateTimeLong

  extractNomenclature (field: string) {
    if (!this.vulnerabilityResponse) {
      return []
    }
    const nomenclature: _Nomenclature[] = []
    this.vulnerabilityResponse.vulnerabilities.forEach((v: Vulnerability) => {
      // @ts-ignore
      if (nomenclature.findIndex((s: _Nomenclature) => s.code === v[field]) === -1) {
        // @ts-ignore
        nomenclature.push({ code: v[field], label: v[field] })
      }
    })
    nomenclature.sort((s1: _Nomenclature, s2: _Nomenclature) => s1.code.localeCompare(s2.code))
    return nomenclature
  }

  vulnerabilityFilter = {
    severities: [],
    haveFix: false,
    feedGroup: null,
    search: ''
  }

  vulnerabilitiesOptions: DataOptions = {
    page: 1,
    itemsPerPage: config.app.itemsPerPageTableOptions[0],
    sortBy: ['severity'],
    sortDesc: [false],
    groupBy: [],
    groupDesc: [],
    multiSort: false,
    mustSort: false
  }
}
</script>
