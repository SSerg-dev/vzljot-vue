<template>
  <div class="component-detail">
    <tool-bar>
      <label>c: <date-picker v-model="localTimeStart" :format="archiveType.format" style="width: 150px;" @update:modelValue="debounce()"/></label>
      <label>по: <date-picker v-model="localTimeEnd" :format="archiveType.format" style="width: 150px;" @update:modelValue="debounce()"/></label>
      <label
        >Данные:
        <select v-model="localPollDataType" @change="onChange()">
          <option v-for="(r, i) in sortedArchives" :key="i" :value="r.pollDataType">{{ r.name }}</option>
        </select>
      </label>
      <label
        >Критерий:
        <select v-model="localSchemaEvent" @change="onChange()">
          <option v-for="(r, i) in schemaEvents" :key="i" :value="r.guid">{{ r.name }}</option>
        </select>
      </label>
      <template v-slot:end>
        <slot name="choice"></slot>
        <div :class="['button', 'fas', 'fa-cog', { disabled: settingsDisabled }]" title="Настройки" @click="onSettingsClick()" />
        <!-- <div v-if="store.state.user.userRights.measureSchemeEdit" :class="['button', 'fas', 'fa-chart-pie', { disabled: loading }]" title="Параметры анализа" @click="onParamsClick()" /> -->
      </template>
    </tool-bar>
    <tabs>
      <tab text="Графики">
        <chart v-for="(r, i) in groups" v-bind="{ columns: r, rows, wrongs, archive: archiveType.type }" :key="i" />
      </tab>
      <tab text="Данные">
        <div class="table-grid" :style="{ 'grid-template-columns': `repeat(${columns.length}, max-content)` }">
          <header v-for="(r, indexColumn) in columns" :key="indexColumn">{{ r.name }}</header>
          <div v-for="(row, indexRow) in rows" :key="indexRow" class="table-row">
            <template v-for="(r, i) in row">
              <span v-if="i !== 1" :class="['cell', 'right', { 'warn-color': row[1] }]" :key="i">{{ getValue(r, i) }}</span>
            </template>
          </div>
        </div>
        <footer class="table-footer">{{ `Строк: ${rows ? rows.length : 0};` }}</footer>
      </tab>
    </tabs>
    <transition>
      <wizard v-if="wizard" v-bind="wizard" @cancel="cancelWizard" @end="onWizardEnd" />
    </transition>
    <spinner :show="loading" text="Загрузка..." />
  </div>
</template>

<script>
import Measure from '../../plugins/measure.js'
import debounce from '../../plugins/debounce.js'

import Chart from './ChartComponent.vue'
import DatePicker from '../Inputs/DatePicker.vue'
import Tab from '../Tabs/Tab.vue'
import Tabs from '../Tabs/Tabs.vue'
import ToolBar from '../ToolBar.vue'
import Wizard from '../Wizard.vue'

const wizardSettings = measures => {
  return {
    name: 'settings',
    component: {
      text: 'Настройки:',
      component: 'measures',
      event: 'changed',
      data: {
        measures
      }
    }
  }
}

