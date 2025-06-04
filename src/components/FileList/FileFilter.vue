<template>
  <div class="file-filter" style="overflow: visible">
    <label>Наименование:</label>
    <input v-model="localFilter.name" type="text" @input="onChange" />
    <label>Дата изменения:</label>
    <date-picker v-model="localFilter.timeChanged" format="DD.MM.YYYY" clearable style="width: 90px" @input="onChange" />
    <label>Тип:</label>
    <input v-model="localFilter.type" type="text" @input="onChange" />
  </div>
</template>

<script>
import DatePicker from '../Inputs/DatePicker.vue'

export default {
  components: {
    DatePicker
  },
  props: {
    filter: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      localFilter: JSON.parse(JSON.stringify(this.filter))
    }
  },
  methods: {
    onChange() {
      this.$emit('changed', this.localFilter)
    }
  }
}
</script>

<style scoped>
.file-filter {
  display: grid;
  grid-gap: 5px 3px;
  grid-template-columns: 1fr auto;
}

.file-filter label {
  text-align: right;
}
</style>
