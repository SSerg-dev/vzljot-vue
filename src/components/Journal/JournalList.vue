<template>
  <div class="component-detail">
    <tool-bar>
      <template v-slot:end>
        <div :class="['button', 'fas', 'fa-filter', 'remove-sign', { disabled: !hasFilterChanges }]" title="Очистить фильтр" @click="onClearFilterClick" />
        <div :class="['button', 'fas', 'fa-filter']" title="Фильтр..." @click="onFilterClick" />
      </template>
    </tool-bar>
    <div class="table-grid" :style="{ 'grid-template-columns': `repeat(${columns.length}, max-content)` }">
      <header v-for="(r, i) in columns" :key="i" :class="{ header: true, active: r.active }">
        <template v-if="r.hasOwnProperty('sortOrder')">
          <span style="flex: 1">{{ r.text }}</span>
          <span :title="sortTitle[r.sortOrder]" :class="['arrow', 'fas', sortAccordance[r.sortOrder]]" @click="onSort(r.sortOrder === 'desc' ? 'asc' : 'desc', i)"></span>
        </template>
        <template v-else>
          {{ r.text }}
        </template>
      </header>
      <div v-for="(r, rowIndex) in localItems" class="table-row" :key="rowIndex">
        <span v-for="(column, columnIndex) in columns" class="cell" :key="columnIndex">{{ r[column.prop] }}</span>
      </div>
    </div>
    <pager v-bind="pageInfo" @go="onChangePage" />
    <spinner :show="showLoader" :text="'Загрузка журнала...'" />
    <transition>
      <wizard v-if="wizard" v-bind="wizard" @cancel="cancelWizard" @end="onWizardEnd" />
    </transition>
  </div>
</template>

<script>
import ListComponent from '../ListComponent.vue'
import Pager from '../PagerComponent.vue'
import ToolBar from '../ToolBar.vue'
import Wizard from '../Wizard.vue'

const wizardFilter = filter => {
  return {
    name: 'filter',
    component: {
      text: 'Фильтр:',
      component: 'JournalFilter',
      event: 'changed',
      data: {
        filter
      }
    }
  }
}

export default {
  components: {
    Pager,
    ToolBar,
    Wizard
  },
  props: {
    id: Number,
    type: String,
    periodStart: Date,
    periodEnd: Date
  },
  extends: ListComponent,
  data() {
    return {
      filter: this.emptyFilter(),
      dateFormat: 'DD.MM.YYYY',
      showLoader: false,
      wizard: null,
      sortOrder: 'desc',
      sortIndex: 0,
      columns: [
        { prop: 'timeRecieve', text: 'Получение', sortOrder: 'desc', active: true },
        { prop: 'objectType', text: 'Тип объекта' },
        { prop: 'objectText', text: 'Объект' },
        { prop: 'message', text: 'Сообщение' },
        { prop: 'status', text: 'Статус' },
        { prop: 'timeEvent', text: 'Возникновение', sortOrder: 'asc', active: false }
      ],
      sortAccordance: {
        asc: 'fa-arrow-up',
        desc: 'fa-arrow-down'
      },
      sortTitle: {
        asc: 'По возрастанию',
        desc: 'По убыванию'
      }
    }
  },
  methods: {
    onSort(sortOrder, index) {
      this.sortIndex = index
      this.columns[index].sortOrder = sortOrder
      this.columns.forEach((r, i) => (r.active = i === index))
      this.get(1, this.pageInfo.Size)
    },
    onFilterClick() {
      this.wizard = wizardFilter(this.filter)
    },
    emptyFilter() {
      return {
        periodStart: this.periodStart,
        periodEnd: this.periodEnd
      }
    },
    cancelWizard() {
      this.wizard = null
    },
    onWizardEnd(data, name) {
      this.wizard = null

      if (name === 'filter' && data) {
        this.filter = data
        this.get(1, this.pageInfo.Size)
      }
    },
    async get(page, size) {
      this.showLoader = true

      try {
        const { data } = await this.$http.post('systemMessage/logs', {
          id: this.id,
          type: this.type,
          periodStart: this.filter.periodStart,
          periodEnd: this.filter.periodEnd,
          sort: this.columns[this.sortIndex].sortOrder,
          sortIndex: this.sortIndex,
          pageInfo: {
            page,
            size
          }
        })

        this.dataItems = data.values

        this.pageInfo = {
          Page: page,
          Items: data.pageInfo.Items,
          Size: size
        }

      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.showLoader = false
      }
    }
  }
}
</script>
