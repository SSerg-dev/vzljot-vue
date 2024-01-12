<template>
  <div class="component-detail wrapper" :style="{ 'min-height': showIdle && !(reportType === 'balance' || reportType === 'summary') ? '355px' : '320px' }">
    <tabs :overflow="'visible'">
      <tab text="Параметры" :overflow="'visible'">
        <div class="grid">
          <expantion-panel :resizable="false" caption="Тип архива">
            <archive-type v-model="filter.archiveType" :archiveTypes="archiveTypes" @update:modelValue="archiveTypeChange" />
          </expantion-panel>
          <expantion-panel :resizable="false" caption="Период">
            <div class="grid">
              <label :disabled="!initialized">Тип периода:</label>
              <select v-model="filter.periodType" @change="changeFormat()" :disabled="!initialized">
                <option v-for="item in periodTypes" :key="item.type" :value="item.type">{{ item.text }}</option>
              </select>
              <label :disabled="!initialized">Начало:</label>
              <date-picker v-model="filter.periodStart" :format="dateFormat" :disabled="!initialized" @update:modelValue="periodStartChange" />
              <label :disabled="isPeriodNotSpecified">Окончание:</label>
              <date-picker v-model="filter.periodEnd" :format="dateFormat" :disabled="isPeriodNotSpecified" />
            </div>
          </expantion-panel>
        </div>
        <expantion-panel :resizable="false" caption="Отчет">
          <div class="grid">
            <label :disabled="!initialized">Отчетная форма:</label>
            <select v-model="filter.report" style="width: 200px" :disabled="!initialized">
              <option v-for="item in sortedReports" :key="item.id" :value="item.id">{{ item.name }}</option>
            </select>
            <label :disabled="initialized && patterns.length === 0">Шаблон:</label>
            <select v-model="filter.pattern" style="width: 200px" :disabled="initialized && patterns.length === 0">
              <option v-for="(r, index) in patterns" :key="index" :value="r.name">{{ r.name }}</option>
            </select>
            <label :disabled="initialized && landscapeDisabled">Ориентация страницы:</label>
            <select v-model="landscape" :disabled="initialized && landscapeDisabled">
              <option :value="true">Альбомная</option>
              <option :value="false">Книжная</option>
            </select>
          </div>
        </expantion-panel>
        <expantion-panel :resizable="false" caption="Вид">
          <view-settings :disabled="!initialized" :reportType="reportType" :timeType="filter.reportTimeType" :addEmptyRows="filter.emptyRows" :showIdle="showIdle" :idle="filter.idle" @change="settingsChange" />
        </expantion-panel>
      </tab>
      <tab text="Единицы измерения">
        <measures :measures="measures" />
      </tab>
    </tabs>
    <spinner :show="wait" text="Загрузка..." />
  </div>
</template>

<script>
import Measure from '../../plugins/measure.js'
import { getISODateTime, matchType } from '../../plugins/api.js'

import ArchiveType from '../Report/ArchiveType.vue'
import ExpantionPanel from '../ExpantionPanel.vue'
import DatePicker from '../Inputs/DatePicker.vue'
import Measures from '../MeasuresComponent.vue'
import Tab from '../Tabs/Tab.vue'
import Tabs from '../Tabs/Tabs.vue'
import ViewSettings from './ViewSettings.vue'

