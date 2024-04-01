<template>
  <div class="component-detail">
    <tool-bar>
      <div
        :class="['button', 'fas', 'fa-plus-circle', { disabled: busy }]"
        title="Добавить..."
        @click="onAddParamClick()"
      />
      <div
        :class="[
          'button',
          'fas',
          'fa-times-circle',
          { disabled: !isAnyParam || busy },
        ]"
        title="Удалить"
        @click="onRemoveParamClick()"
      />
    </tool-bar>
    <div class="table-grid">
      <header class="header"></header>
      <header class="header">Дата ввода</header>
      <header class="header">Разрешить пропускать проверку настроек</header>
      <header class="header">Наименование</header>
      <header class="header header-value">Значение</header>

      <div
        v-for="(r, i) in localParams"
        :key="i"
        class="table-row"
        :ref="(el) => (rowsElement[r.id] = el)"
      >
        <span class="cell icon">
          <div
            :class="r.task.class"
            :style="{ color: r.task.style.color }"
            :title="r.task.text"
          />
        </span>
        <span class="cell cell-value" style="justify-content: center">{{
          r.time
        }}</span>
        <span class="cell">
          <input type="checkbox" v-model="r.checked" :disabled="busy" />
        </span>
        <span class="cell">{{ r.name }}</span>
        <span class="cell">{{ r.value }}</span>
      </div>
    </div>

    <pager-component v-bind="pageInfo" @go="onChangePage" />
    <spinner :show="wait" :text="'Загрузка данных...'" />

    <transition>
      <wizard
        v-if="wizard"
        v-bind="wizard"
        @cancel="cancelWizard"
        @end="onWizardEnd"
      />
    </transition>
  </div>
</template>

<script>

let cancel = null

import ToolBar from '../ToolBar.vue'
import PagerComponent from '../PagerComponent.vue'
import Wizard from '../Wizard.vue'





export default {
  name: 'setParams',
  components: {
    PagerComponent, 
    ToolBar,
    Wizard,
  },
  props: {
    set: Object,
  },
  data() {
    return {
      wait: false,
      wizard: null,
      pageInfo: JSON.parse(JSON.stringify(this.$store.getters.pageInfo)),
      busy: false,
      rowsElement: {},
    }
  },
  created() {
    this.$emitter.on('message', this.processMessage)

    this.$watch(
      () => this.set.params.length,
      () => (this.pageInfo.Items = this.set.params.length)
    )

    this.pageInfo.Items = this.set.params.length
  },
  computed: {
  
    localParams() {
      const firstIndex = (this.pageInfo.Page - 1) * this.pageInfo.Size
      const lastIndex =
        this.pageInfo.Page * this.pageInfo.Size > this.set.params.length
          ? this.set.params.length
          : this.pageInfo.Page * this.pageInfo.Size

      return this.set.params.slice(firstIndex, lastIndex)
    },
  },
  beforeUnmount() {
    if (cancel) this.cancel()
  },
  methods: {
    onChangePage(page, size) {
      this.pageInfo.Size = size
      this.pageInfo.Page = page
    },

  },
}
</script>

<style scoped>
.table-grid {
  grid-template-columns: repeat(4, max-content) minmax(max-content, 1fr);
}
.header-value {
  justify-content: left;
}
</style>
