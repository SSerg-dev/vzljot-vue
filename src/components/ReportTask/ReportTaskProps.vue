<template>
  <div class="fit" style="overflow: visible; min-width: 470px">
    <expantion-panel caption="Основные параметры" :resizable="false">
      <div class="task-grid two">
        <label>Наименование:</label>
        <input v-model.trim="name" type="text" maxlength="50" @input="onChange('name', name)" :class="{ 'validation-error': localError.name }" :title="localError.name" />
        <check-box v-model="active" @update:modelValue="onChange('active', $event)">Включено</check-box>
        <div class="task-grid" style="grid-template-columns: repeat(4, min-content);">
          <label>Начало:</label>
          <date-picker v-model="timeStart" @update:modelValue="onChange('timeStart', timeStart)" :format="dateFormat" style="width: 100px" :class="{ 'validation-error': localError.timeStart }" :title="localError.timeStart" />
          <label>Окончание:</label>
          <date-picker v-model="timeEnd" @update:modelValue="onChange('timeEnd', timeEnd)" :format="dateFormat" style="width: 100px" :class="{ 'validation-error': localError.timeEnd }" :title="localError.timeEnd" clearable />
        </div>
      </div>
    </expantion-panel>
    <div class="task-grid" style="grid-template-columns: min-content 1fr">
      <expantion-panel :resizable="false" caption="Тип архива">
        <archive-type v-model="archiveType" :archiveTypes="Object.keys(this.$store.state.env.archiveTypes).map(r => parseInt(r))" @update:modelValue="onChange('archiveType', $event)" />
      </expantion-panel>
      <expantion-panel :resizable="false" caption="Период">
        <div class="task-grid">
          <div class="task-grid two">
            <label>Тип периода:</label>
            <select v-model="periodType" @change="onChange('periodType', periodType)">
              <option v-for="r in $store.state.env.reportPeriodTypes" :key="r.type" :value="r.type">{{ r.text }}</option>
            </select>
          </div>
          <div v-if="isPeriodSpecified" class="task-grid two">
            <label>Время:</label>
            <div class="task-grid" style="grid-template-columns: repeat(7, min-content);">
              <number-box v-if="dayVisible" v-model="contractDay" @update:modelValue="onChange('contractDay', $event)" style="width: 30px" :min="1" :max="31" />
              <label v-if="dayVisible && archiveType ? archiveTypes.day === this.archiveType : false">д.</label>
              <select v-if="monthVisible" v-model="contractMonth" @change="onChange('contractMonth', contractMonth)">
                <option v-for="(item, index) in months" :key="index" :value="index + 1">{{ item }}</option>
              </select>
              <number-box v-model="contractHours" @update:modelValue="onChange('contractHours', $event)" style="width: 30px" :max="23" />
              <label>ч.</label>
              <number-box v-model="contractMinutes" @update:modelValue="onChange('contractMinutes', $event)" style="width: 30px" :max="59" />
              <label>мин.</label>
            </div>
          </div>
        </div>
      </expantion-panel>
    </div>
    <expantion-panel caption="Запуск" :resizable="false">
      <div class="task-grid">
        <radio :label="reportTaskRunTypes.byData" v-model="runType" @update:modelValue="propChange('runType', $event)">Ожидать поступления данных</radio>
        <div class="task-grid" style="grid-template-columns: repeat(5, min-content); justify-self: end;">
          <check-box v-model="runDataWait" @update:modelValue="onChange('runDataWait', $event)" :disabled="byDataDisabled">но не более:</check-box>
          <number-box v-model="runDataHours" @update:modelValue="onChange('runDataHours', $event)" style="width: 30px" :max="23" :disabled="byDataDisabled || !runDataWait" />
          <label :disabled="byDataDisabled || !runDataWait">ч.</label>
          <number-box v-model="runDataMinutes" @update:modelValue="onChange('runDataMinutes', $event)" style="width: 30px" :max="59" :disabled="byDataDisabled || !runDataWait" />
          <label :disabled="byDataDisabled || !runDataWait">мин.</label>
        </div>
        <radio :label="reportTaskRunTypes.byTime" v-model="runType" @update:modelValue="propChange('runType', $event)">Заданное время</radio>
        <div class="task-grid two" style="justify-self: end">
          <label :disabled="byTimeDisabled">Момент:</label>
          <div class="task-grid" style="grid-template-columns: repeat(8, min-content);">
            <select :disabled="byTimeDisabled" v-model="runPeriod">
              <option v-for="key in Object.keys($store.state.env.reportTaskRunPeriod)" :key="key" :value="parseInt(key)">{{ $store.state.env.reportTaskRunPeriod[key].text }}</option>
            </select>
            <label :disabled="byTimeDisabled">Время:</label>
            <number-box v-if="dayVisible" v-model="runDay" @update:modelValue="onChange('runDay', $event)" style="width: 30px" :min="1" :max="31" :disabled="byTimeDisabled" />
            <label v-if="dayVisible && archiveType ? archiveTypes.day === this.archiveType : false" :disabled="byTimeDisabled">д.</label>
            <select v-if="monthVisible" v-model="runMonth" @change="onChange('runMonth', runMonth)" :disabled="byTimeDisabled">
              <option v-for="(r, index) in months" :key="index" :value="index + 1">{{ r }}</option>
            </select>
            <number-box v-model="runHours" @update:modelValue="onChange('runHours', $event)" style="width: 30px" :max="23" :disabled="byTimeDisabled" />
            <label :disabled="byTimeDisabled">ч.</label>
            <number-box v-model="runMinutes" @update:modelValue="onChange('runMinutes', $event)" style="width: 30px" :max="59" :disabled="byTimeDisabled" />
            <label :disabled="byTimeDisabled">мин.</label>
          </div>
        </div>
      </div>
    </expantion-panel>
    <report-mode :winter="winter" :summer="summer" @change="propChange" />
    <expantion-panel caption="Вид" :resizable="false">
      <view-settings :timeType="timeType" :addEmptyRows="addEmptyRows" :showIdle="true" :idle="idle" @change="propChange" />
    </expantion-panel>
  </div>
