<template>
  <div class="component-detail">
    <tabs>
      
      <tabx
        text="Списки приборов"
      >
        <preserver-component
          v-bind="{
            readOnly: !$store.state.user?.userRights.measureSchemeEdit,
            saving,
            disabled: !hasChanges || loading,
            loading,
          }"
          @saveClick="save()"
        >
          <equip-list
            v-bind="{ items: localItem.equips }"
            @add="onAddEquips"
            @remove="onRemoveEquips"
          />
        </preserver-component>
      </tabx>
      <!-- <tabx
        text="Списки точек учета"
      >
        <point-list v-bind="{ items: localItem.points }" />
      </tabx> -->
      
      
      
      
      
    </tabs>
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
import { setupTreeComponent } from '@/components/Base/baseComponent'
import { defineComponent, PropType } from 'vue'
import { Node, NodeError } from '@/classes/node'
import EquipList from '@/components/Node/EquipList.vue'
// import PointList from '@/components/Node/PointList.vue'
import PreserverComponent from '@/components/PreserverComponent.vue'
import Tabx from '@/components/Tabs/Tabx.vue'
import Tabs from '@/components/Tabs/Tabs.vue'
import Wizard from '@/components/Wizard.vue'

export default defineComponent({
  components: {
    EquipList,
    // PointList,
    PreserverComponent,
    Tabx,
    Tabs,
    Wizard,
  },
  props: {
    uuid: {
      type: String as PropType<string>,
      required: true,
      default: ''
    },
    id: {
      type: Number as PropType<number>,
      required: true,
      default: 0
    },
  },
  setup(props) {
    const {
      hasChanges,
      loading,
      localError,
      localItem,
      onChanged,
      onWizardCancel,
      onWizardEnd,
      save,
      saving,
      wizard,
    } = setupTreeComponent(
      props.uuid,
      props.id,
      new Node({ uuid: props.uuid }),
      new NodeError({})
    )

    async function onAddEquips(equips: Array<any>) {
      localItem.value.addEquips(equips)
    }

    function onRemoveEquips(equips: Array<number>) {
      localItem.value.equips = localItem.value.equips.filter(
        (r) => !equips.includes(r.id)
      )
    }

    return {
      DBTYPE: 'DbNode',
      hasChanges,
      localItem,
      loading,
      localError,
      onAddEquips,
      onChanged,
      onRemoveEquips,
      onWizardCancel,
      onWizardEnd,
      save,
      saving,
      wizard,
    }
  },
})
</script>
