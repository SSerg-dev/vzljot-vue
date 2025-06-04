<template>
  <div class="filter">
    <label>Наименование:</label>
    <input v-model="localItem.name" type="text" @input="onChange" />
    <label>Тип:</label>
    <select v-model="localItem.type" @change="onChange">
      <option v-for="[k, v] in types" :key="k" :value="k">{{ v }}</option>
    </select>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue'

import { ItemTypeEnum } from '@/classes/enum/ItemTypeEnum'
import { Filter } from '@/classes/balanceGroup'

export default defineComponent({
  props: {
    filter: {
      type: Object as PropType<Filter>,
      required: true
    }
  },
  setup(props, { emit }) {
    const localItem = ref(new Filter(props.filter))

    const types = computed(
      () =>
        new Map([
          [undefined, '(Все)'],
          [ItemTypeEnum.BalanceGroup, 'Балансовая группа'],
          [ItemTypeEnum.Node, 'Объект учета'],
          [ItemTypeEnum.PointList, 'Список точек учета'],
          [ItemTypeEnum.Point, 'Точка учета']
        ])
    )

    function onChange() {
      emit('changed', localItem.value)
    }

    return {
      localItem,
      onChange,
      types
    }
  }
})
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

.filter > select {
  width: fit-content;
}
</style>
