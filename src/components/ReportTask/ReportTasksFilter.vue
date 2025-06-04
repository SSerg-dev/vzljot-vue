<template>
  <div class="report-tasks-filter">
    <label>Наименование:</label>
    <input v-model="values.name" type="text" @input="onChange" maxlength="50"/>
    <label>Включено:</label>
    <select v-model="values.active" @change="onChange">
      <option :value="null">(Все)</option>
      <option :value="true">Да</option>
      <option :value="false">Нет</option>
    </select>
  </div>
</template>

<script>
  export default {
    name: 'reportTasksFilter',
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
  .report-tasks-filter {
    display: grid;
    grid-gap: 5px 3px;
    grid-template-columns: 1fr auto;
  }

  .report-tasks-filter > label {
    text-align: right;
  }

  .report-tasks-filter > select {
    width: fit-content;
  }
</style>