export default {
  components: {
    Chart,
    DatePicker,
    Tab,
    Tabs,
    ToolBar,
    Wizard
  },
  props: {
    id: Number,
    timeStart: Date,
    timeEnd: Date,
    pollDataType: Number,
    archiveTypes: Array,
    schemaEvent: String,
    schemaEvents: Array
  },
  data() {
    return {
      loading: false,
      localSchemaEvent: this.schemaEvent,
      localPollDataType: this.pollDataType,
      localTimeStart: this.timeStart,
      localTimeEnd: this.timeEnd,
      localMeasures: [...new Set([].concat(...this.schemaEvents.map(r => r.measures)))].map(r => {
        const group = this.$store.state.env.mUnitGroups[r]

        return new Measure({
          type: group.value,
          defaultType: group.default,
          caption: group.text,
          measureUnits: group.units.map(unit => ({ key: unit, value: this.$store.state.env.mUnits[unit].text }))
        })
      }),
      wizard: null,
      groups: [],
      columns: [],
      rows: [],
      wrongs: [],
      archiveType: this.getArchiveType(this.pollDataType)
    }
  },
  mounted() {
    this.load(this.id)
  },
  computed: {
    currentMeasures() {
      return this.localMeasures.filter(r => this.schemaEvents.find(r => r.guid === this.localSchemaEvent).measures.includes(r.type))
    },
    settingsDisabled() {
      return Math.max(...this.currentMeasures.map(r => r.items.length), 1) === 1
    },
    sortedArchives() {
      return this.archiveTypes.slice(0).sort((a, b) => a.archiveType - b.archiveType)
    }
  },
  watch: {
    localPollDataType(value) {
      this.archiveType = this.getArchiveType(value)
    },
    localMeasures: {
      handler() {
        this.load(this.id)
      },
      deep: true
    }
  },
  methods: {
    debounce: debounce(function() {
      this.load(this.id)
    }, 1000),
    onActivated(name) {
      console.log('activated', name)
    },
    onChange() {
      this.load(this.id)
    },
    getArchiveType(value) {
      return this.$store.state.env.archiveTypes[this.archiveTypes.find(r => r.pollDataType === value).archiveType]
    },
    onSettingsClick() {
      this.wizard = wizardSettings(JSON.parse(JSON.stringify(this.currentMeasures)))
    },
    cancelWizard() {
      this.wizard = null
    },
    onWizardEnd(data, name) {
      this.wizard = null

      if (name === 'settings') {
        if (data !== null) {
          data.forEach(r => (this.localMeasures.find(group => r.type === group.type).value = r.value))
        }
      } //else if (name === 'params') {}
    },
    getValue(value, index) {
      if (index === 0) {
        value = value.toLocaleString('ru-Ru', this.$store.getters.dateFormat[this.archiveType.type])
      }

      return value
    },
    onParamsClick() {},
    async load(id) {
      try {
        this.loading = true

        const schemaEvent = this.schemaEvents.find(r => r.guid === this.localSchemaEvent)

        const {
          data: { columns, rows, wrongs }
        } = await this.$http.post('analyze/analyze', {
          id,
          timeStart: this.localTimeStart,
          timeEnd: this.localTimeEnd,
          pollDataType: this.localPollDataType,
          commonEventType: schemaEvent.commonEventType,
          scope: schemaEvent.scope,
          measures: this.currentMeasures.map(r => [r.type, r.value])
        })

        this.groups = Array.from(
          columns.reduce((acc, r, i) => {
            if (i !== 0) {
              r.index = i + 1
            }
            if (i !== 0 && Object.prototype.hasOwnProperty.call(r, 'mu')) {
              if (!acc.has(r['mu'])) {
                acc.set(r['mu'], [])
              }
              acc.get(r['mu']).push(r)
            }

            return acc
          }, new Map()),
          ([, v]) => [columns[0], ...v]
        )

        this.columns = columns

        const offset = new Date().getTimezoneOffset() * 60 * 1000
        rows.forEach(r => {
          r[0] = new Date(r[0] + offset)

          for (let i = 2; i < r.length; i++) {
            if (typeof r[i] === 'number') {
              r[i] = Math.round(r[i] * 1000) / 1000
            }
          }
        })

        this.rows = rows

        if (wrongs) {
          this.wrongs = wrongs.map(r => [new Date(r[0] + offset), new Date(r[1] + offset)])
        }
      } catch (e) {
        if (e.response) {
          if (e.response.data.type === 'error') {
            this.$store.commit('error', e.response.data.message)
          } else {
            this.$store.commit('notification', {
              title: 'Анализ',
              type: 1,
              text: e.response.data.message
            })
          }
        } else {
          this.$store.commit('error', e)
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
