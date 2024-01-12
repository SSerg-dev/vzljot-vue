<template>
  <div class="filter">
    <label>Наименование:</label>
    <input v-model="values.name" @input="onChange" type="text" />
    <label>Тип набора:</label>
    <select v-model="values.type" @input="onChange">
      <option v-for="r of types" :key="r.type" :value="r.type">{{ r.text }}</option>
    </select>
    <label>Модель прибора:</label>
    <input v-model="values.objectName" @input="onChange" type="text" />
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
  data() {
    return {
      values: JSON.parse(JSON.stringify(this.filter))
    }
  },
  computed: {
    types() {
      let local = JSON.parse(JSON.stringify(this.$store.state.env.setTypes))
      return Object.keys(local)
        .filter(r => !['none', 'measureScheme', 'measureSchemeGroup'].includes(local[r].type))
        .map(r => {
          return local[r]
        })
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
