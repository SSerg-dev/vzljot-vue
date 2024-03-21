<template>
  <div class="props-grid">
    <template v-for="r in localCustomProps" :key="r.id + 'label'">
      <label>{{ r.name }}:</label>
      <date-picker
        v-if="r.type === CustomPropertyTypeEnum.DateTime"
        v-model="r.value"
        @update:modelValue="onChange"
        format="DD.MM.YYYY HH:mm:ss"
        style="width: 150px"
        clearable
      />
      <input
        v-else-if="
          r.type === CustomPropertyTypeEnum.Double ||
          r.type === CustomPropertyTypeEnum.Integer
        "
        type="number"
        @input="onChange"
        v-model.number="r.value"
        :step="r.type === CustomPropertyTypeEnum.Double ? 'any' : 1"
        style="width: 150px"
      />
      <select
        v-else-if="r.type === CustomPropertyTypeEnum.Boolean"
        v-model="r.value"
        @change="onChange"
        style="width: 50px"
      >
        <option :value="null"></option>
        <option :value="true">Да</option>
        <option :value="false">Нет</option>
      </select>
      <input v-else type="text" v-model.trim="r.value" @input="onChange" />
    </template>
  </div>
</template>

<script>
import { CustomPropertyTypeEnum } from '@/classes/enum/CustomPropertyTypeEnum'

import DatePicker from '../Inputs/DatePicker.vue'

export default {
  components: {
    DatePicker,
  },
  props: {
    customProps: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      localCustomProps: JSON.parse(JSON.stringify(this.customProps)),
      CustomPropertyTypeEnum,
    }
  },
  created() {
    this.$watch(
      () => this.customProps,
      (value) =>  (this.localCustomProps = value),
      { deep: true }
    )
  },
  methods: {
    onChange() {
      this.$emit('changed', 'customProps', this.localCustomProps)
    },
    convert(value, type) {
      if (value && typeof value === 'object') {
        return value.value
      } else {
        if (type === this.CustomPropertyTypeEnum.DateTime) {
          value = value ? new Date(value).toLocaleString() : null
        } else if (type === this.CustomPropertyTypeEnum.Boolean) {
          value = value === null ? null : value ? 'Да' : 'Нет'
        }
      }

      return value
    },
  },
}
</script>

<style>
.props-grid {
  display: grid;
  grid-gap: 5px 3px;
  grid-template-columns: auto 1fr;
  align-items: center;
}

.props-grid > label {
  text-align: right;
}
</style>
