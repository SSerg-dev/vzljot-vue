<template>
  <div class="point-list-filter">
    <label>Состояние:</label>
    <select v-model="values.state" @change="onChange">
      <option v-for="key in Object.keys($store.state.env.statuses).sort()" :key="key" :value="parseInt(key)">{{ $store.state.env.statuses[key].text }}</option>
    </select>
    <label>Тип:</label>
    <select v-model="values.systemType" @change="onChange">
      <option v-for="(r, index) in values.types" :key="index" :value="r.value">{{ r.text }}</option>
    </select>
    <label>Объект учета:</label>
    <input v-model="values.node" type="text" @input="onChange" />
    <label>Точка учета:</label>
    <input v-model="values.point" type="text" @input="onChange" />
    <label>Ручной сбор:</label>
    <select v-model="values.pollSource" @change="onChange">
      <option :value="null">(Все)</option>
      <option :value="256">Нет</option>
      <option :value="512">Да</option>
    </select>
    <label>Начало:</label>
    <date-picker v-model="values.periodStart" format="DD.MM.YYYY" clearable @update:modelValue="onChange" />
    <label>Окончание:</label>
    <date-picker v-model="values.periodEnd" format="DD.MM.YYYY" clearable @update:modelValue="onChange" />
    <label>Потребитель:</label>
    <input v-model="values.consumer" type="text" @input="onChange" />
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
    },
    types: {
      type: Array,
      default: () => []
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

.point-list-filter .datepicker {
  width: 90px;
}
</style>
