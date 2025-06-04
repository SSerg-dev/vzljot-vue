<template>
  <div class="component-detail">
    <tabs>
      <tabx v-if="$store.state.user?.userRights.equipList" text="Параметры">
        <preserver-component
          v-bind="{
            readOnly: !$store.state.user?.userRights.equipListEdit,
            saving,
            disabled: !hasChanges || loading,
            loading,
          }"
          @saveClick="save()"
        >
          <equip-list-props
            v-bind="{ name: localItem.name, error: localError }"
            @changed="onChanged"
          />
        </preserver-component>
      </tabx>
      <tabx
        v-if="$store.state.user?.userRights.equipList"
        text="Приборы"
        :selected="$store.state.user?.userRights.equipList"
      >
        <preserver-component
          v-bind="{
            readOnly: !$store.state.user?.userRights.equipListEdit,
            saving,
            disabled: !hasChanges || loading,
            loading,
          }"
          @saveClick="save()"
        >
          <equips-list
            v-bind="{ items: localItem.equips, settings: localItem.settings }"
            @add="onAddEquips"
            @remove="onRemoveEquips"
          />
        </preserver-component>
      </tabx>
      <tab
        v-if="$store.state.user?.userRights.reportFile"
        text="Сформированные отчеты"
      >
        <report-file-list v-bind="{ id, type: 16 }" />
      </tab>
      <tab text="Состояние">
        <state-list v-bind="{ id, type: DBTYPE }" />
      </tab>
      <tab text="Уведомления">
        <system-messages v-bind="{ objectId: id, objectType: DBTYPE }" />
      </tab>
      <tab text="Журнал">
        <journal-list
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
import { defineComponent, PropType } from 'vue'

import { setupTreeComponent } from '../Base/baseComponent'
import { EquipList, EquipListError } from '../../classes/equipList'

import EquipsList from './EquipsList.vue'
import EquipListProps from './EquipListProps.vue'
import PreserverComponent from '../PreserverComponent.vue'
import ReportFileList from '../ReportFile/ReportFileList.vue'
import StateList from '../States/StateList.vue'
import SystemMessages from '../SystemMessages/SystemMessages.vue'
import JournalList from '../Journal/JournalList.vue'
import Tab from '../Tabs/Tab.vue'
import Tabx from '../Tabs/Tabx.vue'
import Tabs from '../Tabs/Tabs.vue'
import Wizard from '../Wizard.vue'

export default defineComponent({
  components: {
    EquipsList,
    EquipListProps,
    PreserverComponent,
    ReportFileList,
    StateList,
    SystemMessages,
    JournalList,
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
      new EquipList({ uuid: props.uuid }),
      new EquipListError({})
    )

    async function onAddEquips(equips: Array<number>) {
      loading.value = true

      await localItem.value.addEquips(equips)

      loading.value = false
      hasChanges.value = true
    }

    function onRemoveEquips(equips: Array<number>) {
      localItem.value.equips = localItem.value.equips.filter(
        (r) => !equips.includes(r.equipId)
      )
      hasChanges.value = true
    }

    return {
      DBTYPE: 'DbEquipList',
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
