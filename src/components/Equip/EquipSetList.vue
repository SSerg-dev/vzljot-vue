<template>
  <div class="component-detail">
    <tool-bar
      :exportTypes="
        viewType === 'table' ? ['csv', 'xls', 'xlsx'] : ['jpeg', 'png', 'svg']
      "
      @export="exportData"
    >
      <label
        >с:
        <date-picker
          v-model="periodStart"
          :format="dateFormat"
          style="width: 150px"
        />
      </label>
      <label
        >по:
        <date-picker
          v-model="periodEnd"
          :format="dateFormat"
          style="width: 150px"
        />
      </label>
      <label
        >Данные:
        <select
          v-bind:value="pollType"
          @change="onPollTypeChange($event.target.value)"
        >
          <option
            v-if="hasEquipEvents"
            :value="parseInt($store.getters.pollDataTypes.equipEvents)"
          >
            {{
              $store.state.env.pollDataTypes[
                $store.getters.pollDataTypes.equipEvents
              ].text
            }}
          </option>
          <option :value="parseInt($store.getters.pollDataTypes.setParams)">
            {{
              $store.state.env.pollDataTypes[
                $store.getters.pollDataTypes.setParams
              ].text
            }}
          </option>
          <option
            :value="parseInt($store.getters.pollDataTypes.equipCustomizing)"
          >
            {{
              $store.state.env.pollDataTypes[
                $store.getters.pollDataTypes.equipCustomizing
              ].text
            }}
          </option>
          <option
            v-if="hasSetDataColdWater"
            :value="parseInt($store.getters.pollDataTypes.setDataColdWater)"
          >
            {{
              $store.state.env.pollDataTypes[
                $store.getters.pollDataTypes.setDataColdWater
              ].text
            }}
          </option>
          <option
            v-if="hasColdWater"
            :value="parseInt($store.getters.pollDataTypes.coldWater)"
          >
            {{
              $store.state.env.pollDataTypes[
                $store.getters.pollDataTypes.coldWater
              ].text
            }}
          </option>
          <option
            v-if="hasTimeSync"
            :value="parseInt($store.getters.pollDataTypes.timeSync)"
          >
            {{
              $store.state.env.pollDataTypes[
                $store.getters.pollDataTypes.timeSync
              ].text
            }}
          </option>
        </select>
      </label>
      <label
        >Представление:
        <select v-model="viewType">
          <option :value="'table'">Таблица</option>
          <option v-if="allowChart()" :value="'chart'">График</option>
        </select>
      </label>
      <template v-slot:end>
        <div
          :class="[
            'button',
            'fas',
            'fa-cog',
            {
              disabled:
                measures.length === 0 ||
                !measures.some((r) => r.items.length > 1),
            },
          ]"
          title="Настройки"
          @click="onSettingsClick"
        />
      </template>
    </tool-bar>
    <template v-if="viewType === 'table'">
      <div
        class="table-grid"
        :style="`grid-template-columns: repeat(${columns.length}, max-content)`"
      >
        <div class="table-row">
          <header
            v-for="(r, i) in columns"
            :key="i"
            :class="[
              'header',
              'right',
              { 'sticky-first': i === 0 },
              { active: i === sortIndex },
            ]"
            :title="r.title"
          >
            <template v-if="r.hasOwnProperty('sort')">
              <span style="flex: 1">{{ r.text }}</span>
              <span
                :title="sortTitle[r.sort]"
                :class="['arrow', 'fas', sortAccordance[r.sort]]"
                @click="onSort(r.sort === 'desc' ? 'asc' : 'desc', i)"
              ></span>
            </template>
            <template v-else>
              {{ r.text }}
            </template>
          </header>
        </div>
        <div
          class="table-row"
          v-for="(row, rowIndex) in localItems"
          :key="rowIndex"
        >
          <span
            :class="[
              'cell',
              'right',
              { hint: hasHint(r) },
              { 'sticky-first': i === 0 },
            ]"
            v-for="(r, i) in row"
            :key="(rowIndex + 1) * (i + 1)"
            :title="getCellTitle(r)"
            >{{ getCellValue(r, columns[i] ? columns[i].type : null) }}</span
          >
        </div>
      </div>
      <pager-component v-bind="pageInfo" @go="onChangePage" />
    </template>
    <chart-line v-else ref="chart" v-bind="{ charts }" />
    <transition>
      <wizard
        v-if="wizard"
        v-bind="wizard"
        @cancel="cancelWizard"
        @end="onWizardEnd"
      />
    </transition>
    <spinner :show="wait" :text="'Загрузка данных...'" />
  </div>
