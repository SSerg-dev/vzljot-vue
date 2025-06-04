<template>
  <div class="component-detail">
    <tool-bar
      :exportTypes="
        viewType === 'table' ? ['csv', 'xls', 'xlsx'] : ['jpeg', 'png', 'svg']
      "
      @export="
        exportData(id, localTimeStart.getTime(), localTimeEnd.getTime(), $event)
      "
    >
      <label
        >с:
        <date-picker
          v-model="localTimeStart"
          :format="dateFormat"
          style="width: 90px"
      /></label>
      <label
        >по:
        <date-picker
          v-model="localTimeEnd"
          :format="dateFormat"
          style="width: 90px"
      /></label>
      <template v-slot:end>
        <slot name="choice"></slot>
      </template>
    </tool-bar>
    <tabs @click="viewType = $event">
      <tab text="График по дате" name="chart">
        <chart-line ref="chart" v-bind="{ charts: chartsByDate }" />
      </tab>
      <tab text="Данные" name="table">
        <div
          class="table-grid"
          style="grid-template-columns: repeat(8, max-content)"
        >
          <template v-if="hasColumns">
            <header class="header right">{{ columns.Time }}</header>
            <header class="header right">{{ columns.tHwsIn }}</header>
            <header class="header right">{{ columns.TMore75Event }}</header>
            <header class="header right">
              {{ columns.TMore60less75Event }}
            </header>
            <header class="header right">
              {{ columns.TMore57less60Event }}
            </header>
            <header class="header right">
              {{ columns.TMore54less57Event }}
            </header>
            <header class="header right">
              {{ columns.TMore51less54Event }}
            </header>
            <header class="header right">{{ columns.Tless51Event }}</header>
          </template>
          <div v-for="(r, index) in data" :key="index" class="table-row">
            <span class="cell right">{{
              new Date(r.Time).toLocaleDateString()
            }}</span>
            <span class="cell right">{{ r.tHwsIn }}</span>
            <span
              :class="['cell', { right: true, 'warn-color': r.TMore75Event }]"
              >{{
                r.TMore75Event === true
                  ? 'Да'
                  : r.TMore75Event === false
                  ? 'Нет'
                  : ''
              }}</span
            >
            <span
              :class="[
                'cell',
                { right: true, 'warn-color': r.TMore60less75Event },
              ]"
              >{{
                r.TMore60less75Event === true
                  ? 'Да'
                  : r.TMore60less75Event === false
                  ? 'Нет'
                  : ''
              }}</span
            >
            <span
              :class="[
                'cell',
                { right: true, 'warn-color': r.TMore57less60Event },
              ]"
              >{{
                r.TMore57less60Event === true
                  ? 'Да'
                  : r.TMore57less60Event === false
                  ? 'Нет'
                  : ''
              }}</span
            >
            <span
              :class="[
                'cell',
                { right: true, 'warn-color': r.TMore54less57Event },
              ]"
              >{{
                r.TMore54less57Event === true
                  ? 'Да'
                  : r.TMore54less57Event === false
                  ? 'Нет'
                  : ''
              }}</span
            >
            <span
              :class="[
                'cell',
                { right: true, 'warn-color': r.TMore51less54Event },
              ]"
              >{{
                r.TMore51less54Event === true
                  ? 'Да'
                  : r.TMore51less54Event === false
                  ? 'Нет'
                  : ''
              }}</span
            >
            <span
              :class="['cell', { right: true, 'warn-color': r.Tless51Event }]"
              >{{
                r.Tless51Event === true
                  ? 'Да'
                  : r.Tless51Event === false
                  ? 'Нет'
                  : ''
              }}</span
            >
          </div>
        </div>
        <footer class="table-footer">
          {{ `Строк: ${data ? data.length : 0};` }}
        </footer>
      </tab>
    </tabs>
    <spinner :show="wait" :text="'Загрузка...'" />
  </div>
</template>

<script>
import Export from '../../plugins/export.js'

import ToolBar from '../ToolBar.vue'
import ChartLine from '../ChartLine.vue'
import DatePicker from '../Inputs/DatePicker.vue'
import Tab from '../Tabs/Tab.vue'
import Tabs from '../Tabs/Tabs.vue'

export default {
  components: {
    ToolBar,
    ChartLine,
    DatePicker,
    Tab,
    Tabs,
  },
  props: {
    id: Number,
    timeStart: Date,
    timeEnd: Date,
  },
  data() {
    return {
      viewType: 'chart',
      localTimeStart: this.timeStart,
      localTimeEnd: this.timeEnd,
      dateFormat: 'DD.MM.YYYY',
      columns: {},
      data: null,
      chartsByDate: {},
      wait: false,
      pointName: null,
      exporter: new Export(this.$http),
    }
  },
  mounted() {
    this.$nextTick().then(() => {
      this.get()
    })
  },
  computed: {
    hasColumns() {
      return this.columns && Object.keys(this.columns).length > 0
    },
  },
  watch: {
    localTimeStart() {
      this.get()
    },
    localTimeEnd() {
      this.get()
    },
  },
  methods: {
    async get() {
      try {
        this.wait = true

        this.data = null
        this.columns = {}
        this.chartsByDate = {}

        const { data } = await this.$http.get('analyze/analyzeQualityHws', {
          params: {
            id: this.id,
            timeStart: this.localTimeStart.getTime(),
            timeEnd: this.localTimeEnd.getTime(),
          },
        })

        if (data.error) {
          this.$store.commit('notification', {
            title: 'Анализ',
            type: 'error',
            text: data.error,
          })
        } else {
          this.columns = data.columns ? data.columns : {}
          this.chartsByDate = data.chartsByDate ? data.chartsByDate : {}

          this.data = data.data ? data.data : null
        }

        this.pointName = data.pointName
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.wait = false 
      }
    },
    notify(options) {
      this.$store.commit('notification', options)
    },
    async exportData(id, timeStart, timeEnd, type) {
      let fileName = `Анализ качества поставки ГВС ТУ - ${this.pointName}`
      if (typeof this.pointName === 'undefined') {
        const options = {
          title: 'Экспорт данных',
          type: 'error',
          text: 'Нет данных за указанный период.',
        }
        this.notify(options)

        return
      }

      switch (type) {
        case 'jpeg':
        case 'png':
        case 'svg':
          this.$refs.chart.export(type, fileName)
          break
        default:
          this.wait = true
          try {
            await this.exporter.post('analyze/export', {
              id,
              timeStart,
              timeEnd,
              type,
              analyzeType: 'temperatureQualityHws',
            })
          } catch (error) {
            if (error.response.status === 550) {
              this.$store.commit('notification', {
                title: 'Экспорт данных',
                type: 'error',
                text: await error.response.data.text(),
              })
            } else {
              this.$store.commit('error', error)
            }
          } finally {
            this.wait = false
          }
      }
    },
  },
}
</script>
