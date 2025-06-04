<template>
  <div class="component-detail">
    <preserver-component
      v-bind="{
        readOnly: !$store.state.user?.userRights.customPropertyEdit,
        saving,
        disabled: !hasChanges || loading,
        loading,
      }"
      @saveClick="save()" 
    >
      <custom-prop-component
        ref="customProp"
        v-bind="{ value: localItem, error: localError }"
        @changed="onChanged"
      />
    </preserver-component>
    <transition-group>
      <wizard
        v-if="wizard"
        v-bind="wizard"
        @cancel="onWizardCancel"
        @end="onWizardEnd"
        key="0"
      />
      <spinner :show="loading" :text="'Загрузка...'" key="1" />
    </transition-group>
  </div>
</template>

<script lang="ts">
import { CustomProp, CustomPropError } from '@/classes/customProp'
import { defineComponent, PropType } from 'vue'

import CustomPropComponent from './CustomProp.vue'
import PreserverComponent from '../PreserverComponent.vue'
import Wizard from '../Wizard.vue'
import { setupComponent } from '../Base/baseComponent'

export default defineComponent({
  components: {
    CustomPropComponent,
    PreserverComponent,
    Wizard,
  },
  props: {
    id: {
      type: Number as PropType<number>,
      required: true,
    },
    uuid: {
      type: String as PropType<string>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const {
      hasChanges,
      loading,
      localItem,
      localError,
      onChanged,
      onWizardCancel,
      onWizardEnd,
      save,
      saving,
      wizard,
    } = setupComponent<CustomProp, CustomPropError>(
      new CustomProp({ id: props.id, uuid: props.uuid }),
      new CustomPropError({}),
      emit
    )

    return {
      hasChanges,
      loading,
      localError,
      localItem,
      onChanged,
      onWizardCancel,
      onWizardEnd,
      saving,
      save,
      wizard,
    }
  },
})
</script>