</template>

<script>
import Measure from '../../plugins/measure.js'

import ListComponent from '../ListComponent.vue'
import PagerComponent from '../PagerComponent.vue'
import ChartLine from '../ChartLine.vue'
import ToolBar from '../ToolBar.vue'
import DatePicker from '../Inputs/DatePicker.vue'
import Wizard from '../Wizard.vue'

import { getISODateTime, matchType } from '../../plugins/api.js'
import Export from '../../plugins/export.js'
import debounce from '../../plugins/debounce.js'

let getDateTime = () => {
  return new Date(Date.now())
}

let dateTime = getDateTime()

const wizardSettings = (measures) => {
  return {
    name: 'settings',
    component: {
      text: 'Настройки:',
      component: 'equipSetSettings',
      event: 'changed',
      data: {
        measures,
      },
    },
  }
}

export default {
  components: {
    PagerComponent,
    ChartLine,
    ToolBar,
    DatePicker,
    Wizard,
  },
  extends: ListComponent,
  props: {
    id: Number,
    hasEquipEvents: Boolean,
    hasSetDataColdWater: Boolean,
    hasColdWater: Boolean,
    hasTimeSync: Boolean,
  },
  data() {
    return {
      periodStart: new Date(
        dateTime.getFullYear(),
        dateTime.getMonth() - 1,
        dateTime.getDate()
      ),
      periodEnd: new Date(
        dateTime.getFullYear(),
        dateTime.getMonth(),
        dateTime.getDate() + 1,
        0,
        0,
        -1
      ),
      viewType: 'table',
      pollType: this.hasEquipEvents
        ? this.$store.getters.pollDataTypes.equipEvents
        : this.$store.getters.pollDataTypes.setParams,
      dateFormat: 'DD.MM.YYYY HH:mm:ss',
      columns: [],
      charts: {},
      measures: [],
      wait: false,
      equipName: null,
      sortOrder: 'desc',
      sortIndex: 0,
      sortAccordance: {
        asc: 'fa-arrow-up',
        desc: 'fa-arrow-down',
      },
      sortTitle: {
        asc: 'По возрастанию',
        desc: 'По убыванию',
      },
      wizard: null,
      exporter: new Export(this.$http),
    }
  },
  computed: {
    model() {
      return {
        id: this.id,
        pollDataType: this.pollType,
        periodStart: getISODateTime(this.periodStart),
        periodEnd: getISODateTime(this.periodEnd),
        measures: this.measures.map((r) => r.value),
        sort: this.sortOrder,
        sortIndex: this.sortIndex,
      }
    },
    pollDataTypes() {
      return matchType(this.$store.state.env.pollDataTypes)
    },
  },
  watch: {
    periodStart() {
      this.debounce()
    },
    periodEnd() {
      this.debounce()
    },
  },
  mounted() {
    this.$nextTick().then(() => this.load())
  },
  methods: {
    allowChart() {
      return !(
        this.pollType === this.$store.getters.pollDataTypes.equipEvents ||
        this.pollType === this.$store.getters.pollDataTypes.equipCustomizing
      )
    },
    sort() {
      return true
    },
    onSettingsClick() {
      this.wizard = wizardSettings(this.measures)
    },
    cancelWizard() {
      this.wizard = null
    },
    onWizardEnd(data, name) {
      this.wizard = null

      if (name === 'settings') {
        this.measures = JSON.parse(JSON.stringify(data))
        this.load()
      }
    },
    onPollTypeChange(value) {
      this.pollType = parseInt(value)
      if (!this.allowChart()) this.viewType = 'table'
      this.load()
    },
    onSort(sortOrder, index) {
      this.sortOrder = sortOrder
      this.sortIndex = index

      this.columns[index].sort = sortOrder

      this.dataItems.sort(function (a, b) {
        if (a[index] > b[index]) {
          return sortOrder === 'asc' ? 1 : -1
        }
        if (a[index] < b[index]) {
          return sortOrder === 'asc' ? -1 : 1
        }
        return 0
      })

      this.pageInfo.Page = 1
    },
    hasHint(r) {
      if (r && typeof r === 'object') {
        if (r.value && r.hasOwnProperty('title')) {
          return true
        }
      }
      return false
    },
    getCellValue(r, type) {
      if (r !== null) {
        if (typeof r === 'object') {
          if (r.value && r.hasOwnProperty('value')) {
            return r.value
          }
        } else {
          switch (type) {
            case 'dateTime':
              return new Date(r).toLocaleString()
            case 'single':
            case 'double':
              return Math.round(r * 1000) / 1000
          }
        }
      }

      return r
    },
    getCellTitle(r) {
      if (r && typeof r === 'object') {
        if (r.value && r.hasOwnProperty('title')) {
          return r.title
        }
      }
      return null
    },
    debounce: debounce(function () {
      this.load()
    }, 1000),
    async load() {
      this.wait = true

      try {
        const { data } = await this.$http.post('equipSet/set', this.model)

        this.equipName = data.equipName
        this.columns = data.columns || []
        this.dataItems = data.values || []
        this.charts = data.charts || {}

        this.measures = [
          ...new Set(
            data.columns
              .filter((r) => r.hasOwnProperty('mu'))
              .map((r) => this.$store.state.env.mUnits[r.mu])
          ),
        ]
          .reduce((acc, r) => {
            if (r.hasOwnProperty('group')) {
              const group = this.$store.state.env.mUnitGroups[r.group]

              if (group.units.length > 1) {
                acc.push(
                  new Measure({
                    type: group.value,
                    defaultType: r.value,
                    caption: group.text,
                    measureUnits: group.units.map((unit) => ({
                      key: unit,
                      value: this.$store.state.env.mUnits[unit].text,
                    })),
                  })
                )
              }
            }

            return acc
          }, [])
          .sort((a, b) => {
            if (a.text.toLowerCase() < b.text.toLowerCase()) return -1
            if (a.text.toLowerCase() > b.text.toLowerCase()) return 1
          })
      } catch (error) {
        if (error.response.status === 550) {
          this.$store.commit('notification', {
            title: 'Формирование данных наборов',
            type: 'error',
            text: error.response.data,
          })

          this.columns = []
          this.dataItems = []
          this.charts = {}
          this.measures = []
        } else {
          this.$store.commit('error', error)
        }
      } finally {
        this.wait = false
      }
    },
    async exportData(type) {
      let model = Object.assign({ exportType: type }, this.model)
      let periodStart = this.periodStart.toLocaleString()
      let periodEnd = this.periodEnd.toLocaleString()
      model.fileName = `${this.equipName}, ${
        this.$store.state.env.pollDataTypes[this.pollType].text
      } (${periodStart} - ${periodEnd})`

      switch (type) {
        case 'jpeg':
        case 'png':
        case 'svg':
          this.$refs.chart.export(type, model.fileName)
          break
        default:
          try {
            await this.exporter.post('equipSet/export', model)
          } catch (error) {
            if (error.response.status === 550) {
              this.$store.commit('notification', {
                title: 'Экспорт данных наборов',
                type: 'error',
                text: await error.response.data.text(),
              })
            } else {
              this.$store.commit('error', error)
            }
          } finally {
            this.wait = false
          }
          break
      }
    },
  },
}
</script>
