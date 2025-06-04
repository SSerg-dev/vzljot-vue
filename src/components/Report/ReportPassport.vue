<template>
  <div class="component-detail wrapper">
    <tabs>
      <tab :text="'Параметры'">
        <expantion caption="Отчет" :resizable="false">
          <div class="grid">
            <label :disabled="!initialized">Отчетная форма:</label>
            <select v-model="filter.report" style="width: 200px" :disabled="!initialized" :class="{ 'validation-error': error.report }" :title="error.report">
              <option v-for="item in sortedReports" :key="item.id" :value="item.id">{{ item.name }}</option>
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
import Measure from '../../plugins/measure'

import Expantion from '../ExpantionPanel.vue'
import Measures from '../MeasuresComponent.vue'
import Tab from '../Tabs/Tab.vue'
import Tabs from '../Tabs/Tabs.vue'

export default {
  components: {
    Expantion,
    Measures,
    Tab,
    Tabs
  },
  props: {
    items: Array,
    objType: Number
  },
  data() {
    return {
      filter: {
        report: null
      },
      reports: {},
      measures: [],
      error: {
        report: null
      },
      wait: false,
      initialized: false
    }
  },
  created() {
    this.$watch(
      () => this.sortedReports,
      reports => {
        if (reports && reports.length > 0 && !reports.some(r => r.id === this.filter.report)) {
          this.filter.report = reports[0].id
        }
      }
    )
  },
  async mounted() {
    await this.$nextTick()
    this.wait = true
    try {
      const { data } = await this.$http.get('report/params', { params: { items: this.items, objType: this.objType, reportType: 'passport' } })

      this.initialized = true
      this.reports = data.reports
      this.measures = data.measures.map(r => new Measure(r))
    } catch (e) {
      this.$store.commit('error', e)
    } finally {
      this.wait = false
    }
  },
  computed: {
    sortedReports() {
      return Object.values(this.reports).sort((a, b) => this.$store.state.collator.compare(a.name, b.name))
    }
  },
  methods: {
    getModel() {
      return {
        items: this.items,
        type: this.objType,
        reportType: 'passport',
        report: this.filter.report,
        measures: this.measures.map(r => {
          return { key: r.type, value: r.value }
        })
      }
    },
    validate() {
      Object.keys(this.error).forEach(r => (this.error[r] = null))

      if (this.initialized) {
        this.$emit('saved', this.getModel())
      }

      if (Object.keys(this.reports).length === 0) {
        this.error.report = 'Необходимо выбрать отчетную форму'
      }

      return this.initialized && Object.keys(this.reports).length > 0
    }
  }
}
</script>

<style scoped>
.wrapper {
  min-width: 345px;
}

.grid {
  display: grid;
  grid-gap: 5px 3px;
  grid-template-columns: max-content max-content;
  width: fit-content;
}

.grid label {
  justify-self: end;
}
</style>
