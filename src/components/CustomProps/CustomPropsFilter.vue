<template>
  <div class="custom-props-filter">
    <label>Наименование:</label>
    <input v-model="values.name" type="text" @input="onChange" maxlength="50" />
    <label>Код:</label>
    <input v-model="values.code" type="text" @input="onChange" maxlength="50" />
    <label>Тип данных:</label>
    <select v-model="values.dataType" @change="onChange">
      <option :value="null">(Все)</option>
      <option :value="CustomPropertyTypeEnum.String">Строка</option>
      <option :value="CustomPropertyTypeEnum.Integer">Целое число</option>
      <option :value="CustomPropertyTypeEnum.Double">Вещественное число</option>
      <option :value="CustomPropertyTypeEnum.DateTime">Дата и время</option>
      <option :value="CustomPropertyTypeEnum.Boolean">Логическое значение</option>
    </select>
    <label>Тип объекта:</label>
    <select v-model="values.objectType" @change="onChange">
      <option :value="null">(Все)</option>
      <option :value="CustomPropertyObjectTypeEnum.Equip">Прибор</option>
      <option :value="CustomPropertyObjectTypeEnum.MeasureScheme">Точка учета</option>
      <option :value="CustomPropertyObjectTypeEnum.EquipAndMeasureScheme">Прибор и точка учета</option>
    </select>
  </div>
</template>

<script>
import { CustomPropertyObjectTypeEnum } from '@/classes/enum/CustomPropertyObjectTypeEnum'
import { CustomPropertyTypeEnum } from '@/classes/enum/CustomPropertyTypeEnum'

export default {
  props: {
    filter: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      CustomPropertyObjectTypeEnum,
      CustomPropertyTypeEnum,
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
.custom-props-filter {
  display: grid;
  grid-gap: 5px 3px;
  grid-template-columns: 1fr auto;
}

.custom-props-filter > label {
  text-align: right;
}

.custom-props-filter > select {
  width: fit-content;
}
</style>
