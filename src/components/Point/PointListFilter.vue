<template>
  <div class="point-list-filter">
    <label>Состояние:</label>
    <select v-model="values.state" @change="onChange">
      <option v-for="key in Object.keys($store.state.env.statuses).sort()" :key="key" :value="parseInt(key)">{{ $store.state.env.statuses[key].text }}</option>
    </select>
    <label>Объект учета:</label>
    <input v-model="values.node" type="text" @input="onChange" />
    <label>Точка учета:</label>
    <input v-model="values.name" type="text" @input="onChange" />
  </div>
</template>

<script>

export default {
  props: {
    filter: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      values: JSON.parse(JSON.stringify(this.filter))
    }
  },
  methods: {
    onChange() {
      this.$emit('changed', this.values)
    }
  }
}
</script>

<style scoped>
.point-list-filter {
  display: grid;
  grid-gap: 5px 3px;
  grid-template-columns: 1fr auto;
}

.point-list-filter label {
  text-align: right;
}

.point-list-filter select {
  width: fit-content;
}
</style>
