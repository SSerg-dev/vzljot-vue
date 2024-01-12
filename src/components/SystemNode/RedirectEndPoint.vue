<template>
  <div class="component-detail">
    <preserver-component
      v-bind="{ readOnly: !localItem.editable, saving, disabled: !hasChanges }"
      @saveClick="save({ uuid: localItem.uuid, close: false })"
    >
      <redirect-end-point-props v-bind="{ item: localItem, error: localError }" @changed="onChanged" />
    </preserver-component>
  </div>
</template>

<script lang="ts">
import PreserverComponent from '../PreserverComponent.vue'
import RedirectEndPointProps from './RedirectEndPointProps.vue'

import { setup } from '../Base/childComponent'
import { defineComponent, inject, PropType } from 'vue'
import { RedirectEndPoint, RedirectEndPointError } from '@/classes/redirectEndPoint'

export default defineComponent({
  components: {
    PreserverComponent,
    RedirectEndPointProps
  },
  props: {
    item: {
      type: Object as PropType<RedirectEndPoint>,
      required: true
    }
  },
  setup(props, { emit }) {
    const redirectEndPoints: { redirectEndPoints: Array<RedirectEndPoint> } | undefined = inject('redirectEndPoints')

    const { hasChanges, localItem, localError, onChanged, save, saving } = setup(
      new RedirectEndPoint(props.item),
      new RedirectEndPointError({}),
      redirectEndPoints?.redirectEndPoints,
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
