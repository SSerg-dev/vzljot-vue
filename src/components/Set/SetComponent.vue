<template>
  <div class="component-detail">
    <preserver-component
      v-bind="{
        readOnly: !$store.state.user?.userRights.setEdit,
        saving,
        disabled: !hasChanges || loading,
        loading,
      }"
      @saveClick="save()"
    >
      <tabs>
        <tab text="Параметры">
          <set-params
            v-bind="{ set: localItem }"
            @addParams="onAddParams"
            @removeParams="onRemoveParams"
            @busy="onBusy"
          />
        </tab>
        <tab v-if="localItem.type === SetTypes.EquipGroup" text="Приборы">
          <set-equips
            v-bind="{ id: localItem.id, items: localItem.equips }"
            @addEquips="onAddEquips"
            @removeEquips="onRemoveEquips"
          />
        </tab>
        <tab text="Настройки">
          <set-detail
            v-bind="{ set: localItem, error: localError }"
            @changed="onChanged"
          />
        </tab>
      </tabs>
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
import { Set, SetError, Equip } from '../../classes/set'

import PreserverComponent from '../PreserverComponent.vue'
import SetDetail from './SetDetail.vue'
import SetEquips from './SetEquips.vue'
import SetParams from './SetParams.vue'
import Tab from '../Tabs/Tabx.vue'
import Tabs from '../Tabs/Tabs.vue'
import Wizard from '../Wizard.vue'

import { defineComponent, PropType } from 'vue'
import { SetTypes } from '@/classes/enum/enum'
import { setupComponent } from '../Base/baseComponent'
import { SetParam } from '@/classes/setParam'

export default defineComponent({
  components: {
    PreserverComponent,
    SetDetail,
    SetEquips,
    SetParams,
    Tab,
    Tabs,
    Wizard,
  },
  props: {
    equipId: {
      type: Number as PropType<number>,
    },
    equipTypeId: {
      type: Number as PropType<number>,
    },
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
    } = setupComponent<Set, SetError>(
      new Set({
        id: props.id,
        uuid: props.uuid,
        equipId: props.equipId,
        equipTypeId: props.equipTypeId,
      }),
      new SetError({}),
      emit
    )

    function onAddParams(data: Array<SetParam>) {
      localItem.value.params.splice(
        localItem.value.params.length,
        0,
        ...data.map((r) => new SetParam(r))
      )
    }

    function onRemoveParams(params: Array<SetParam>) {
      const ids = params.map((r) => r.id)
      localItem.value.params = localItem.value.params?.filter(
        (r) => !ids.includes(r.id)
      )
    }

    function onAddEquips(
      equips: Array<{
        id: number
        type: number
        text: string
        state: number
        connectionGroupType: number
      }>
    ) {
      localItem.value.equips.push(
        ...equips.map((r) => ({
          equipId: r.id,
          state: r.state,
          text: r.text,
          type: r.type,
          connectionGroupType: r.connectionGroupType,
        }))
      )
    }

    function onRemoveEquips(equips: Array<Equip>) {
      const ids = equips.map((r) => r.equipId)
      localItem.value.equips = localItem.value.equips.filter(
        (r) => !ids.includes(r.equipId)
      )
      localItem.value.params = localItem.value.params.filter(
        (r) => r.equipId && !ids.includes(r.equipId)
      )
    }

    return {
      hasChanges,
      loading,
      localItem,
      localError,
      onAddEquips,
      onAddParams,
      onChanged,
      onRemoveEquips,
      onRemoveParams,
      onWizardCancel,
      onWizardEnd,
      SetTypes,
      save,
      saving,
      wizard,
    }
  },
  methods: {
    onBusy(data: any) {
      this.$emit('busy', data)
    },
    // onComponentEvent(event, name, data) {
    //   // console.log(event, name, data)
    //   if (name === 'setEquips' && event === 'removeEquips') {
    //     this.tabs.filter(r => r.id === 'setParams').forEach(r => (r.key = `${r.id}${new Date().getTime()}`))
    //   }

    //   this.$emit('componentEvent', event, this.$options.name, data)
    // }
  },
})
</script>
