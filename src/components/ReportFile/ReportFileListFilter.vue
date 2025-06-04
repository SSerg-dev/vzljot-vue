<template>
  <div class="report-file-list-filter" style="overflow: visible">
    <label v-if="$store.state.user?.userRights.allowCryptSign">Подписал:</label>
    <input v-if="$store.state.user?.userRights.allowCryptSign" v-model="values.subject" type="text" @input="onChange" />
    <label>Точка учета/прибор:</label>
    <input v-model="values.objectName" type="text" @input="onChange" />
    <label>Отчетная форма:</label>
    <input v-model="values.reportName" type="text" @input="onChange" />
    <label>Задание:</label>
    <input v-model="values.taskName" type="text" @input="onChange" />
    <label>Данные:</label>
    <select v-model="values.source" @change="onChange">
      <option v-for="key in Object.keys($store.state.env.reportDataSource)" :key="key" :value="key">
        {{ $store.state.env.reportDataSource[key].text }}
      </option>
    </select>
    <label>Начало:</label>
    <div class="report-file-list-filter">
      <date-picker v-model="values.timeStartFrom" format="DD.MM.YYYY" clearable style="width: 90px" @input="onChange" />
      <date-picker v-model="values.timeStartTo" format="DD.MM.YYYY" clearable style="width: 90px" @input="onChange" />
    </div>
    <label>Окончание:</label>
    <div class="report-file-list-filter">
      <date-picker v-model="values.timeEndFrom" format="DD.MM.YYYY" clearable style="width: 90px" @input="onChange" />
      <date-picker v-model="values.timeEndTo" format="DD.MM.YYYY" clearable style="width: 90px" @input="onChange" />
    </div>
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
.report-file-list-filter {
  display: grid;
  grid-gap: 5px 3px;
  grid-template-columns: 1fr auto;
}

.report-file-list-filter > label {
  text-align: right;
}

.report-file-list-filter > select {
  width: fit-content;
}
</style>
