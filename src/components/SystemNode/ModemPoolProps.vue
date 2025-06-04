<template>
  <expantion-panel caption="Основные параметры" :resizable="false" class="fit">
    <div class="grid">
      <label>Наименование:</label>
      <input v-focus v-model.trim="localModemPool.name" @input="onChanged(localModemPool.name)" type="text" maxlength="50" :class="{ 'validation-error': localError.name }" :title="localError.name" />
    </div>
  </expantion-panel>
</template>

<script lang="ts">
import { defineComponent, inject, PropType, ref, watch } from 'vue'

import { ModemPool, ModemPoolError } from '../../classes/modemPool'

import ExpantionPanel from '../ExpantionPanel.vue'

export default defineComponent({
  components: {
    ExpantionPanel
  },
  props: {
    modemPool: {
      type: Object as PropType<ModemPool>,
      required: true
    },
    error: {
      type: Object as PropType<ModemPoolError>,
      required: true
    }
  },
  setup(props, { emit }) {
    const provider: { pools: Array<ModemPool> } | undefined = inject('provider')

    const localModemPool = ref(new ModemPool(props.modemPool))
    const localError = ref(new ModemPoolError(props.error))

    watch(
      () => props.modemPool as ModemPool,
      value => localModemPool.value = new ModemPool(value),
      { deep: true }
    )

    watch(
      () => props.error as ModemPoolError,
      value => localError.value = new ModemPoolError(value),
      { deep: true }
    )

    function onChanged(value: any) {
      emit('changed', 'name', value)
    }

    function save() {
      localError.value = localModemPool.value.validate(provider?.pools)
      if (Object.keys(localError.value).length === 0) {
        emit('changed', localModemPool.value)
        return true
      }
      return false
    } 

    return {
      localModemPool,
      localError,
      onChanged,
      save
    }
  }
})
</script>

<style scoped>
.grid {
  display: grid;
  gap: 5px 3px;
  grid-template-columns: auto 1fr;
}

.grid label {
  text-align: right;
}

.grid select {
  width: fit-content;
}

.grid .numberbox {
  width: 60px;
}
</style>
