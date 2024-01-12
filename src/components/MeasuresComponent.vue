<template>
  <div class="measure-grid" v-if="Math.max(...measures.map(r => r.items.length), 1) > 1">
    <template v-for="(item, index) in measures" :key="index">
      <label v-if="item.items.length > 1">{{ item.text }}:</label>
      <select v-if="item.items.length > 1" v-model="item.value" @change="onChange">
        <option v-for="unit in item.items" :key="unit.value" :value="unit.value">{{ unit.text }}</option>
      </select>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    measures: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    onChange() {
      this.$emit('changed', this.measures)
    }
  }
}
</script>

<style scoped>
.measure-grid {
  display: grid;
  grid-gap: 5px 3px;
  grid-template-columns: max-content auto;
}

.measure-grid label {
  text-align: right;
}

.measure-grid select {
  width: fit-content;
}
</style>
