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
              <v-btn icon @click="deleteImage" v-if="">
                <v-icon>mdi-delete-outline</v-icon>
              </v-btn>
              <v-btn icon @click="exportPdf">
                <v-icon>mdi-file-pdf-outline</v-icon>
              </v-btn>
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
                      <td class="font-weight-bold">
                        {{ item.image_detail[0].registry }}/
                        {{ item.image_detail[0].repo }}:{{ item.image_detail[0].tag }}
                      </td>
                      <td>Status</td>
                      <td class="font-weight-bold">{{ imageStatusLabel }}</td>
                      <td>Type</td>
                      <td class="font-weight-bold">{{ item.image_type }}</td>
                    </tr>
                    <tr>
                      <td>Créer le</td>
                      <td class="font-weight-bold">{{ formatDate(item.image_detail[0].created_at) }}</td>
                      <td>Digest</td>
                      <td class="font-weight-bold" colspan="3">{{ item.imageDigest }}</td>
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
                          multiple
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
            <v-row v-if="!vulnerabilitiesLoading">
              <v-col cols="3" class="text-center">
                <v-chip :color="getChipColor(distinctVulnerabilities.length)">{{ distinctVulnerabilities.length }}
                  Vulnerabilités Uniques
                </v-chip>
              </v-col>
              <v-col cols="3" class="text-center">
                <v-chip :color="getChipColor(vulnerabilities.length)">{{ vulnerabilities.length }} Dépendances de
                  Vulnerabilités
                </v-chip>
              </v-col>
              <v-col cols="3" class="text-center">
                <v-chip :color="getChipColor(distinctDependencies.length)">{{ distinctDependencies.length }}
                  Dépendances
                </v-chip>
              </v-col>
              <v-col cols="3" class="text-center">
                <v-chip :color="getChipColor(fixableVulnerabilities.length)">{{ fixableVulnerabilities.length }}
                  Corrigeable
                </v-chip>
              </v-col>
            </v-row>
            <v-data-table v-if="vulnerabilities"
                          :headers="vulnerabilitiesHeaders"
                          :items="vulnerabilities"
                          :loading="vulnerabilitiesLoading"
                          :options.sync="vulnerabilitiesOptions"
                          :footer-props="vulnerabilitiesFooterProps"
                          class="elevation-1"
                          multi-sort>
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
              <v-chip :color="getChipColor(fixableVulnerabilities.length)">
                {{ fixableVulnerabilities.length }}
              </v-chip>
              Correction(s) possible(s)
            </template>
            <pre v-html="fixes"/>
          </page-card>
        </v-col>
        <v-col cols="12" class="pl-0 pr-0 pt-0 pb-0 mb-2">
          <page-card v-if="!loading && item" collapsible collapsed-init>
            <template v-slot:title>
              Dockerfile
            </template>
            <pre v-html="dockerfile"/>
          </page-card>
        </v-col>
        <v-col cols="12" class="pl-0 pr-0 pt-0 pb-0 mb-2">
          <page-card v-if="!loading && item" collapsible collapsed-init :body-padding="false">
            <template v-slot:title>
              <v-progress-circular indeterminate size="32" v-if="packagesLoading"/>
              <v-chip v-else>{{ packages.length }}</v-chip>
              Packages
            </template>
            <template v-slot:toolbar-actions>
              <div class="filters">
                <v-text-field placeholder="Rechercher ..."
                              v-model="packagesFilter.search"
                              hide-details/>
                <v-btn icon @click="loadPackages">
                  <v-icon>mdi-refresh</v-icon>
                </v-btn>
              </div>
            </template>
            <v-data-table v-if="packages"
                          :headers="packagesHeaders"
                          :items="packages"
                          :loading="packagesLoading"
                          :options.sync="packagesOptions"
                          :footer-props="packagesFooterProps"
                          class="elevation-1"
                          multi-sort>
              <template v-slot:item.size="{ value }">
                {{ humanReadableSize(value) }}
              </template>
            </v-data-table>
          </page-card>
        </v-col>
      </v-row>
    </v-container>
    <vue-html2pdf v-if="item && !loading"
                  :show-layout="false"
                  :float-layout="false"
                  :enable-download="true"
                  :preview-modal="false"
                  :paginate-elements-by-height="1400"
                  :filename="item.image_detail[0].repo + ':' + item.image_detail[0].tag"
                  :pdf-quality="2"
                  :manual-pagination="false"
                  pdf-format="a4"
                  pdf-orientation="landscape"
                  pdf-content-width="99%"
                  ref="html2Pdf">
      <section slot="pdf-content">
        <page-card :body-padding="false">
          <template v-slot:title>
            <v-chip>{{ analysisStatusLabel }}</v-chip>
            {{ item.image_detail[0].repo }}
          </template>
          <v-container fluid>
            <v-row>
              <v-col cols="12">
                <v-simple-table>
                  <tbody>
                  <tr>
                    <td>Image</td>
                    <td class="font-weight-bold">
                      {{ item.image_detail[0].registry }}/{{ item.image_detail[0].repo }}:{{
                        item.image_detail[0].tag
                      }}
                    </td>
                    <td>Status</td>
                    <td class="font-weight-bold">{{ imageStatusLabel }}</td>
                    <td>Type</td>
                    <td class="font-weight-bold">{{ item.image_type }}</td>
                  </tr>
                  <tr>
                    <td>Créer le</td>
                    <td class="font-weight-bold">{{ formatDate(item.image_detail[0].created_at) }}</td>
                    <td>Digest</td>
                    <td class="font-weight-bold" colspan="3">{{ item.imageDigest }}</td>
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
        <page-card :body-padding="false">
          <template v-slot:title>
            <v-progress-circular indeterminate size="32" v-if="vulnerabilitiesLoading"/>
            <v-chip v-if="vulnerabilityResponse" :color="vulnerabilitiesChipColor">
              {{ vulnerabilityResponse.vulnerabilities.length }}
            </v-chip>
            Vulnérabilités
          </template>
          <v-row v-if="!vulnerabilitiesLoading">
            <v-col cols="3" class="text-center">
              <v-chip :color="getChipColor(distinctVulnerabilities.length)">{{ distinctVulnerabilities.length }}
                Vulnerabilités Uniques
              </v-chip>
            </v-col>
            <v-col cols="3" class="text-center">
              <v-chip :color="getChipColor(vulnerabilities.length)">{{ vulnerabilities.length }} Dépendances de
                Vulnerabilités
              </v-chip>
            </v-col>
            <v-col cols="3" class="text-center">
              <v-chip :color="getChipColor(distinctDependencies.length)">{{ distinctDependencies.length }}
                Dépendances
              </v-chip>
            </v-col>
            <v-col cols="3" class="text-center">
              <v-chip :color="getChipColor(fixableVulnerabilities.length)">{{ fixableVulnerabilities.length }}
                Corrigeable
              </v-chip>
            </v-col>
          </v-row>

          <v-data-table v-if="vulnerabilities"
                        :headers="vulnerabilitiesHeaders"
                        :items="vulnerabilities"
                        :loading="vulnerabilitiesLoading"
                        :options="{
                                page: 1,
                                itemsPerPage: vulnerabilities.length,
                                sortBy: ['severity'],
                                sortDesc: [false],
                                groupBy: [],
                                groupDesc: [],
                                multiSort: false,
                                mustSort: false
                              }"
                        :footer-props="vulnerabilitiesFooterProps"
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
        <page-card>
          <template v-slot:title>
            <v-chip :color="getChipColor(fixableVulnerabilities.length)">
              {{ fixableVulnerabilities.length }}
            </v-chip>
            Correction(s) possible(s)
          </template>
          <pre v-html="fixes"/>
        </page-card>
        <page-card>
          <template v-slot:title>
            Dockerfile
          </template>
          <pre v-html="dockerfile"/>
        </page-card>
        <page-card :body-padding="false">
          <template v-slot:title>
            <v-progress-circular indeterminate size="32" v-if="packagesLoading"/>
            <v-chip v-else>{{ packages.length }}</v-chip>
            Packages
          </template>
          <v-data-table v-if="packages"
                        :headers="packagesHeaders"
                        :items="packages"
                        :loading="packagesLoading"
                        :options="{
                                page: 1,
                                itemsPerPage: packages.length,
                                sortBy: ['package'],
                                sortDesc: [false],
                                groupBy: [],
                                groupDesc: [],
                                multiSort: false,
                                mustSort: false
                              }"
                        :footer-props="packagesFooterProps"
                        class="elevation-1"
                        multi-sort
          >
            <template v-slot:item.size="{ value }">
              {{ humanReadableSize(value) }}
            </template>
          </v-data-table>
        </page-card>
      </section>
    </vue-html2pdf>
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
import NvdData from '@/model/NvdData'
import ContentPackageResponse from '@/model/ContentPackageResponse'
import ContentPackage from '@/model/ContentPackage'
import VueHtml2pdf from 'vue-html2pdf'
import ImagesApi from '@/service/api/ImagesApi'