</template>

<script>
import { matchType } from '../../plugins/api.js'

import { ReportTask } from '../../classes/reportTask'

import NumberBox from '../Inputs/NumberBox.vue'
import CheckBox from '../Inputs/CheckBox.vue'
import Radio from '../Inputs/Radio.vue'
import DatePicker from '../Inputs/DatePicker.vue'
import ArchiveType from '../Report/ArchiveType.vue'
import ExpantionPanel from '../ExpantionPanel.vue'
import ReportMode from '../Report/ReportMode.vue'
import ViewSettings from '../Report/ViewSettings.vue'

export default {
  components: {
    NumberBox,
    CheckBox,
    Radio,
    DatePicker,
    ArchiveType,
    ExpantionPanel,
    ReportMode,
    ViewSettings
  },
  props: {
    task: Object,
    error: {
      type: Object,
      default: () => ({
        name: null,
        timeStart: null,
        timeEnd: null
      })
    }
  },
  data() {
    return {
      name: this.task.name,
      active: this.task.active,
      timeStart: this.task.timeStart,
      timeEnd: this.task.timeEnd,

      archiveType: this.task.archiveType,
      periodType: this.task.periodType,
      contractDay: this.task.contractDay,
      contractMonth: this.task.contractMonth,
      contractHours: this.task.contractHours,
      contractMinutes: this.task.contractMinutes,

      runType: this.task.runType,
      runDataWait: this.task.runDataWait,
      runDataHours: this.task.runDataHours,
      runDataMinutes: this.task.runDataMinutes,
      runPeriod: this.task.runPeriod,
      runDay: this.task.runDay,
      runMonth: this.task.runMonth,
      runHours: this.task.runHours,
      runMinutes: this.task.runMinutes,

      winter: this.task.winter,
      summer: this.task.summer,

      timeType: this.task.timeType,
      addEmptyRows: this.task.addEmptyRows,
      idle: this.task.idle,

      localError: JSON.parse(JSON.stringify(this.error)),

      dateFormat: 'DD.MM.YYYY',
      months: 'Январь_Февраль_Март_Апрель_Май_Июнь_Июль_Август_Сентябрь_Октябрь_Ноябрь_Декабрь'.split('_')
    }
  },
  watch: {
    error: {
      handler(value) {
        this.localError = JSON.parse(JSON.stringify(value))
      },
      deep: true
    },
    'task.name'(r) {
      this.name = r
    },
    'task.active'(r) {
      this.active = r
    },
    'task.timeStart'(r) {
      this.timeStart = r
    },
    'task.timeEnd'(r) {
      this.timeEnd = r
    },
    'task.archiveType'(r) {
      this.archiveType = r
    },
    'task.periodType'(r) {
      this.periodType = r
    },
    'task.contractDay'(r) {
      this.contractDay = r
    },
    'task.contractMonth'(r) {
      this.contractMonth = r
    },
    'task.contractHours'(r) {
      this.contractHours = r
    },
    'task.contractMinutes'(r) {
      this.contractMinutes = r
    },
    'task.runType'(r) {
      this.runType = r
    },
    'task.runDataWait'(r) {
      this.runDataWait = r
    },
    'task.runDataHours'(r) {
      this.runDataHours = r
    },
    'task.runDataMinutes'(r) {
      this.runDataMinutes = r
    },
    'task.runPeriod'(r) {
      this.runPeriod = r
    },
    'task.runDay'(r) {
      this.runDay = r
    },
    'task.runMonth'(r) {
      this.runMonth = r
    },
    'task.runHours'(r) {
      this.runHours = r
    },
    'task.runMinutes'(r) {
      this.runMinutes = r
    },
    'task.winter'(r) {
      this.winter = r
    },
    'task.summer'(r) {
      this.summer = r
    },
    'task.timeType'(r) {
      this.timeType = r
    },
    'task.addEmptyRows'(r) {
      this.addEmptyRows = r
    },
    'task.idle'(r) {
      this.idle = r
    }
  },
  computed: {
    archiveTypes() {
      return matchType(this.$store.state.env.archiveTypes)
    },
    isPeriodSpecified() {
      return this.$store.state.env.reportPeriodTypes.specified.type === this.periodType
    },
    dayVisible() {
      return this.archiveType ? this.archiveTypes.hour !== this.archiveType : false
    },
    monthVisible() {
      return this.archiveType ? this.archiveTypes.month === this.archiveType : false
    },
    reportTaskRunTypes() {
      return matchType(this.$store.state.env.reportTaskRunTypes)
    },
    reportTaskRunPeriodTypes() {
      return matchType(this.$store.state.env.reportTaskRunPeriod)
    },
    byDataDisabled() {
      return this.runType !== this.reportTaskRunTypes.byData
    },
    byTimeDisabled() {
      return this.runType !== this.reportTaskRunTypes.byTime
    }
  },
  methods: {
    onChange(prop, value) {
      this.$emit('changed', prop, value)
    },
    propChange(prop, r) {
      this[prop] = r
      this.$emit('changed', prop, r)
    },
    async save() {
      try {
        this.localError = {}

        const task = new ReportTask({
          name: this.name,
          active: this.active,
          timeStart: this.timeStart,
          timeEnd: this.timeEnd,

          archiveType: this.archiveType,
          periodType: this.periodType,
          contractDay: this.contractDay,
          contractMonth: this.contractMonth,
          contractHours: this.contractHours,
          contractMinutes: this.contractMinutes,

          runType: this.runType,
          runDataWait: this.runDataWait,
          runDataHours: this.runDataHours,
          runDataMinutes: this.runDataMinutes,
          runPeriod: this.runPeriod,
          runDay: this.runDay,
          runMonth: this.runMonth,
          runHours: this.runHours,
          runMinutes: this.runMinutes,

          winter: this.winter,
          summer: this.summer,

          timeType: this.timeType,
          addEmptyRows: this.addEmptyRows,
          idle: this.idle
        })

        await task.save()

        return true
      } catch (error) {
        if (error.response.status === 551) {
          this.localError = error.response.data
        } else {
          this.$store.commit('error', error)
        }
      }
    }
  }
}
</script>

<style scoped>
.task-grid {
  display: grid;
  grid-gap: 5px 3px;
  white-space: nowrap;
  align-items: baseline;
}

.task-grid.two {
  grid-template-columns: min-content 1fr;
}

.task-grid select {
  width: fit-content;
}
</style>
