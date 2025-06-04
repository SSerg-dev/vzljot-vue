<template>
  <div class="component-detail">
    <tool-bar v-if="$store.state.user?.userRights.setEdit">
      <div :class="['button', 'fas', 'fa-plus-circle', { disabled: wait }]" title="Добавить..." @click="$emit('add')" />
      <div :class="['button', 'fas', 'fa-times-circle', { disabled: !isAnyParam || wait }]" title="Удалить" @click="$emit('remove')" />
    </tool-bar>
    <div class="table-grid" :style="`grid-template-columns: repeat(${$store.state.user?.userRights.setEdit ? 3 : 2}, max-content)`">
      <header class="header"></header>
      <header class="header" v-if="$store.state.user?.userRights.setEdit"><input type="checkbox" v-model="all" @change="changeAll" :disabled="wait" /></header>
      <header class="header">Наименование</header>
      <div v-for="(r, index) in localItems" :key="index" class="table-row">
        <span class="cell icon">
          <div :class="`${getImage(r)} ${$store.state.env.statuses[r.state].class} table-icon`" />
        </span>
        <span class="cell" v-if="$store.state.user?.userRights.setEdit">
          <input type="checkbox" v-model="r.checked" :disabled="wait" />
        </span>
        <span class="cell">{{ r.name }}</span>
      </div>
    </div>
    <pager-component v-bind="pageInfo" @go="onChangePage" />
  </div>
</template>

<script>

import ListComponent from '../ListComponent.vue'
import ToolBar from '../ToolBar.vue'
import PagerComponent from '../PagerComponent.vue'

export default {
  components: {
    ToolBar,
    PagerComponent
  },
  extends: ListComponent,
  data() {
    return {
      wait: false
    }
  },
  computed: {
    isAnyParam() {
      return this.dataItems.some(r => r.checked === true)
    }
  }
}
</script>
