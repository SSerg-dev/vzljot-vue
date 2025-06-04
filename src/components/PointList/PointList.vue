<template>
  <div class="component-detail">
    <tabs>
      <tabx
        v-if="$store.state.user?.userRights.measureSchemeList"
        text="Параметры"
      >
        <preserver-component
          v-bind="{
            readOnly: !$store.state.user?.userRights.measureSchemeListEdit,
            saving,
            disabled: !hasChanges || loading,
            loading,
          }"
          @saveClick="save()"
        >
          <point-list-props
            v-bind="{ name: localItem.name, error: localError }"
            @change="onChanged"
          />
        </preserver-component>
      </tabx>
      <tabx
        v-if="$store.state.user?.userRights.measureSchemeList"
        text="Точки учета"
        :selected="true"
      >
        <preserver-component
          v-bind="{
            readOnly: !$store.state.user?.userRights.measureSchemeListEdit,
            saving,
            disabled: !hasChanges || loading,
            loading,
          }"
          @saveClick="save()"
        >
          <points-list
            v-bind="{ items, settings: localItem.settings }"
            @add="onAddPoints"
            @remove="onRemovePoints"
          />
        </preserver-component>
      </tabx>
      <tab
        v-if="$store.state.user?.userRights.reportFile"
        text="Сформированные отчеты"
      >
        <report-file-list v-bind="{ id, type: 15 }" />
      </tab>
      <tab text="Состояние">
        <state-list
          v-bind="{ id, type: $store.state.env.dbTypes.dbMeasureSchemaList }"
        />
      </tab>
      <tab text="Уведомления">
        <system-messages
          v-bind="{
            objectId: id,
            objectType: $store.state.env.dbTypes.dbMeasureSchemaList,
          }"
        />
      </tab>
      <tab text="Журнал">
        <journal-list
          v-bind="{
            id,
            type: $store.state.env.dbTypes.dbMeasureSchemaList,
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
import { computed, defineComponent, PropType } from 'vue'
import { setupTreeComponent } from '../Base/baseComponent'
import { PointList, PointListError, Point } from '@/classes/pointList'

import JournalList from '../Journal/JournalList.vue'
import PointsList from './PointsList.vue'
import PointListProps from './PointListProps.vue'
import PreserverComponent from '../PreserverComponent.vue'
import ReportFileList from '../ReportFile/ReportFileList.vue'
import StateList from '../States/StateList.vue'
import SystemMessages from '../SystemMessages/SystemMessages.vue'
import Tab from '../Tabs/Tab.vue'
import Tabx from '../Tabs/Tabx.vue'
import Tabs from '../Tabs/Tabs.vue'
import Wizard from '../Wizard.vue'

export default defineComponent({
  components: {
    JournalList,
    PointsList,
    PointListProps,
    PreserverComponent,
    ReportFileList,
    StateList,
    SystemMessages,
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
      new PointList({ uuid: props.uuid }),
      new PointListError({})
    )

    const items = computed(() =>
      localItem.value.points.map((r) => new Point(r))
    )

    async function onAddPoints(points: Array<number>) {
      loading.value = true

      await localItem.value.addPoints(points)

      loading.value = false
      hasChanges.value = true
    }

    function onRemovePoints(points: Array<number>) {
      localItem.value.points = localItem.value.points.filter(
        (r) => !points.includes(r.id)
      )
      hasChanges.value = true
    }

    return {
      hasChanges,
      items,
      localItem,
      loading,
      localError,
      onAddPoints,
      onChanged,
      onRemovePoints,
      onWizardCancel,
      onWizardEnd,
      save,
      saving,
      wizard,
    }
  },
})
</script>
