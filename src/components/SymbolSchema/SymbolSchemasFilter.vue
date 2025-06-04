<template>
  <div class="filter">
    <label>Наименование:</label>
    <input v-model="values.name" type="text" @input="onChange" />
    <label>Тип мнемосхемы:</label>
    <select v-model="values.purposeGroup" @change="onChange">
      <option v-for="r of types" :key="r.type" :value="r.type">{{ r.text }}</option>
    </select>
    <label>Модель прибора:</label>
    <input v-model="values.objectName" type="text" @input="onChange" />
  </div>
</template>

<script>
export default {
  props: {
    filter: {
      purposeGroup: Object,
      default: () => {}
    }
  },
  computed: {
    types() {
      const local = JSON.parse(JSON.stringify(this.$store.state.env.setTypes))
      return Object.keys(local)
        .filter(r => ['none', 'equipType', 'equipGroup'].includes(local[r].type))
        .map(r => {
          if (local[r].type === 'none') {
            local[r].text = 'Шаблон'
          }
          return local[r]
        })
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
.filter {
  display: grid;
  grid-gap: 5px 3px;
  grid-template-columns: 1fr auto;
}

.filter label {
  text-align: right;
}
</style>
