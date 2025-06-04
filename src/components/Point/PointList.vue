<template>
  <div class="component-detail">
    <tool-bar>
      <template v-slot:end>
        <div
          :class="[
            'button',
            'fas',
            'fa-filter',
            'remove-sign',
            { disabled: !hasFilterChanges },
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
      :style="{ 'grid-template-columns': `repeat(4, max-content)` }"
    >
      <header class="header" />
      <header class="header" />
      <header class="header">Точки учета</header>
      <header class="header">Объект учета</header>

      <div v-for="r in localItems" class="table-row" :key="r.id">
        <span class="cell icon">
          <span
            :class="`fas fa-circle ${
              r.hasOwnProperty('state')
                ? $store.state.env.statuses[r.state].class
                : ''
            } table-icon`"
          />
        </span>
        <span class="cell icon">
          <span :class="`fas ${getImage(r)} table-icon`" />
        </span>
        <span class="cell"
          ><a href="#" @click="loadPoint(r)">{{ r.name }}</a></span
        >
        <span class="cell"
          ><a href="#" @click="loadNode(r)">{{ r.node }}</a></span
        >
      </div>
    </div>
    <pager-component v-bind="pageInfo" @go="onChangePage" />
    <transition>
      <wizard
        v-if="wizard"
        v-bind="wizard"
        @cancel="cancelWizard"
        @end="onWizardEnd"
      />
    </transition>
    <transition>
      <spinner :show="loading" :text="'Загрузка...'" />
    </transition>
  </div>
</template>

<script>
import ListComponent from '../ListComponent.vue'
import PagerComponent from '../PagerComponent.vue'
import ToolBar from '../ToolBar.vue'
import Wizard from '../Wizard.vue'

const wizardFilter = (filter) => {
  return {
    name: 'filter',
    component: {
      text: 'Фильтр:',
      component: 'pointsFilter',
      event: 'changed',
      data: {
        filter,
      },
    },
  }
}

export default {
  components: {
    PagerComponent,
    ToolBar,
    Wizard,
  },
  extends: ListComponent,
  props: {
    id: Number,
    type: Number,
  },
  data() {
    return {
      filter: this.emptyFilter(),
      loading: true,
      wizard: null,
    }
  },
  computed: {
    filteredItems() {
      let rows = this.dataItems.slice(0).sort(this.sort)

      if (this.filter.state > -1) {
        rows = rows.filter((r) => r.state === this.filter.state)
      }

      if (this.filter.node) {
        rows = rows.filter(
          (r) =>
            r.node.toLowerCase().indexOf(this.filter.node.toLowerCase()) >= 0
        )
      }

      if (this.filter.name) {
        rows = rows.filter(
          (r) =>
            r.name.toLowerCase().indexOf(this.filter.name.toLowerCase()) >= 0
        )
      }

      return rows
    },
  },
  mounted() {
    this.load(this.id, this.type)
  },
  methods: {
    emptyFilter() {
      return {
        state: parseInt(Object.keys(this.$store.state.env.statuses).sort()[0]),
        name: null,
        node: null,
      }
    },
    onFilterClick() {
      this.wizard = wizardFilter(this.filter)
    },
    cancelWizard() {
      this.wizard = null
    },
    onWizardEnd(data, name) {
      this.wizard = null

      if (name === 'filter') {
        if (data !== null) {
          this.filter = data
        }
      }
    },
    async load(id, objType) {
      try {
        const type = this.$store.state.env.itemTypes[objType].type
        if (type === 'points') {
          const { data } = await this.$http.get('point/points')
          this.dataItems = data
        } else if (type === 'address') {
          const { data } = await this.$http.get('address/points', {
            params: { id },
          })
          this.dataItems = data
        }

        this.loading = false
      } catch (error) {
        this.$store.commit('error', error)
      }
    },
    loadPoint(point) {
      window.open(
        `${window.props.baseUrl}Point/PointDetailAlone/${point.id}`,
        '_blank'
      )
    },
    loadNode(point) {
      window.open(
        `${window.props.baseUrl}Node/NodeDetailAlone/${point.nodeId}`,
        '_blank'
      )
    },
  },
}
</script>
