<template>
  <div class="filter">
    <label>Получение:</label>
    <div class="filter">
      <date-picker v-model="values.timeRecieveStart" style="width: 90px;" format="DD.MM.YYYY" @input="onChange" clearable/>
      <date-picker v-model="values.timeRecieveEnd" style="width: 90px;" format="DD.MM.YYYY" @input="onChange" clearable/>
    </div>
    <label>Тип объекта:</label>
    <input v-model="values.objectTypeText" type="text" @input="onChange" />
    <label>Объект:</label>
    <input v-model="values.objectText" type="text" @input="onChange" />
    <label>Сообщение:</label>
    <input v-model="values.message" type="text" @input="onChange" />
    <label>Статус:</label>
    <input v-model="values.status" type="text" @input="onChange" />
    <label>Возникновение:</label>
    <div class="filter">
      <date-picker v-model="values.timeEventStart" style="width: 90px;" format="DD.MM.YYYY" @input="onChange" clearable/>
      <date-picker v-model="values.timeEventEnd" style="width: 90px;" format="DD.MM.YYYY" @input="onChange" clearable/>
    </div>
    <label>Источник:</label>
    <input v-model="values.sourceText" type="text" @input="onChange" />
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
  .filter {
    display: grid;
    grid-gap: 5px 3px;
    grid-template-columns: 1fr auto;
  }

  .filter label {
    text-align: right;
  }
</style>