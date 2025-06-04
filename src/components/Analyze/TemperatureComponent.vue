<template>
  <div class="component-detail">
    <toolbar
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
        />
      </label>
      <label
        >по:
        <date-picker
          v-model="localTimeEnd"
          :format="dateFormat"
          style="width: 90px"
        />
      </label>
      <template v-slot:end>
        <slot name="choice"></slot>
      </template>
    </toolbar>
    <tabs @click="viewType = $event">
      <tab text="График по дате" name="chart">
        <chart-line ref="chart" v-bind="{ charts: chartsByDate }" />
      </tab>
      <tab text="График по tнв" name="chartnv">
        <chart-line
          ref="chartnv"
          v-bind="{
            x: { way: 'reversed', type: 'value' },
            charts: this.chartsByTnv,
          }"
        />
      </tab>
      <tab text="Данные" name="table">
        <div
          class="table-grid"
          :style="{
            'grid-template-columns': `repeat(${columns.length}, max-content)`,
          }"
        >
          <template v-if="hasColumns">
            <header v-for="(r, i) in columns" :key="i" class="header right">
              {{ r.name }}
            </header>
          </template>

          <div v-for="(r, i) in data" :key="i" class="table-row">
            <span class="cell right">{{
              new Date(r.time).toLocaleDateString()
            }}</span>
            <span class="cell right">{{ r.tnv }}</span>
            <span class="cell right">{{ r.t1 }}</span>
            <span class="cell right">{{ r.t1gr }}</span>
            <span :class="['cell', { right: true, 'warn-color': r.t1Event }]">{{
              r.dt1
            }}</span>
            <span :class="['cell', { right: true, 'warn-color': r.t1Event }]">{{
              r.dt1Per
            }}</span>
            <span :class="['cell', { right: true, 'warn-color': r.t1Event }]">{{
              r.t1Event === true ? 'Да' : r.t1Event === false ? 'Нет' : ''
            }}</span>
            <span class="cell right">{{ r.t2 }}</span>
            <span class="cell right">{{ r.t2gr }}</span>
            <span :class="['cell', { right: true, 'warn-color': r.t2Event }]">{{
              r.dt2
            }}</span>
            <span :class="['cell', { right: true, 'warn-color': r.t2Event }]">{{
              r.dt2Per
            }}</span>
            <span :class="['cell', { right: true, 'warn-color': r.t2Event }]">{{
              r.t2Event === true ? 'Да' : r.t2Event === false ? 'Нет' : ''
            }}</span>
            <span class="cell right" :title="r.onOffRecords.description">{{
              r.onOffRecords.value
            }}</span>
            <span class="cell right" :title="r.CAARecords.description">{{
              r.CAARecords.value
            }}</span>
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

import ChartLine from '../ChartLine.vue'
import DatePicker from '../Inputs/DatePicker.vue'
import Tab from '../Tabs/Tab.vue'
import Tabs from '../Tabs/Tabs.vue'
import Toolbar from '../ToolBar.vue'

export default {
  components: {
    Tab,
    Tabs,
    Toolbar,
    ChartLine,
    DatePicker,
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
      chartsByTnv: {},
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
        this.chartsByTnv = {}

        const { data } = await this.$http.get('analyze/analyzeTemperature', {
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
          this.chartsByTnv = data.chartsByTnv ? data.chartsByTnv : {}

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
      let fileName = `Анализ температурного графика - ${this.pointName}`
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
          this.$refs[this.viewType].export(type, fileName)
          break
        default:
          this.wait = true
          try {
            await this.exporter.post('analyze/export', {
              id,
              timeStart,
              timeEnd,
              type,
              analyzeType: 'temperature',
            })
          } catch (error) {
            console.log('analyze export error')
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
