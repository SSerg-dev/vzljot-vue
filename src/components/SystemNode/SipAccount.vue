<template>
  <div class="component-detail">
    <preserver-component
      v-bind="{ readOnly: !localItem.editable, saving, disabled: !hasChanges }"
      @saveClick="save({ uuid: localItem.uuid, close: false })"
    >
      <sip-account-props v-bind="{ item: localItem, error: localError }" @changed="onChanged" />
    </preserver-component>
  </div>
</template>

<script lang="ts">
import PreserverComponent from '../PreserverComponent.vue'
import SipAccountProps from './SipAccountProps.vue'

import { setup } from '../Base/childComponent'
import { defineComponent, inject } from 'vue'
import { SipAccount, SipAccountError, ISipAccountsProps } from '@/classes/sipAccount'

export default defineComponent({
  components: {
    PreserverComponent,
    SipAccountProps
  },
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  setup(props, { emit }) {
    const sipAccounts = inject<ISipAccountsProps>('sipAccounts')

    const { hasChanges, localItem, localError, onChanged, save, saving } = setup(
      new SipAccount(props.item),
      new SipAccountError({}),
      sipAccounts?.items,
      emit
    )

    return {
      hasChanges,
      onChanged,
      localItem,
      localError,
      save,
      saving
    }
  }
})
</script>