@Component({
  components: { PageCard, VueHtml2pdf }
})
export default class ImageDetail extends Vue {
  @Prop({ required: true })
  id: string

  item: Image | null = null
  loading: boolean = false

  autoRefreshInterval: number | null = null
  autoRefreshTimerInitial: number = 30
  autoRefreshTimerState: number = 0

  humanReadableSize (size: number): string {
    return getReadableFileSizeString(size)
  }

  exportPdf () {
    this.$refs.html2Pdf.generatePdf()
  }

  async mounted () {
    await this.loadItems()
  }

  async loadItems () {
    try {
      this.loading = true
      const res = await ImagesApi.get(this.id)
      this.item = res.data[0]
      this.loading = false
      this.autoRefreshTimerState = this.autoRefreshTimerInitial
      if (this.item && this.item.analysis_status && this.item.analysis_status !== 'analyzed' && this.item.analysis_status !== 'analysis_failed' && !this.autoRefreshInterval) {
        this.autoRefreshInterval = setInterval(() => {
          this.autoRefreshTimerState--
          if (this.autoRefreshTimerState <= 0) {
            this.loadItems()
          }
        }, 1000)
      }
    } catch (e) {
      return await this.$router.push({ name: 'image-list' })
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
    return this.humanReadableSize(this.item.image_content.metadata.image_size)
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

  @Watch('item', { deep: true })
  async loadVulnerabilities () {
    if (!this.item || this.item.analysis_status !== 'analyzed') {
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
    return this.vulnerabilityResponse.vulnerabilities.filter((item: Vulnerability) => {
      // @ts-ignore
      if (this.vulnerabilityFilter.severities.length > 0 && this.vulnerabilityFilter.severities.indexOf(item.severity) === -1) {
        return false
      }
      // @ts-ignore
      if (this.vulnerabilityFilter.feedGroup.length > 0 && this.vulnerabilityFilter.feedGroup.indexOf(item.feed_group) === -1) {
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
    return this.getChipColor(this.vulnerabilityResponse.vulnerabilities.length)
  }

  getChipColor (nb: number): string {
    if (nb > 50) {
      return 'red'
    }
    if (nb > 10) {
      return 'orange'
    }
    if (nb > 0) {
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
    feedGroup: [],
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

  vulnerabilitiesFooterProps = {
    itemsPerPageOptions: config.app.itemsPerPageTableOptions
  }

  get distinctVulnerabilities () {
    const distinctVulnerabilities: NvdData[] = []

    this.vulnerabilities.forEach((vuln: Vulnerability) => {
      vuln.nvd_data.forEach((nvd: NvdData) => {
        if (distinctVulnerabilities.filter((i: NvdData) => i.id === nvd.id).length === 0) {
          distinctVulnerabilities.push(nvd)
        }
      })
    })
    return distinctVulnerabilities
  }

  get distinctDependencies () {
    const distinctDependencies: string[] = []

    this.vulnerabilities.forEach((vuln: Vulnerability) => {
      if (distinctDependencies.filter((i: string) => i === vuln.package).length === 0) {
        distinctDependencies.push(vuln.package)
      }
    })
    return distinctDependencies
  }

  get fixableVulnerabilities () {
    return this.vulnerabilities.filter((vuln: Vulnerability) => vuln.fix !== 'None')
  }

  get fixes () {
    if (!this.item || !this.item.image_content.metadata) {
      return '#N/A'
    }
    if (this.fixableVulnerabilities.length === 0) {
      return '#N/A'
    }
    const fixes: string[] = []

    switch (this.item.image_content.metadata.distro) {
      case 'debian':
        fixes.push('RUN apt-get update', '&& apt-get install -y --no-install-recommends')
        break
      case 'alpine':
        fixes.push('RUN apk add --no-cache')
        break
    }

    this.fixableVulnerabilities.forEach((vuln: Vulnerability) => {
      const fix: string = `${vuln.package_name}=${vuln.fix}`
      if (fixes.indexOf(fix) === -1) {
        fixes.push(fix)
      }
    })

    switch (this.item.image_content.metadata.distro) {
      case 'debian':
        fixes.push('&& rm -rf /var/lib/apt/lists/*')
        break
    }

    return formatDockerfile(fixes.join(' \\\n\t'))
  }

  packagesLoading: boolean = false
  packagesResponse: ContentPackageResponse | null = null

  packagesFilter = {
    search: ''
  }

  packagesOptions: DataOptions = {
    page: 1,
    itemsPerPage: config.app.itemsPerPageTableOptions[0],
    sortBy: ['package'],
    sortDesc: [false],
    groupBy: [],
    groupDesc: [],
    multiSort: false,
    mustSort: false
  }

  packagesFooterProps = {
    itemsPerPageOptions: config.app.itemsPerPageTableOptions
  }

  @Watch('item', { deep: true })
  async loadPackages (): Promise<void> {
    if (!this.item || this.item.analysis_status !== 'analyzed') {
      this.packagesResponse = null
      return
    }
    this.packagesLoading = true
    try {
      const res = await client.get(`images/by_id/${this.id}/content/os`)
      this.packagesResponse = res.data
    } catch (e) {
      this.packagesResponse = null
    } finally {
      this.packagesLoading = false
    }
  }

  async deleteImage (): Promise<void> {
    if (!this.item) {
      return
    }

    const res = await ImagesApi.delete(this.id)
    await this.mounted()
  }

  get packages (): ContentPackage[] {
    if (!this.packagesResponse) {
      return []
    }

    return this.packagesResponse.content.filter((item: ContentPackage) => {
      return !(this.packagesFilter.search.trim().length > 0 && item.package.toLowerCase().indexOf(this.packagesFilter.search.trim().toLowerCase()) === -1)
    })
  }

  get packagesHeaders () {
    return [
      { text: 'Package', value: 'package' },
      { text: 'Version', value: 'version' },
      { text: 'Origine', value: 'origin' },
      { text: 'Type', value: 'type' },
      { text: 'Taille', value: 'size' }
    ]
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
