<template>
  <div class="component-detail">
    <preserver-component
      v-bind="{ readOnly: !localItem.editable, saving, disabled: !hasChanges }"
      @saveClick="save({ uuid: localItem.uuid, close: false })"
    >
      <modem-pool-props v-bind="{ modemPool: localItem, error: localError }" @changed="onChanged" />
    </preserver-component>
  </div>
</template>

<script lang="ts">
import PreserverComponent from '../PreserverComponent.vue'
import ModemPoolProps from './ModemPoolProps.vue'

import { setup } from '../Base/childComponent'
import { defineComponent, inject, PropType } from 'vue'
import { ModemPool, ModemPoolError } from '@/classes/modemPool'

export default defineComponent({
  components: {
    PreserverComponent,
    ModemPoolProps
  },
  props: {
    modemPool: {
      type: Object as PropType<ModemPool>,
      required: true
    }
  },
  setup(props, { emit }) {
    const provider: { pools: Array<ModemPool> } | undefined = inject('provider')

    const { hasChanges, localItem, localError, onChanged, save, saving } = setup(
      new ModemPool(props.modemPool),
      new ModemPoolError({}),
      provider?.pools,
      emit
    )

    return {
      hasChanges,
      localItem,
      localError,
      onChanged,
      save,
      saving
    }
  }
})
</script>
