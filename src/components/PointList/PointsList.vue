<template>
  <div class="component-detail">
    <tool-bar>
      <div
        v-if="$store.state.user?.userRights.pollData"
        :class="[
          'button',
          'fas',
          'fa-arrow-alt-circle-right',
          { disabled: !hasSelected || polling },
        ]"
        title="Собрать данные"
        @click="poll()"
      />
      <div
        v-if="$store.state.user?.userRights.pollData"
        :class="['button', 'fas', 'fa-pause-circle', { disabled: !polling }]"
        title="Остановить"
        @click="cancel()"
      />
      <template v-if="$store.state?.user.userRights.measureSchemeList">
        <div v-if="$store.state.user?.userRights.pollData" class="separator" />
        <div
          :class="['button', 'fas', 'fa-plus-circle', { disabled: polling }]"
          title="Добавить..."
          @click="onAddClick"
        />
        <div
          :class="[
            'button',
            'fas',
            'fa-times-circle',
            { disabled: !hasSelected || polling },
          ]"
          title="Удалить"
          @click="onDeleteClick"
        />
        <template v-if="$store.state.user?.userRights.report">
          <div class="separator" />
          <div
            :class="[
              'button',
              'fas',
              'fa-file-alt',
              { disabled: !hasSelected || polling || !hasReports },
            ]"
            title="Сформировать отчет..."
            @click="reportClick"
          />
        </template>
      </template>
      <template v-slot:end>
        <div
          v-if="$store.state.user?.userRights.pollDataManual"
          :class="['button', 'fas', 'fa-cog', { disabled: polling }]"
          title="Настройки"
          @click="onSettingsClick()"
        />
        <div
          v-if="$store.state.user?.userRights.pollDataManual"
          class="separator"
        />
        <div
          :class="[
            'button',
            'fas',
            'fa-filter',
            'remove-sign',
            {
              disabled: !hasFilterChanges,
              right: !$store.state.user?.userRights.pollDataManual,
            },
          ]"
          title="Очистить фильтр"
          @click="onClearFilterClick"
        />
        <div
          :class="['button', 'fas', 'fa-filter']"
          title="Фильтр..."
          @click="onFilterClick"
        />
      </template>
    </tool-bar>
    <div
      class="table-grid"
      :style="`grid-template-columns: repeat(${columnsCount}, max-content)`"
    >
      <header
        class="header sticky-first column"
        :style="`grid-template-columns: repeat(${
          firstColumnsCount - 1
        }, min-content)`"
      >
        <span
          v-if="$store.state.user?.userRights.pollData"
          class="table-icon fas fa-cog"
          style="color: #596673"
        />
        <input
          v-if="$store.state.user?.userRights.measureSchemeList"
          type="checkbox"
          v-model="all"
          @change="changeAll"
          :disabled="polling"
        />
        Точка учета
      </header>
      <header class="header">Объект учета</header>
      <header class="header">Последняя запись архива</header>
      <header class="header">Разница времени (ч)</header>
      <header class="header">Ручной сбор</header>
      <header class="header">Примечание</header>
      <header class="header">Потребитель</header>
      <header class="header" v-for="r in customColumns" :key="r">
        {{ r }}
      </header>
      <div v-for="(r, index) in localItems" :key="index" class="table-row">
        <span
          class="cell sticky-first column"
          :style="`grid-template-columns: repeat(${firstColumnsCount}, min-content)`"
        >
          <span
            v-if="$store.state.user?.userRights.pollData"
            :class="r.task.class"
            :style="{ color: r.task.style.color }"
            :title="r.task.text"
          />
          <input
            v-if="
              $store.state.user?.userRights.measureSchemeList ||
              $store.state.user?.userRights.pollData
            "
            type="checkbox"
            v-model="r.checked"
            :disabled="polling"
          />
          <span
            :class="`fas fa-circle ${
              $store.state.env.statuses[r.state].class
            } table-icon`"
          />
          <span :class="getImage(r)" />
          <a @click="loadPoint(r.id)" href="#">{{ r.name }}</a>
        </span>
        <span class="cell">
          <a @click="loadNode(r.node.id)" href="#">{{ r.node.fullName }}</a>
        </span>
        <span class="cell">{{
          r.lastArchiveTime ? new Date(r.lastArchiveTime).toLocaleString() : ''
        }}</span>
        <span class="cell">{{ r.timeOffset }}</span>
        <span class="cell">{{
          r.pollSource & 512 ? 'Да' : r.pollSource & 256 ? 'Нет' : ''
        }}</span>
        <span class="cell">{{ r.note }}</span>
        <span class="cell">{{ r.consumer }}</span>
        <span
          class="cell"
          v-for="(prop, propIndex) in customColumns"
          :key="'p' + propIndex"
          >{{ r.custom[propIndex].value }}</span
        >
      </div>
    </div>
    <pager-component v-bind="pageInfo" @go="onChangePage" />
    <transition-group>
      <div
        v-if="isReport"
        style="
          display: flex;
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(169, 175, 183, 0.7);
          padding: 15px;
          z-index: 5;
        "
      >
        <div
          style="
            flex: 1;
            flex-direction: column;
            width: 100%;
            position: relative;
          "
        >
          <report-component
            v-bind="reportData"
            @cancel="onReportCancel"
            @close="onReportClose"
            @reportLoaded="onReportLoaded"
          />
        </div>
      </div>
      <wizard
        v-if="wizard"
        v-bind="wizard"
        @cancel="cancelWizard"
        @end="onWizardEnd"
      />
    </transition-group>
  </div>
</template>

<script>
import { matchType } from '../../plugins/api.js'
import { store } from '@/store/store'

let abortController = new AbortController()

import ListComponent from '../ListComponent.vue'
import PagerComponent from '../PagerComponent.vue'
import ToolBar from '../ToolBar.vue'
import ReportComponent from '../Report/ReportComponent.vue'
import Wizard from '../Wizard.vue'
import { wizardSettings } from '@/plugins/wizardComponents/wizardSettings'

const reportTypes = matchType(store.state.env.reportTypes)

const wizardDeletePoints = () => {
  return {
    name: 'remove',
    component: {
      text: 'Удаление точек учета:',
      component: 'message',
      data: {
        text: 'Вы действительно хотите удалить выбранные точки учета?',
      },
    },
  }
}

const wizardAddPoints = (http, points) => {
  return {
    name: 'add',
    component: {
      text: 'Выбор точек учета:',
      component: 'selector',
      event: 'selectionChanged',
      data: {
        loader: async () => {
          let { data } = await http.get('pointList/points')
          return data
            .filter((r) => !points.includes(r.id))
            .sort((a, b) => {
              if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
              if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
            })
        },
        searchColumn: 'name',
        columns: [
          {
            prop: 'name',
            text: 'Наименование',
          },
        ],
      },
    },
  }
}

const wizardFilter = (filter, types) => {
  return {
    name: 'filter',
    component: {
      text: 'Фильтр:',
      component: 'pointListFilter',
      event: 'changed',
      data: {
        filter,
        types,
      },
    },
  }
}

export default {
  components: {
    PagerComponent,
    ToolBar,
    ReportComponent,
    Wizard,
  },
  extends: ListComponent,
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    settings: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      filter: this.emptyFilter(),
      localSettings: null,
      isReport: false,
      polling: false,
      all: false,
      reportLoaded: false,
      wizard: null,
    }
  },
  computed: {
    reportData() {
      const rows = this.dataItems.filter((r) => r.checked === true)

      return rows.length > 0
        ? {
            ids: rows.map((r) => r.id),
            objType:
              rows.length > 1
                ? this.reportObjectTypes.listOfMeasureSchemes
                : this.reportObjectTypes.measureScheme,
            reportTypes:
              rows.length > 1 ? [reportTypes.summary] : rows[0].reportTypes,
            background: `rgba(169, 175, 183, ${
              this.reportLoaded ? '0.7' : '0'
            })`,
            cancellable: true,
          }
        : null
    },
    firstColumnsCount() {
      let count = 5

      if (!this.$store.state.user?.userRights.measureSchemeList) {
        count--
      }

      if (!this.$store.state.user?.userRights.pollData) {
        count--
      }

      return count
    },
    columnsCount() {
      return 7 + this.customColumns.length
    },
    customColumns() {
      if (this.dataItems.length > 0) {
        return this.dataItems[0].custom.map((it) => it.name)
      } else {
        return []
      }
    },
    reportObjectTypes() {
      return matchType(this.$store.state.env.reportObjectTypes)
    },
    hasReports() {
      let result = false

      const items = this.dataItems.filter((r) => r.checked === true)

      if (items.length > 0) {
        if (items.length === 1) {
          result = items[0].reportTypes.length > 0
        } else {
          result = true
        }
      }

      return result
    },
    types() {
      const set = new Set(this.dataItems.map((r) => r.systemType))

      let arr = [...set].map((r) => ({
        value: r,
        text: this.$store.state.env.pointTypes[r]?.text,
      }))
      arr.unshift({ value: null, text: '(Все)' })
      arr.sort((a, b) => {
        if (a.text.toLowerCase() < b.text.toLowerCase()) return -1
        if (a.text.toLowerCase() > b.text.toLowerCase()) return 1
      })
      return arr
    },
    filteredItems() {
      let rows = this.dataItems.slice(0).sort(this.sort)

      rows = rows.filter((r) => r.visible)

      if (this.filter.state > -1) {
        rows = rows.filter((r) => r.state === this.filter.state)
      }

      if (this.filter.systemType !== null) {
        rows = rows.filter((r) => r.systemType === this.filter.systemType)
      }

      if (this.filter.periodStart) {
        const periodStart = new Date(this.filter.periodStart)
        rows = rows.filter(
          (r) =>
            new Date(r.lastArchiveTime) >=
            new Date(
              periodStart.getFullYear(),
              periodStart.getMonth(),
              periodStart.getDate(),
              0,
              0,
              0
            )
        )
      }

      if (this.filter.periodEnd) {
        const periodEnd = new Date(this.filter.periodEnd)
        rows = rows.filter(
          (r) =>
            new Date(r.lastArchiveTime) <=
            new Date(
              periodEnd.getFullYear(),
              periodEnd.getMonth(),
              periodEnd.getDate(),
              23,
              59,
              59
            )
        )
      }

      if (this.filter.node) {
        rows = rows.filter(
          (r) =>
            r.node.fullName
              .toLowerCase()
              .indexOf(this.filter.node.toLowerCase()) >= 0
        )
      }

      if (this.filter.point) {
        rows = rows.filter(
          (r) =>
            r.name.toLowerCase().indexOf(this.filter.point.toLowerCase()) >= 0
        )
      }

      if (this.filter.pollSource !== null) {
        rows = rows.filter((r) => r.pollSource === this.filter.pollSource)
      }

      if (this.filter.consumer) {
        rows = rows.filter(
          (r) =>
            r.consumer !== null &&
            r.consumer
              .toLowerCase()
              .indexOf(this.filter.consumer.toLowerCase()) >= 0
        )
      }

      return rows
    },
  },
  watch: {
    settings: {
      handler(settings) {
        this.localSettings = JSON.parse(JSON.stringify(settings))
      },
      deep: true,
    },
  },
  created() {
    this.$emitter.on('message', this.processMessage)
    this.$emitter.on('si', this.onSi)
  },
  beforeUnmount() {
    this.cancel()

    this.$emitter.off('message', this.processMessage)
    this.$emitter.off('si', this.onSi)
  },
  methods: {
    cancel() {
      abortController.abort()
    },
    emptyFilter() {
      return {
        state: parseInt(Object.keys(this.$store.state.env.statuses).sort()[0]),
        systemType: null,
        point: null,
        node: null,
        pollSource: null,
        periodStart: null,
        periodEnd: null,
        consumer: null,
      }
    },
    onSi(message) {
      if (
        message &&
        message.event === 'update' &&
        this.$store.state.env.itemTypes[message.type].type === 'point'
      ) {
        this.dataItems
          .filter((r) => r.id === message.item.id)
          .forEach((r) => (r.state = message.item.state))
      }
    },
    onReportLoaded() {
      this.reportLoaded = true
    },
    onReportClose() {
      this.reportLoaded = false
      this.isReport = false
    },
    onReportCancel(hasReport) {
      if (!hasReport) {
        this.reportLoaded = false
        this.isReport = false
      }
    },
    cancelWizard() {
      this.wizard = null
    },
    onWizardEnd(data, name) {
      this.wizard = null

      if (name === 'remove') {
        this.$emit(
          'remove',
          this.dataItems.filter((r) => r.checked === true).map((r) => r.id)
        )
      } else if (name === 'settings') {
        if (data !== null) {
          this.localSettings = data
        }
      } else if (name === 'add') {
        this.$emit(
          'add',
          data.map((r) => r.id)
        )
      } else if (name === 'filter') {
        if (data !== null) {
          this.filter = data
        }
      }
    },
    onAddClick() {
      this.wizard = wizardAddPoints(
        this.$http,
        this.dataItems.map((r) => r.id)
      )
    },
    onDeleteClick() {
      this.wizard = wizardDeletePoints()
    },
    onFilterClick() {
      this.wizard = wizardFilter(this.filter, this.types)
    },
    onSettingsClick() {
      this.wizard = wizardSettings(this.localSettings)
    },
    reportClick() {
      this.isReport = true
    },
    loadNode(id) {
      window.open(`${window.props.baseUrl}Node/NodeDetailAlone/${id}`, '_blank')
    },
    loadPoint(id) {
      window.open(
        `${window.props.baseUrl}Point/PointDetailAlone/${id}`,
        '_blank'
      )
    },
    processMessage(message) {
      if (message.data.action === 'pollPointList') {
        if (message.data.state === 'success') {
          message.data.points.forEach((point) => {
            const row = this.dataItems.find((r) => r.id === point.id)
            if (row) {
              row.lastArchiveTime = point.lastArchiveTime
              row.task.success(message.data.text)
            }
          })
        } else {
          message.data.pointIds.forEach((id) => {
            const row = this.dataItems.find((r) => r.id === id)
            if (row) {
              if (message.data.state === 'stopped') {
                row.task.stop(message.data.text)
              } else if (message.data.state === 'error') {
                row.task.error(message.data.text)
              } else if (message.data.state === 'warning') {
                row.task.warning(message.data.text)
              }
            }
          })
        }
      }
    },
    async poll() {
      this.dataItems.filter((r) => r.checked).forEach((r) => r.task.poll())
      this.polling = true

      try {
        abortController = new AbortController()

        const settings = JSON.parse(JSON.stringify(this.localSettings))

        settings.timeFrom = new Date(settings.timeFrom).getTime()
        settings.timeTo = new Date(settings.timeFrom).getTime()

        await this.$http.post(
          'pointList/poll',
          {
            ids: this.dataItems
              .filter((row) => row.checked)
              .map((row) => row.id),
            settings,
          },
          { signal: abortController.signal }
        )
      } catch (error) {
        this.dataItems.forEach((r) => r.task.stop(error))
        if (!abortController.signal.aborted) {
          this.$store.commit('error', error)
        }
      } finally {
        this.polling = false
      }
    },
  },
}
</script>

<style scoped>
.column {
  display: grid;
  gap: 6px;
}
</style>
