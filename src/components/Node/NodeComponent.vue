<template>
  <div class="component-detail">
    <tabs>
      <tabx v-if="$store.state.user?.userRights.measureScheme" text="Параметры">
        <preserver-component
          v-bind="{
            readOnly: !$store.state.user?.userRights.measureSchemeEdit,
            saving,
            disabled: !hasChanges || loading,
            loading,
          }"
          @saveClick="save()"
        >
          <node-detail
            v-bind="{
              name: localItem.name,
              note: localItem.note,
              type: localItem.type,
              consumer: localItem.consumer,
              hidden: localItem.hidden,
              error: localError,
            }"
            @change="onChanged"
          />
        </preserver-component>
      </tabx>
      <tabx
        v-if="
          $store.state.user?.userRights.measureScheme &&
          $store.state.user?.userRights.equip
        "
        text="Приборы"
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
      <tabx
        v-if="$store.state.user?.userRights.measureScheme"
        text="Точки учета"
      >
        <point-list v-bind="{ items: localItem.points }" />
      </tabx>
      <tab
        v-if="$store.state.user?.userRights.reportFile"
        text="Сформированные отчеты"
      >
        <report-file-list v-bind="{ id, type: 19 }" />
      </tab>
      <tab text="Состояние">
        <state-list v-bind="{ id, type: DBTYPE }" />
      </tab>
      <tab text="Уведомления">
        <system-messages v-bind="{ objectId: id, objectType: DBTYPE }" />
      </tab>
      <tab text="Журнал">
        <journal
          v-bind="{
            id,
            type: DBTYPE,
            periodStart: new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              new Date().getDate() - 1,
              0,
              0,
              0
            ),
            periodEnd: new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              new Date().getDate(),
              23,
              59,
              59
            ),
          }"
        />
      </tab>
      <tab v-if="$store.state.user?.userRights.measureScheme" text="Файлы">
        <file-list v-bind="{ id, type: DBTYPE }" />
      </tab>
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
import { setupTreeComponent } from '../Base/baseComponent'
import { defineComponent, PropType } from 'vue'
import { Node, NodeError } from '@/classes/node'

import Journal from '../Journal/JournalList.vue'
import EquipList from './EquipList.vue'
import PointList from './PointList.vue'
import NodeDetail from './NodeDetail.vue'
import PreserverComponent from '../PreserverComponent.vue'
import ReportFileList from '../ReportFile/ReportFileList.vue'
import StateList from '../States/StateList.vue'
import SystemMessages from '../SystemMessages/SystemMessages.vue'
import FileList from '../FileList/FileList.vue'
import Tab from '../Tabs/Tab.vue'
import Tabx from '../Tabs/Tabx.vue'
import Tabs from '../Tabs/Tabs.vue'
import Wizard from '../Wizard.vue'

export default defineComponent({
  components: {
    Journal,
    EquipList,
    PointList,
    NodeDetail,
    PreserverComponent,
    ReportFileList,
    StateList,
    SystemMessages,
    FileList,
    Tab,
    Tabx,
    Tabs,
    Wizard,
  },
  props: {
    uuid: {
      type: String as PropType<string>,
      required: true,
    },
    id: {
      type: Number as PropType<number>,
      required: true,
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
