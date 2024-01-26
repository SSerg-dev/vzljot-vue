<template>
  <div class="container">
    <div class="item">
      <h2>SystemPropsPoints component</h2>
    </div>
    <div class="item">
      <tool-bar>
        <div :class="['button', 'fas', 'fa-plus-circle', { disabled: !true }]" title="Добавить..."
          @click="onAddPointClick" />
        <div :class="['button', 'fas', 'fa-times-circle', { disabled: !true }]" title="Удалить"
          @click="onRemovePointClick" />
      </tool-bar>
      <!--  -->
      <div class="table-grid" style="grid-template-columns: repeat(3, max-content)">
        <header class="header">
          <input type="checkbox" />
        </header>
        <header class="header"></header>
        <header class="header">Наименование</header>
        <!-- <div v-for="(r, i) in localPoints" :key="i" class="table-row">
          <span class="cell">
            <input type="checkbox" v-model="r.checked" :disabled="!value.limitPoints" />
          </span>
          <span class="cell icon">
            <div :class="`${getImage(r)} ${r.hasOwnProperty('state') 
              ? $store.state.env.statuses[r.state].class
              : ''
              } table-icon`" />
          </span>
          <span class="cell">{{ r.name }}</span>
        </div> -->
      </div>
      <!--  -->
    </div>
  </div>
</template>

<script>
import ToolBar from '../ToolBar.vue'

export default {
  name: 'system-props-points',
  props: ['item', 'index'],
  data: () => ({
    options: {},
  }),
  methods: {},
  components: {
    ToolBar,
  },
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.container {
  display: flex;
  flex-direction: column;
}

.item {
  border: solid 1px #eee;
  border-radius: 0.2em;
  padding: 10px;
  /* gap: 10px 0; */
  margin: 0 0 10px 0;
}

.button {
  width: min-content;
}
</style>
