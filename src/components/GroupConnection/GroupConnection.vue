<template>
  <div class="component-detail">
    <tabs>
      <tab v-if="$store.state.user?.userRights.equip" text="Параметры">
        <preserver-component
          v-bind="{
            readOnly: !$store.state.user?.userRights.equipEdit,
            saving,
            disabled: !hasChanges || loading,
            loading,
          }"
          @saveClick="save()"
        >
          <group-connection-detail
            v-bind="{ group: localItem, error: localError }"
            @changed="onChanged"
            @groupChanged="onGroupChanged"
          />
        </preserver-component>
      </tab>
      <tab
        v-if="$store.state.user?.userRights.reportFile"
        text="Сформированные отчеты"
      >
        <report-file-list v-bind="{ id, type: 20 }" />
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

import {
  GroupConnection,
  GroupConnectionError,
} from '@/classes/groupConnection'

import GroupConnectionDetail from './GroupConnectionDetail.vue'
import JournalList from '../Journal/JournalList.vue'
import PreserverComponent from '../PreserverComponent.vue'
import ReportFileList from '../ReportFile/ReportFileList.vue'
import StateList from '../States/StateList.vue'
import SystemMessages from '../SystemMessages/SystemMessages.vue'
import Tab from '../Tabs/Tab.vue'
import Tabs from '../Tabs/Tabs.vue'
import Wizard from '../Wizard.vue'
import { setupTreeComponent } from '../Base/baseComponent'

export default defineComponent({
  components: {
    GroupConnectionDetail,
    JournalList,
    PreserverComponent,
    ReportFileList,
    StateList,
    SystemMessages,
    Tab,
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
      new GroupConnection({ uuid: props.uuid }),
      new GroupConnectionError({})
    )

    function onGroupChanged() {
      if (localItem.value.editable) {
        hasChanges.value = true
      }
    }

    return {
      DBTYPE: 'DbGroupConnection',
      hasChanges,
      localItem,
      loading,
      saving,
      localError,
      onChanged,
      onGroupChanged,
      onWizardCancel,
      onWizardEnd,
      save,
      wizard,
    }
  },
})
</script>