export default {
  components: {
    ArchiveType,
    ExpantionPanel,
    Measures,
    ViewSettings,
    DatePicker,
    Tab,
    Tabs
  },
  props: {
    items: Array,
    objType: Number,
    reportType: String
  },
  data() {
    return {
      filter: {
        report: null,
        archiveType: null,
        periodType: null,
        reportTimeType: null,
        periodStart: null,
        periodEnd: null,
        pattern: null,
        emptyRows: false,
        idle: false
      },
      archiveTypes: [],
      reports: {},
      measures: [],
      dateFormat: 'MMMM YYYY',
      showIdle: false,
      wait: false,
      initialized: false
    }
  },
  created() {
    this.$emitter.on('deleteObject', this.delete)
    this.$emitter.on('updateObject', this.update)

    this.$watch(
      () => this.sortedReports,
      reports => {
        if (reports && reports.length > 0 && !reports.some(r => r.id === this.filter.report)) {
          this.filter.report = reports[0].id
        }
      }
    )

    this.$watch(
      () => this.filter.report,
      value => {
        if (value && this.reports[value]) {
          this.landscape = this.reports[value].landscape
        }
      }
    )

    this.$watch(
      () => this.patterns,
      patterns => {
        if (patterns.length > 0) {
          const report = this.reports[this.filter.report]
          if (patterns.some(r => r.name === report.defaultPattern)) {
            this.filter.pattern = report.defaultPattern
          } else {
            this.filter.pattern = patterns[0].name
          }
        } else {
          this.filter.pattern = null
        }
      }
    )
  },
  async mounted() {
    await this.$nextTick()
    this.wait = true
    try {
      const { data } = await this.$http.get('report/params', { params: { items: this.items, objType: this.objType, reportType: this.reportType } })

      this.initialized = true
      this.archiveTypes = data.archiveTypes
      this.filter = data.filter
      this.reports = data.reports
      this.showIdle = data.showIdle
      this.measures = data.measures.map(r => new Measure(r))
    } catch (error) {
      if (error.response.status === 550) {
        this.$store.commit('notification', { title: 'Параметры отчета', type: 'error', text: error.response.data })
      } else {
        this.$store.commit('error', error)
      }
    } finally {
      this.wait = false
    }
  },
  computed: {
    reportObjectTypes() {
      return matchType(this.$store.state.env.reportObjectTypes)
    },
    periodTypes() {
      return this.$store.state.env.reportPeriodTypes
    },
    timeTypes() {
      return this.$store.state.env.reportTimeTypes
    },
    sortedReports() {
      return Object.values(this.reports)
        .sort((a, b) => this.$store.state.collator.compare(a.name, b.name))
        .filter(report => report.archiveTypes.indexOf(this.filter.archiveType) > -1)
    },
    landscape: {
      get() {
        return this.filter.report ? this.reports[this.filter.report].landscape : true
      },
      set(value) {
        this.reports[this.filter.report].landscape = value
      }
    },
    patterns() {
      const report = this.reports[this.filter.report]
      return report ? report.patterns.filter(r => r.archiveTypes.indexOf(this.filter.archiveType) > -1) : []
    },
    isPeriodNotSpecified() {
      return this.periodTypes.specified.type !== this.filter.periodType
    },
    landscapeDisabled() {
      return this.reports && this.reports[this.filter.report] ? !this.reports[this.filter.report].isBase : true
    }
  },
  methods: {
    settingsChange(item, value) {
      switch (item) {
        case 'timeType':
          this.filter.reportTimeType = value
          break
        case 'idle':
          this.filter.idle = value
          break
        case 'addEmptyRows':
          this.filter.emptyRows = value
          break
      }
    },
    archiveTypeChange(value) {
      this.filter.archiveType = value
      this.changeFormat()
      this.getMeasures()
    },
    periodStartChange() {
      if (this.isPeriodNotSpecified) {
        this.getPeriod(false)
      }
    },
    async update(obj) {
      if (obj.type === 'DbReport') {
        let report = this.reports[obj.id.toString()]
        if (!report) {
          try {
            const { data } = this.$http.get('report/allowReport', { params: { reportId: obj.id, items: this.items, type: this.objType } })

            if (data) {
              this.$set(this.reports, obj.id.toString(), {
                id: obj.id,
                name: obj.name
              })

              if (Object.keys(this.reports).length === 1) {
                this.filter.report = obj.id
              }
            }
          } catch (error) {
            this.$store.commit('error', error)
          }
        } else {
          report.name = obj.name
        }
      }
    },
    delete(obj) {
      if (obj.type === 'DbReport') {
        let report = this.reports[obj.id.toString()]
        if (report) {
          this.$delete(this.reports, obj.id.toString())

          if (this.filter.report === obj.id) {
            let keys = Object.keys(this.reports)
            this.filter.report = keys.length > 0 ? this.reports[keys[0].toString()].id : -1
          }
        }
      }
    },
    changeFormat() {
      if (this.isPeriodNotSpecified) {
        this.getPeriod(true)
      }

      switch (this.$store.state.env.archiveTypes[this.filter.archiveType].type) {
        case 'hour':
          if (this.filter.periodType === this.periodTypes.reporting.type || this.filter.periodType === this.periodTypes.contract.type) {
            this.dateFormat = 'DD.MM.YYYY'
          } else if (this.filter.periodType === this.periodTypes.specified.type) {
            this.dateFormat = 'DD.MM.YYYY HH:mm:ss'
          }
          break
        case 'day':
          if (this.filter.periodType === this.periodTypes.reporting.type || this.filter.periodType === this.periodTypes.contract.type) {
            this.dateFormat = 'MMMM YYYY'
          } else if (this.filter.periodType === this.periodTypes.specified.type) {
            this.dateFormat = 'DD.MM.YYYY'
          }
          break
        case 'month':
          if (this.filter.periodType === this.periodTypes.reporting.type || this.filter.periodType === this.periodTypes.contract.type) {
            this.dateFormat = 'YYYY'
          } else if (this.filter.periodType === this.periodTypes.specified.type) {
            this.dateFormat = 'MMMM YYYY'
          }
      }
    },
    getModel() {
      return {
        items: this.items,
        type: this.objType,
        reportType: this.reportType,
        archiveType: this.filter.archiveType,
        reportTimeType: this.filter.reportTimeType,
        periodType: this.filter.periodType,
        report: this.filter.report,
        pattern: this.filter.pattern,
        periodStart: getISODateTime(new Date(this.filter.periodStart)),
        periodEnd: getISODateTime(new Date(this.filter.periodEnd)),
        measures: this.measures.map(r => {
          return { key: r.type, value: r.value }
        }),
        initStartTime: false,
        emptyRows: this.filter.emptyRows,
        idle: this.filter.idle,
        landscape: this.landscape
      }
    },
    async getPeriod(initStartTime) {
      try {
        let model = this.getModel()
        let { data } = await this.$http.post('report/period', Object.assign(model, { initStartTime: initStartTime }))
        this.filter.periodStart = data.periodStart
        this.filter.periodEnd = data.periodEnd
      } catch (e) {
        this.$store.commit('error', e)
      }
    },
    async getMeasures() {
      try {
        const { data } = await this.$http.get('report/measures', { params: { items: this.items, objType: this.objType, archiveType: this.filter.archiveType } })
        if (data && data.length > 0) {
          this.measures = data.map(r => new Measure(r))
        }
      } catch (e) {
        this.$store.commit('error', e)
      }
    },
    validate() {
      if (this.initialized) {
        this.$emit('saved', this.getModel())
      }

      return this.initialized
    }
  }
}
</script>

<style scoped>
.wrapper {
  overflow: visible;
  min-width: 360px;
}

.grid {
  display: grid;
  grid-gap: 5px 3px;
  grid-template-columns: auto max-content;
}

.grid label {
  text-align: right;
}

.grid .datepicker {
  width: 150px;
}
</style>
