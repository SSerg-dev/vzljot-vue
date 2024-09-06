<template>
  <div class="component-detail">
    <tool-bar :exportTypes="['csv', 'xls', 'xlsx']" @export="exportArchive">
      <label
        >с:
        <date-picker
          v-model="periodStart"
          :format="dateFormat"
          style="width: 150px"
          @update:modelValue="debounce()"
        />
      </label>
      <label
        >по:
        <date-picker
          v-model="periodEnd"
          :format="dateFormat"
          style="width: 150px"
          @update:modelValue="debounce()"
        />
      </label>
      <label
        >Тип архива:
        <select v-model="archiveType" @change="onChange()">
          <option
            v-for="(key, index) in Object.keys(archiveTypes)"
            :key="index"
            :value="parseInt(key)"
          >
            {{ archiveTypes[key].text }}
          </option>
        </select>
      </label>
      <template v-slot:end>
        <div
          class="button fas fa-cog"
          title="Настройки"
          @click="onSettingsClick()"
        />
      </template>
    </tool-bar>
    <div
      v-if="localItems.length > 0"
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
          >{{ getCellValue(r) }}</span
        >
      </div>
    </div>
    <div v-else class="validation-table-error-container"></div>
    <pager-component v-bind="pageInfo" @go="onChangePage" />
    <transition>
      <wizard
        v-if="wizard"
        v-bind="wizard"
        @cancel="cancelWizard"
        @end="onWizardEnd"
      />
    </transition>
    <spinner :show="wait" :text="'Загрузка архива...'" />
  </div>
</template>

<script>
import DatePicker from '../Inputs/DatePicker.vue'
import ListComponent from '../ListComponent.vue'
import PagerComponent from '../PagerComponent.vue'
import ToolBar from '../ToolBar.vue'
import Wizard from '../Wizard.vue'

import Measure from '../../plugins/measure.js'
import debounce from '../../plugins/debounce.js'
import { getISODateTime } from '../../plugins/api.js'
import Export from '../../plugins/export.js'

const dateTime = new Date()

const wizardSettings = (
  hideEmptyFields,
  hideDeltaFields,
  hideTotalFields,
  measures
) => {
  return {
    name: 'settings',
    component: {
      text: 'Настройки:',
      component: 'archiveSettings',
      event: 'changed',
      data: {
        hideEmptyFields,
        hideDeltaFields,
        hideTotalFields,
        measures,
      },
    },
  }
}

export default {
  components: {
    PagerComponent,
    ToolBar,
    DatePicker,
    Wizard,
  },
  extends: ListComponent,
  props: {
    id: Number,
    type: Number,
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
      archiveType: this.$store.getters.reversedArchiveTypes.day,
      measures: [],
      dateFormat: 'DD.MM.YYYY',
      hideEmptyFields: true,
      hideDeltaFields: false,
      hideTotalFields: true,
      columns: [],
      settingsVisible: false,
      wait: false,
      objectName: null,
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
    exportTypes() {
      return this.$store.state.env.exportTypes
    },
    archiveTypes() {
      return this.$store.state.env.archiveTypes
    },
  },
  watch: {
    archiveType(value) {
      this.dateFormat = this.archiveTypes[value].format
    },
  },
  methods: {
    onSort(sortOrder, index) {
      this.sortOrder = sortOrder
      this.sortIndex = index
      this.columns.forEach((r, i) => (r.active = i === index))
      this.get(1, this.pageInfo.Size)
    },
    onChange() {
      if (this.archiveType === 3) {
        this.periodStart = new Date(
          this.periodStart.getFullYear(),
          this.periodStart.getMonth(),
          1
        )
        this.periodEnd = new Date(
          this.periodEnd.getFullYear(),
          this.periodEnd.getMonth() + 1,
          1,
          0,
          0,
          -1
        )
      }

      this.get(1, this.pageInfo.Size)
    },
    onSettingsClick() {
      this.wizard = wizardSettings(
        this.hideEmptyFields,
        this.hideDeltaFields,
        this.hideTotalFields,
        this.measures
      )
    },
    cancelWizard() {
      this.wizard = null
    },
    onWizardEnd(data, name) {
      this.wizard = null

      if (name === 'settings') {
        this.hideEmptyFields = data.hideEmptyFields
        this.hideDeltaFields = data.hideDeltaFields
        this.hideTotalFields = data.hideTotalFields
        this.measures = JSON.parse(JSON.stringify(data.measures))
        this.get(1, this.pageInfo.Size)
      }
    },
    debounce: debounce(function () {
      this.get(1, this.pageInfo.Size)
    }, 1000),
    async exportArchive(exportType) {
      this.wait = true
      try {
        await this.exporter.post(
          'archive/export',
          Object.assign(this.getParam(), { exportType })
        )
      } catch (error) {
        if (error.response.status === 550) {
          this.$store.commit('notification', {
            title: 'Экспорт архива',
            type: 'error',
            text: await error.response.data.text(),
          })
        } else {
          this.$store.commit('error', error)
        }
      } finally {
        this.wait = false
      }
    },
    hasHint(r) {
      if (r && typeof r === 'object') {
        if (r.value && r.hasOwnProperty('title')) {
          return true
        }
      }
      return false
    },
    getCellValue(r) {
      if (r && typeof r === 'object') {
        if (r.value && r.hasOwnProperty('value')) {
          return r.value
        }
      } else {
        return r
      }
    },
    getCellTitle(r) {
      if (r && typeof r === 'object') {
        if (r.value && r.hasOwnProperty('title')) {
          return r.title
        }
      }
      return null
    },
    async get(page, size) {
      this.wait = true

      try {
        const { data } = await this.$http.post(
          'archive/archive',
          Object.assign(this.getParam(), { pageInfo: { page, size } })
        )
        this.columns = data.data.columns
        this.dataItems = data.data.values
        this.measures = data.data.measures.map((r) => {
          const group = this.$store.state.env.mUnitGroups[r.key]
          return new Measure({
            type: group.value,
            defaultType: r.value,
            caption: group.text,
            measureUnits: group.units.map((unit) => ({
              key: unit,
              value: this.$store.state.env.mUnits[unit].text,
            })),
          })
        })
        this.objectName = data.data.param.objectName

        this.pageInfo = {
          Page: page,
          Items: data.data.param.pageInfo.items,
          Size: size,
        }
      } catch (error) {
        if (error.response.status === 550) {
          this.$store.commit('notification', {
            title: 'Формирование архива',
            type: 'error',
            text: error.response.data,
          })

          this.columns = []
          this.dataItems = []
          this.measures = []
          this.pageInfo = {
            Page: page,
            Items: 0,
            Size: size,
          }
        } else {
          this.$store.commit('error', error)
        }
      } finally {
        this.wait = false
      }
    },
    getParam() {
      let param = {
        id: this.id,
        type: this.type,
        archiveType: this.archiveType,
        periodStart: getISODateTime(this.periodStart),
        periodEnd: getISODateTime(this.periodEnd),
        hideEmptyFields: this.hideEmptyFields,
        hideDeltaFields: this.hideDeltaFields,
        hideTotalFields: this.hideTotalFields,
        objectName: this.objectName,
        sort: this.sortOrder,
        sortIndex: this.sortIndex,
      }

      if (Array.isArray(this.measures) && this.measures.length) {
        param.measures = this.measures.map((r) => ({
          key: r.type,
          value: r.value,
        }))
      }

      return param
    },
  },
}
</script>
