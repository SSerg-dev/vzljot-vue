<template>
  <div class="component-detail">
    <preserver-component
      v-bind="{ readOnly: !localItem.editable, saving, disabled: !hasChanges }"
      @saveClick="save({ uuid: localItem.uuid, close: false })"
    >
      <modem-props v-bind="{ modem: localItem, error: localError }" @changed="onChanged" />
    </preserver-component>
  </div>
</template>

<script lang="ts">
import PreserverComponent from '../PreserverComponent.vue'
import ModemProps from './ModemProps.vue'

import { setup } from '../Base/childComponent'
import { defineComponent, PropType } from 'vue'
import { Modem, ModemError } from '@/classes/modem'

export default defineComponent({
  name: 'modemComponent',
  components: {
    PreserverComponent,
    ModemProps
  },
  props: {
    modem: {
      type: Object as PropType<Modem>,
      required: true
    },
    modems: {
      type: Array as PropType<Array<Modem>>
    }
  },
  setup(props, { emit }) {
    const { hasChanges, localItem, localError, onChanged, save, saving } = setup(new Modem(props.modem), new ModemError({}), props.modems, emit)

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
