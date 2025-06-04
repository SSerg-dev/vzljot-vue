<template>
  <div class="component-detail">
    <tabs>
      <tabx v-if="$store.state.user?.userRights.equip" text="Параметры">
        <preserver-component
          v-bind="{
            readOnly: !$store.state.user?.userRights.equipEdit,
            saving,
            disabled: !hasChanges || loading || hasEquipSettingEdit,
            loading,
          }"
          @saveClick="save()"
        >
          <equip-detail
            v-bind="{ equip: localItem, error: localError }"
            @changed="onChanged"
            @groupChanged="onGroupChange"
          />
        </preserver-component>
      </tabx>
      <tab v-if="$store.state.user?.userRights.equip" text="Настройки прибора">
        <equip-detail-setting
          v-bind="{ equip: localItem }"
          @changed="onChanged"
        />
      </tab>

      <tab
        text="Отчеты"
        v-if="$store.state.user?.userRights.report && reportTypes.length > 0"
      >
        <report-component
          v-bind="{
            ids: [id],
            objType: ReportObjectTypeEnum.Equip,
            reportTypes,
          }"
        />
      </tab>
      <tab text="Архивы" v-if="$store.state.user?.userRights.pollDataView">
        <archive-component v-bind="{ id, type: 0 }" />
      </tab>

      <tab
        v-if="$store.state.user?.userRights.pollDataView && hasSet"
        text="Текущие данные"
      >
        <equip-set-list
          v-bind="{
            id,
            hasEquipEvents: hasEquipEvents,
            hasSetDataColdWater: hasSetDataColdWater,
            hasColdWater: hasColdWater,
            hasTimeSync: hasTimeSync,
          }"
        />
      </tab>
      <tab v-if="$store.state.user?.userRights.equipEdit" text="Отчетные формы">
        <equip-forms v-bind="{ id }" />
      </tab>
      <tab text="Наборы и мнемосхемы">
        <equip-schema-list v-bind="{ id }" />
      </tab>
      <tab
        v-if="$store.state.user?.userRights.reportFile"
        text="Сформированные отчеты"
      >
        <report-file-list v-bind="{ id, type: 21 }" />
      </tab>

      <tab v-if="$store.state.user?.userRights.equip" text="Файлы">
        <file-list v-bind="{ id, type: DBTYPE }" />
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
    <transition>
      <wizard
        v-if="wizard"
        v-bind="wizard"
        @cancel="onWizardCancel"
        @end="onWizardEnd"
      />
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive } from 'vue'
import { onBeforeMount, getCurrentInstance, onMounted } from 'vue'
import { computed } from 'vue'

import { ReportObjectTypeEnum } from '@/classes/enum/ReportObjectTypeEnum'

import { Equip, EquipError } from '@/classes/equip'

import ArchiveComponent from '../Archive/ArchiveComponent.vue'
import EquipDetail from './EquipDetail.vue'
import EquipForms from './EquipForms.vue'
import EquipSchemaList from './EquipSchemaList.vue'
import EquipSetList from './EquipSetList.vue'
import FileList from '../FileList/FileList.vue'
import JournalList from '../Journal/JournalList.vue'
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
import EquipDetailSetting from '@/components/Equip/EquipDetailSetting.vue'
import { Events } from '@/events'
import { Emitter } from 'mitt'

import { store } from '@/store/store'

export default defineComponent({
  components: {
    ArchiveComponent,
    EquipDetail,
    EquipForms,
    EquipSchemaList,
    EquipSetList,
    FileList,
    JournalList,
    PreserverComponent,
    ReportComponent,
    ReportFileList,
    StateList,
    SystemMessages,
    Tab,
    Tabx,
    Tabs,
    Wizard,
    EquipDetailSetting,
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
    hasSet: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    hasEquipEvents: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    hasSetDataColdWater: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    hasColdWater: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    reportTypes: {
      type: Array,
      default: () => [],
    },
    hasTimeSync: {
      type: Boolean as PropType<boolean>,
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
      new Equip({ uuid: props.uuid, id: props.id }),
      new EquipError({})
    )

    const localEquip = reactive({})
    const instance = getCurrentInstance()

    const hasEquipSettingEdit = computed(
      () => store.state.equip.hasEquipSettingEdit
    )
    const hasParam = computed(() => store.state.equip.equipTopNav?.hasParam)
    const hasSetting = computed(() => store.state.equip.equipTopNav?.hasSetting)
    const hasReport = computed(() => store.state.equip.equipTopNav?.hasReport)
    const hasArchive = computed(() => store.state.equip.equipTopNav?.hasArchive)
    const hasData = computed(() => store.state.equip.equipTopNav?.hasData)
    const hasForm = computed(() => store.state.equip.equipTopNav?.hasForm)
    const hasScheme = computed(() => store.state.equip.equipTopNav?.hasScheme)
    const hasReadyReport = computed(
      () => store.state.equip.equipTopNav?.hasReadyReport
    )
    const hasFile = computed(() => store.state.equip.equipTopNav?.hasFile)
    const hasState = computed(() => store.state.equip.equipTopNav?.hasState)
    const hasNotify = computed(() => store.state.equip.equipTopNav?.hasNotify)
    const hasLog = computed(() => store.state.equip.equipTopNav?.hasLog)

    onBeforeMount(() => {
      if (instance) {
        const emitter: Emitter<Events> =
          instance.appContext.config.globalProperties.$emitter

        emitter.on('equip-detail:equip', (equip: Equip) => {
          Object.assign(localEquip, equip)
        })
      }
    })
    onMounted(() => {
      store.state.equip.hasSetDataColdWater = props.hasSetDataColdWater
      store.state.equip.hasTimeSync = props.hasTimeSync
    })

    function onGroupChange() {
      if (localItem.value.editable) {
        hasChanges.value = true
      }
    }

    return {
      DBTYPE: 'DbEquip',
      hasChanges,
      localItem,
      loading,
      localError,
      onChanged,
      onGroupChange,
      onWizardCancel,
      onWizardEnd,
      ReportObjectTypeEnum,
      save,
      saving,
      wizard,

      localEquip,
      hasEquipSettingEdit,
      hasParam,
      hasSetting,
      hasReport,
      hasArchive,
      hasData,
      hasForm,
      hasScheme,
      hasReadyReport,
      hasFile,
      hasState,
      hasNotify,
      hasLog,
    }
  },
})
</script>

<style scoped>
.equip-grid {
  display: grid;
  gap: 5px 3px;
  min-width: 450px;
}

.equip-grid.two {
  grid-template-columns: auto 1fr;
}

.equip-grid label {
  text-align: right;
}

.equip-grid label[disabled='true'],
.equip-grid div[disabled='true'] {
  opacity: 0.5;
}

.equip-grid .equip-set {
  padding: 2px 4px;
  border: thin solid darkgray;
  border-radius: 3px;
  height: 100%;
  min-height: 22px;
}

.equip-button {
  padding: 1px;
  border: 1px solid lightslategray;
  min-width: 1.3em;
  border-radius: 2px;
  display: flex;
  justify-content: center;
}
</style>
