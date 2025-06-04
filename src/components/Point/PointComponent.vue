<template>
  <div class="component-detail">
    <tabs>
      <tabx v-if="$store.state.user?.userRights.measureScheme" text="Параметры">
        <preserver-component v-bind="{ readOnly: !$store.state.user?.userRights.measureSchemeEdit, saving, disabled: !hasChanges || loading, loading }" @saveClick="save()">
          <point-props v-bind="{ point: localItem, error: localError }" @changed="onChanged" />
        </preserver-component>
      </tabx>
      <tabx text="Отчеты" v-if="$store.state.user?.userRights.report && localItem.reportTypes.length > 0">
        <report-component v-bind="{ ids: [id], objType: reportObjectTypes.measureScheme, reportTypes: localItem.reportTypes }" />
      </tabx>
      <tab text="Архивы" v-if="$store.state.user?.userRights.pollDataView && !localItem.emptyNodeEquip">
        <archive-component v-bind="{ id, type: 1 }" />
      </tab>
      <tab text="Графики" v-if="$store.state.user?.userRights.pollDataView && !localItem.emptyNodeEquip">
        <archive-chart v-bind="{ id }" />
      </tab>
      <tab text="Анализ" v-if="$store.state.user?.userRights.analyse && localItem.analyzeTypes.length > 0">
        <point-analyze v-bind="{ id, systemType, analyzeTypes: localItem.analyzeTypes, pollDataType: localItem.pollDataType, archiveTypes: localItem.archiveTypes, schemaEvent: localItem.schemaEvent, schemaEvents: localItem.schemaEvents }" />
      </tab>
      <tab text="Отчетные формы" v-if="$store.state.user?.userRights.measureSchemeEdit">
        <point-forms v-bind="{ id }" />
      </tab>
      <tab v-if="$store.state.user?.userRights.reportFile && !localItem.emptyNodeEquip" text="Сформированные отчеты">
        <report-file-list v-bind="{ id, type: 26 }" />
      </tab>
      <tab v-if="$store.state.user?.userRights.measureScheme" text="Файлы">
        <file-list v-bind="{ id, type: DBTYPE }" />
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
import { store } from '@/store/store'
import { computed, defineComponent, PropType } from 'vue'

import { matchType } from '../../plugins/api'

import { Point, PointError } from '@/classes/point'

import PointAnalyze from '../Analyze/PointAnalyze.vue'
import ArchiveComponent from '../Archive/ArchiveComponent.vue'
import ArchiveChart from '../Archive/ArchiveChart.vue'
import FileList from '../FileList/FileList.vue'
import JournalList from '../Journal/JournalList.vue'
import PointProps from './PointProps.vue'
import PointForms from './PointForms.vue'
import PreserverComponent from '../PreserverComponent.vue'
import ReportComponent from '../Report/ReportComponent.vue'
import ReportFileList from '../ReportFile/ReportFileList.vue'
import StateList from '../States/StateList.vue'
import SystemMessages from '../SystemMessages/SystemMessages.vue'
import Tab from '../Tabs/Tab.vue'
import Tabx from '../Tabs/Tabx.vue'
import Tabs from '../Tabs/Tabs.vue'
import Wizard from '../Wizard.vue'
import { setupTreeComponent } from '../Base/baseComponent'

export default defineComponent({
  components: {
    PointAnalyze,
    ArchiveComponent,
    ArchiveChart,
    FileList,
    JournalList,
    PointProps,
    PointForms,
    PreserverComponent,
    ReportComponent,
    ReportFileList,
    StateList,
    SystemMessages,
    Tab,
    Tabx,
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
    systemType: {
      type: Number as PropType<number>,
      required: true
    }
  },
  setup(props) {
    const { hasChanges, loading, localError, localItem, onChanged, onWizardCancel, onWizardEnd, save, saving, wizard } = setupTreeComponent(
      props.uuid,
      props.id,
      new Point({ uuid: props.uuid }),
      new PointError({})
    )

    const reportObjectTypes = computed(function () {
      return matchType(store.state.env.reportObjectTypes)
    })
    
    return {
      DBTYPE: 'DbMeasureScheme',
      hasChanges,
      localItem,
      loading,
      localError,
      onChanged,
      onWizardCancel,
      onWizardEnd,
      reportObjectTypes,
      save,
      saving,
      wizard
    }
  }
})
</script>
