<template>
  <div class="states-filter">
    <label>Получение:</label>
    <div class="states-filter">
      <date-picker v-model="values.recieveFrom" style="width: 90px;" format="DD.MM.YYYY" @input="onChange" clearable/>
      <date-picker v-model="values.recieveTo" style="width: 90px;" format="DD.MM.YYYY" @input="onChange" clearable/>
    </div>
    <label>Тип объекта:</label>
    <input v-model="values.objType" type="text" @input="onChange" />
    <label>Объект:</label>
    <input v-model="values.obj" type="text" @input="onChange" />
    <label>Сообщение:</label>
    <input v-model="values.message" type="text" @input="onChange" />
    <label>Возникновение:</label>
    <div class="states-filter">
      <date-picker v-model="values.eventFrom" style="width: 90px;" format="DD.MM.YYYY" @input="onChange" clearable/>
      <date-picker v-model="values.eventTo" style="width: 90px;" format="DD.MM.YYYY" @input="onChange" clearable/>
    </div>
    <label>Обновление:</label>
    <div class="states-filter">
      <date-picker v-model="values.lastEventFrom" style="width: 90px;" format="DD.MM.YYYY" @input="onChange" clearable/>
      <date-picker v-model="values.lastEventTo" style="width: 90px;" format="DD.MM.YYYY" @input="onChange" clearable/>
    </div>
    <label>Источник:</label>
    <input v-model="values.source" type="text" @input="onChange" />
  </div>
</template>

<script>
import DatePicker from '../Inputs/DatePicker.vue'

  export default {
    name: 'statesFilter',
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
  .states-filter {
    display: grid;
    grid-gap: 5px 3px;
    grid-template-columns: 1fr auto;
  }

  .states-filter > label {
    text-align: right;
  }
</style>