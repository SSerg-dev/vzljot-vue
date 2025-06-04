<template>
  <div class="component-detail">
    <tabs>
      <tab v-if="$store.state.user?.userRights.measureSchemeGroup" text="Параметры">
        <preserver-component v-bind="{ readOnly: !$store.state.user?.userRights.measureSchemeGroupEdit, saving, disabled: !hasChanges || loading, loading }" @saveClick="save()">
          <point-group-detail v-bind="{ name: localItem.name, note: localItem.note, error: localError }" @change="onChanged" />
        </preserver-component>
      </tab>
      <tab v-if="$store.state.user?.userRights.measureSchemeGroup" text="Точки учета">
        <preserver-component v-bind="{ readOnly: !$store.state.user?.userRights.measureSchemeGroupEdit, saving, disabled: !hasChanges || loading, loading }" @saveClick="save()">
          <points-list v-bind="{ items: localItem.points }" @add="onAddPoints" @remove="onRemovePoints" />
        </preserver-component>
      </tab>
      <tab v-if="$store.state.user?.userRights.report && reportData.reportTypes.length > 0" text="Отчеты">
        <report-component v-bind="reportData" />
      </tab>
      <tab text="Состояние">
        <state-list v-bind="{ id, type: DBTYPE }" />
      </tab>
      <tab text="Уведомления">
        <system-messages v-bind="{ objectId: id, objectType: DBTYPE }" />
      </tab>
      <tab text="Журнал">
        <journal-list v-bind="{ id, type: DBTYPE, periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1, 0, 0, 0), periodEnd: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59, 59) }" />
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
import { store } from '@/store/store'
import { computed, defineComponent, PropType } from 'vue'

import { matchType } from '../../plugins/api'
import { PointGroup, Point, PointGroupError } from '@/classes/pointGroup'

import JournalList from '../Journal/JournalList.vue'
import PointsList from './PointsList.vue'
import PointGroupDetail from './PointGroupDetail.vue'
import PreserverComponent from '../PreserverComponent.vue'
import ReportComponent from '../Report/ReportComponent.vue'
import StateList from '../States/StateList.vue'
import SystemMessages from '../SystemMessages/SystemMessages.vue'
import Tab from '../Tabs/Tab.vue'
import Tabs from '../Tabs/Tabs.vue'
import Wizard from '../Wizard.vue'

export default defineComponent({
  components: {
    JournalList,
    PointsList,
    PointGroupDetail,
    PreserverComponent,
    ReportComponent,
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
    }
  },
  setup(props) {
    const { hasChanges, loading, localError, localItem, onChanged, onWizardCancel, onWizardEnd, save, saving, wizard } = setupTreeComponent(
      props.uuid,
      props.id,
      new PointGroup({ uuid: props.uuid }),
      new PointGroupError({})
    )

    const reportData = computed(function () {
      const reportTypes: { [key: string]: any } = matchType(store.state.env.reportTypes)

      return {
        ids: [props.id],
        objType: localItem.value.reportObjectType,
        reportTypes: localItem.value.points.some(r => r.hasArchives) ? [reportTypes.parametersSheetGroup, reportTypes.summary] : []
      }
    })

    async function onAddPoints(points: Array<Point>) {   
      points.forEach((r, i) => (r.number = localItem.value.points.length + i))
      localItem.value.addPoints(points)
      hasChanges.value = true
    }

    async function onRemovePoints(points: Array<number>) {
      localItem.value.removePoints(points)
      hasChanges.value = true
    }

    return {
      DBTYPE: 'DbMeasureSchemeGroup',
      hasChanges,
      localItem,
      loading,
      localError,
      onAddPoints,
      onChanged,
      onRemovePoints,
      onWizardCancel,
      onWizardEnd,
      reportData,
      save,
      saving,
      wizard
    }
  }
})
</script>
