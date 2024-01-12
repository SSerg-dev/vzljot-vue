<template>
  <div class="component-detail">
    <preserver-component v-bind="{ readOnly: !localItem.editable, saving, disabled: !hasChanges }" @saveClick="save({ uuid: localItem.uuid, close: false })">
      <lora-server-props v-bind="{ item: localItem, error: localError }" @changed="onChanged" />
    </preserver-component>
  </div>
</template>

<script lang="ts">
import PreserverComponent from '../PreserverComponent.vue'
import LoraServerProps from './LoraServerProps.vue'

import { setup } from '../Base/childComponent'
import { defineComponent, inject, PropType } from 'vue'
import { LoraServer, LoraServerError } from '@/classes/loraServer'

export default defineComponent({
  components: {
    PreserverComponent,
    LoraServerProps
  },
  props: {
    item: {
      type: Object as PropType<LoraServer>,
      required: true
    }
  },
  setup(props, { emit }) {
    const provider = inject<{ loraServers: Array<LoraServer> }>('loraServers')

    const { hasChanges, localItem, localError, onChanged, save, saving } = setup(
      new LoraServer(props.item),
      new LoraServerError({}),
      provider?.loraServers,
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
