<template>
  <tabs>
    <tab text="Параметры">
      <div class="filter">
        <check-box v-model="values.hideEmptyFields" @update:modelValue="onChange()">Скрывать пустые поля</check-box>
        <check-box v-model="values.hideDeltaFields" @update:modelValue="onChangeDelta($event)">Скрывать поля со значениями потребления</check-box>
        <check-box v-model="values.hideTotalFields" @update:modelValue="onChangeTotal($event)">Скрывать поля с интегральными значениями</check-box>
      </div>
    </tab>
    <tab text="Единицы измерения">
      <measures-component :measures="values.measures" @changed="onChange()" />
    </tab>
  </tabs>
</template>

<script>
import MeasuresComponent from '../MeasuresComponent.vue'
import CheckBox from '../Inputs/CheckBox.vue'
import Tab from '../Tabs/Tab.vue'
import Tabs from '../Tabs/Tabs.vue'

export default {
  components: {
    MeasuresComponent,
    CheckBox,
    Tab,
    Tabs
  },
  props: {
    hideEmptyFields: Boolean,
    hideDeltaFields: Boolean,
    hideTotalFields: Boolean,
    measures: Array
  },
  data() {
    return {
      values: {
        hideEmptyFields: this.hideEmptyFields,
        hideDeltaFields: this.hideDeltaFields,
        hideTotalFields: this.hideTotalFields,
        measures: JSON.parse(JSON.stringify(this.measures))
      }
    }
  },
  methods: {
    onChange() {
      this.$emit('changed', this.values)
    },
    onChangeDelta(value) {
      if (value) {
        this.values.hideTotalFields = false
      }
      this.onChange()
    },
    onChangeTotal(value) {
      if (value) {
        this.values.hideDeltaFields = false
      }
      this.onChange()
    }
  }
}
</script>

<style scoped>
.filter {
  display: grid;
  grid-gap: 5px 3px;
}
</style>
