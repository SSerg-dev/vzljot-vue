<template>
  <div class="component-detail fit">
    <expantion-panel caption="Основные параметры" :resizable="false">
      <div class="grid two">
        <label>Отчетная форма:</label>
        <select v-model="report" @change="onChangeReport()" :class="{ 'validation-error': localError.report }" :title="localError.report">
          <option v-for="r in Object.values(forms)" :key="r.id" :value="r.id">{{ r.name }}</option>
        </select>
        <label :disabled="patterns.length === 0">Шаблон:</label>
        <select v-model="pattern" @change="onChangePattern()" :disabled="patterns.length === 0" :class="{ 'validation-error': localError.pattern }" :title="localError.pattern">
          <option v-for="r in patterns" :key="r.index" :value="r.name">{{ r.name }}</option>
        </select>
        <label :disabled="landscapeDisabled">Ориентация страницы:</label>
        <select v-model="landscape" :disabled="landscapeDisabled" @change="onChange('landscape', landscape)">
          <option :value="true">Альбомная</option>
          <option :value="false">Книжная</option>
        </select>
      </div>
    </expantion-panel>
    <expantion-panel caption="Данные" :resizable="false">
      <div class="grid-checkbox" :style="`grid-template-columns: repeat(${Object.keys(sources).length}, max-content)`">
        <check-box v-for="r in sources" :key="r" @update:modelValue="onChangeSource(r, $event)" v-model="source[r]" :color="checkBoxColor(localError.source)" :title="localError.source">
          {{ r ? $store.state.env.reportDataSource[r].text : '' }}
        </check-box>
      </div>
    </expantion-panel>
    <expantion-panel v-if="reportForm.type === $store.state.env.dbTypes.dbMeasureSchema" caption="Режимы работы" :resizable="false">
      <div class="grid-checkbox two">
        <check-box v-model="winter" @update:modelValue="onChange('winter', $event)" :color="checkBoxColor(localError.mode)" :title="localError.mode">Отопительный</check-box>
        <check-box v-model="summer" @update:modelValue="onChange('summer', $event)" :color="checkBoxColor(localError.mode)" :title="localError.mode">Межотопительный</check-box>
      </div>
    </expantion-panel>
    <transition>
      <spinner :show="wait" />
    </transition>
  </div>
</template>

<script>
import ReportForm from '../../classes/reportForm.js'

import CheckBox from '../Inputs/CheckBox.vue'
import ExpantionPanel from '../ExpantionPanel.vue'

export default {
  components: {
    CheckBox,
    ExpantionPanel
  },
  props: {
    reportForm: Object,
    forms: Object,
    error: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      wait: false,
      report: this.reportForm.report,
      pattern: this.reportForm.pattern,
      winter: this.reportForm.winter,
      summer: this.reportForm.summer,
      landscape: this.reportForm.landscape,
      localError: JSON.parse(JSON.stringify(this.error)),
      source: this.getSource(this.getSources(this.reportForm.report, this.reportForm.pattern))
    }
  },
  created() {
    this.$watch(
      () => this.sources,
      value => (this.source = this.getSource(value))
    )
  },
  computed: {
    patterns() {
      return this.forms && Object.keys(this.forms).length > 0 && this.report ? this.forms[this.report].patterns : []
    },
    sources() {
      return this.getSources(this.report, this.pattern)
    },
    landscapeDisabled() {
      return this.forms && this.forms[this.report] ? !this.forms[this.report].isBase : true
    }
  },
  watch: {
    'reportForm.report'(r) {
      this.report = r
    },
    'reportForm.pattern'(r) {
      this.pattern = r
    },
    'reportForm.winter'(r) {
      this.winter = r
    },
    'reportForm.summer'(r) {
      this.summer = r
    },
    'reportForm.landscape'(r) {
      this.landscape = r
    },
    error: {
      handler(value) {
        this.localError = JSON.parse(JSON.stringify(value))
      },
      deep: true
    }
  },
  methods: {
    getSource(arr) {
      return arr.reduce((acc, r) => Object.assign(acc, { [r]: (this.reportForm.source & r) !== 0 }), {})
    },
    getSources(report, patternName) {
      let arr = []
      if (this.forms && Object.keys(this.forms).length > 0 && report) {
        if (this.forms[report].isBase) {
          const pattern = this.forms[report].patterns.find(r => r.name === patternName)
          if (pattern) {
            arr = pattern.sources
          }
        } else {
          arr = this.forms[report].sources
        }
      }
      return arr
    },
    checkBoxColor(value) {
      return value ? '#b22222' : this.$store.getters.styleColors['background-color']
    },
    onChangeReport() {
      this.onChange('report', this.report)
      this.onChange('pattern', this.patterns.length > 0 ? this.patterns[0].name : null)

      this.onChange(
        'source', 
        this.patterns.length > 0 ? Object.entries(this.source).reduce((acc, [k, v]) => (v ? acc + parseInt(k) : acc), 0) : 0)
    },
    onChangePattern() {
      this.onChange('pattern', this.pattern)

      this.onChange(
        'source',
        Object.entries(this.source).reduce((acc, [k, v]) => (v ? acc + parseInt(k) : acc), 0)
      )
    },
    onChangeSource(prop, value) {
      this.source[prop] = value

      this.onChange(
        'source',
        Object.entries(this.source).reduce((acc, [k, v]) => (v ? acc + parseInt(k) : acc), 0)
      )
    },
    onChange(prop, value) {
      this.$emit('changed', prop, value)
    },
    async save() {
      try {
        this.wait = true

        this.localError = {}

        const form = new ReportForm({
          type: this.reportForm.type,
          objectId: this.reportForm.objectId,
          report: this.report,
          pattern: this.pattern,
          source: Object.entries(this.source).reduce((acc, [k, v]) => (v ? acc + parseInt(k) : acc), 0),
          winter: this.winter,
          summer: this.summer,
          landscape: this.landscape
        })

        await form.save(this.$http)

        return true
      } catch (error) {
        if (error.response.status === 551) {
          this.localError = error.response.data

          if (this.localError.hasOwnProperty('message')) {
            this.$store.commit('notification', {
              title: 'Сохранение отчетной формы',
              type: 'error',
              text: this.localError.message
            })
          }
        } else {
          this.$store.commit('error', error)
        }
      } finally {
        this.wait = false
      }
    }
  }
}
</script>

<style scoped>
.grid,
.grid-checkbox {
  display: grid;
  align-items: center;
}

.grid {
  gap: 5px 3px;
}

.grid-checkbox {
  gap: 5px 10px;
}

.grid.two,
.grid-checkbox.two {
  grid-template-columns: max-content max-content;
}

.grid label {
  text-align: right;
}

.grid select {
  max-width: 400px;
  width: fit-content;
}
</style>
