<template>
  <div class="component-detail">
    <div class="table-grid" :style="{ 'grid-template-columns': `repeat(3, max-content)` }">
      <header class="header" />
      <header class="header" />
      <header class="header">Точки учета</header>
      <div v-for="(r, index) in localItems" :key="index" class="table-row">
        <span class="cell icon">
          <span :class="`fas fa-circle ${r.hasOwnProperty('state') ? $store.state.env.statuses[r.state].class : ''} table-icon`" />
        </span>
        <span class="cell icon">
          <span :class="`fas ${getImage(r)} table-icon`" />
        </span>
        <span class="cell"
          ><a href="#" @click="loadPoint(r)">{{ r.name }}</a></span
        >
      </div>
    </div>
    <pager v-bind="pageInfo" @go="onChangePage" />
  </div>
</template>

<script>
import ListComponent from '../ListComponent.vue'
import Pager from '../PagerComponent.vue'

export default {
  components: {
    Pager
  },
  extends: ListComponent,
  methods: {
    loadPoint(point) {
      window.open(`${window.props.baseUrl}Point/PointDetailAlone/${point.id}`, '_blank')
    }
  }
}
</script>
