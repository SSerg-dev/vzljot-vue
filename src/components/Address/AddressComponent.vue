<template>
  <div class="component-detail">
    <tabs>
      <tab v-if="$store.state.user?.userRights.measureScheme" text="Параметры">
        <preserver-component
          v-bind="{ readOnly: !$store.state.user?.userRights.measureSchemeEdit, saving, disabled: !hasChanges || loading, loading }"
          @saveClick="save()"
        >
          <address-house-props
            v-if="addressType === 4"
            v-bind="{
              number: localItem.number,
              building: localItem.building,
              construction: localItem.construction,
              letter: localItem.letter,
              note: localItem.note,
              hidden: localItem.hidden,
              type: addressType,
              error: localError
            }"
            @change="onChanged"
          />
          <address-props
            v-else
            v-bind="{ name: localItem.name, hidden: localItem.hidden, type: addressType, error: localError }"
            @change="onChanged"
          />
        </preserver-component>
      </tab>
      <tab v-if="$store.state.user?.userRights.measureScheme" text="Точки учета">
        <point-list v-bind="{ id, type: 17 }" />
      </tab>
      <tab v-if="$store.state.user?.userRights.reportFile" text="Сформированные отчеты">
        <report-file-list v-bind="{ id, type: 17 }" />
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
            periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1, 0, 0, 0),
            periodEnd: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59, 59)
          }"
        />
      </tab>
    </tabs>
    <transition-group>
      <wizard v-if="wizard" v-bind="wizard" @cancel="onWizardCancel" @end="onWizardEnd" key="0" />
      <spinner :show="loading" :text="'Загрузка...'" key="1" />
    </transition-group>
  </div>
</template>

<script lang="ts">
import { setupTreeComponent } from '../Base/baseComponent'

import { defineComponent, PropType } from 'vue'

import { Address, AddressError } from '@/classes/address'

import AddressProps from './AddressProps.vue'
import AddressHouseProps from './AddressHouseProps.vue'
import Journal from '../Journal/JournalList.vue'
import PointList from '../Point/PointList.vue'
import PreserverComponent from '../PreserverComponent.vue'
import ReportFileList from '../ReportFile/ReportFileList.vue'
import StateList from '../States/StateList.vue'
import SystemMessages from '../SystemMessages/SystemMessages.vue'
import Tab from '../Tabs/Tab.vue'
import Tabs from '../Tabs/Tabs.vue'
import Wizard from '../Wizard.vue'

export default defineComponent({
  components: {
    AddressProps,
    AddressHouseProps,
    Journal,
    PointList,
    PreserverComponent,
    ReportFileList,
    StateList,
    SystemMessages,
    Tab,
    Tabs,
    Wizard
  },
  props: {
    uuid: {
      type: String as PropType<string>,
      required: true
    },
    id: {
      type: Number as PropType<number>,
      required: true
    },
    addressType: {
      type: Number as PropType<number>,
      required: true
    }
  },
  setup(props) {
    const { hasChanges, loading, localError, localItem, onChanged, onWizardCancel, onWizardEnd, save, saving, wizard } = setupTreeComponent(
      props.uuid,
      props.id,
      new Address({ uuid: props.uuid }),
      new AddressError({})
    )

    return {
      DBTYPE: 'DbAddress',
      hasChanges,
      localItem,
      loading,
      localError,
      onChanged,
      onWizardCancel,
      onWizardEnd,
      save,
      saving,
      wizard
    }
  }
})
</script>
