<template>
  <div class="fit">
    <expantion-panel caption="Основные параметры" :resizable="false">
      <div class="grid two">
        <label>Наименование:</label>
        <input v-model.trim="localName" type="text" maxlength="80" @input="onChange" :class="{ 'validation-error': localError.name }" :title="localError.name" />
      </div>
    </expantion-panel>
  </div>
</template>

<script lang="ts">
import axios, { AxiosError } from 'axios'
import { store } from '@/store/store'
import { defineComponent, PropType, ref, watch } from 'vue'

import { EquipList, EquipListError } from '../../classes/equipList'

import ExpantionPanel from '../ExpantionPanel.vue'

export default defineComponent({
  components: {
    ExpantionPanel
  },
  props: {
    name: {
      type: String as PropType<string>,
      default: null
    },
    error: {
      type: Object as PropType<EquipListError>,
      default: () => new EquipListError({})
    }
  },
  setup(props, { emit }) {
    const localName = ref(props.name)
    const localError = ref(new EquipListError(props.error))

    watch(
      () => props.name,
      value => (localName.value = value)
    )

    watch(
      () => props.error,
      value => (localError.value = new EquipListError(value)),
      { deep: true }
    )

    function onChange() {
      emit('changed', 'name', localName.value)
    }

    async function save() {
      try {
        localError.value = new EquipListError({})

        const equipList = new EquipList({ name: localName.value })

        await equipList.save()

        return true
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const error = err as AxiosError
          if (error.response?.status !== 552) {
            if (error.response?.status === 551) {
              localError.value = error.response.data
            } else {
              store.commit('error', error)
            }
          }
        }
      }
    }

    return {
      localError,
      localName,
      onChange,
      save
    }
  }
})
</script>

<style scoped>
.grid {
  display: grid;
  gap: 5px 3px;
  align-items: center;
}

.grid.two {
  grid-template-columns: max-content max-content;
}

.grid label {
  text-align: right;
}
</style>
