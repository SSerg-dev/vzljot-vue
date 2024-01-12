<template>
  <div class="component-detail wrapper">
    <tabs :overflow="'visible'">
      <tab text="Параметры" :overflow="'visible'">
        <expantion caption="Период" :resizable="false">
          <div class="grid two">
            <label>Тип периода:</label>
            <select v-model="filter.periodType" @change="periodTypeChange">
              <option v-for="item in periodTypes" :key="item.type" :value="item.type">{{ item.text }}</option>
            </select>
            <label>Начало:</label>
            <date-picker v-model="filter.periodStart" @update:modelValue="periodStartChange" />
            <label :disabled="isPeriodNotSpecified">Окончание:</label>
            <date-picker v-model="filter.periodEnd" :disabled="isPeriodNotSpecified" />
          </div>
        </expantion>
        <expantion caption="Вид" :resizable="false">
          <div class="grid two">
            <label>Метки времени:</label>
            <select v-model="filter.timeType">
              <option v-for="item in $store.state.env.reportTimeTypes" :key="item.id" :value="item.id">{{ item.text }}</option>
            </select>
          </div>
        </expantion>
      </tab>
      <tab text="Единицы измерения">
        <measures :measures="measures" />
      </tab>
    </tabs>
  </div>
</template>

<script>
import Measure from '../../plugins/measure.js'
import { getISODateTime } from '../../plugins/api.js'

import DatePicker from '../Inputs/DatePicker.vue'
import Expantion from '../ExpantionPanel.vue'
import Measures from '../MeasuresComponent.vue'
import Tab from '../Tabs/Tab.vue'
import Tabs from '../Tabs/Tabs.vue'

export default {
  name: 'reportMoek',
  components: {
    DatePicker,
    Expantion,
    Measures,
    Tab,
    Tabs
  },
  props: {
    id: Number
  },
  data() {
    return {
      initialized: false,
      filter: {
        periodType: null,
        timeType: null,
        periodStart: null,
        periodEnd: null
      },
      measures: []
    }
  },
  async mounted() {
    await this.$nextTick()

    this.$emit('mounted')

    try {
      const { data: { filter, measures } } = await this.$http.get('moek/params', { params: { id: this.id } })
      this.initialized = true
      this.filter = filter
      this.measures = measures.map(item => new Measure(item))
    } catch (error) {
      if (error.response.status === 551) {
        this.$store.commit('notification', {
          title: 'Формирование отчета МОЭК',
          type: 'error',
          text: error.response.data
        })
      } else {
        this.$store.commit('error', error)
      }
    } finally {
      this.$emit('loaded')
    }
  },
  computed: {
    periodTypes() {
      return this.$store.state.env.reportPeriodTypes
    },
    isPeriodNotSpecified() {
      return this.periodTypes.specified.type !== this.filter.periodType
    }
  },
  methods: {
    periodStartChange() {
      if (this.isPeriodNotSpecified && this.initialized) {
        this.getPeriod(false)
      }
    },
    periodTypeChange() {
      if (this.isPeriodNotSpecified && this.initialized) {
        this.getPeriod(true)
      }
    },
    getModel() {
      return {
        id: this.id,
        timeType: this.filter.timeType,
        periodType: this.filter.periodType,
        periodStart: getISODateTime(new Date(this.filter.periodStart)),
        periodEnd: getISODateTime(new Date(this.filter.periodEnd)),
        measures: this.measures.map(r => ({ key: r.type, value: r.value })),
        initStartTime: false
      }
    },
    async getPeriod(initStartTime) {
      try {
        const model = this.getModel()

        const { data: { periodStart, periodEnd } } = await this.$http.post('moek/period', Object.assign(model, { initStartTime }))

        this.filter.periodStart = periodStart
        this.filter.periodEnd = periodEnd
      } catch (error) {
        this.$store.commit('error', error)
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
  min-width: 345px;
}

.grid {
  display: grid;
  gap: 5px 3px;
  align-items: center;
}

.grid.two {
  grid-template-columns: max-content max-content;
}

.grid label {
  text-align: right;
}

.grid select {
  width: fit-content;
}

.grid .datepicker {
  width: 90px;
}
</style>
