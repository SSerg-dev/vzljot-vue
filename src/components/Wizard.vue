<template>
  <modal
    @cancel="onCancel()"
    :background="background"
    :cancellable="isCancellable"
  >
    <template v-slot:header>
      <span>{{ currentComponent.text }}</span>
    </template>
    <template v-slot:content>
      <div style="position: relative">
        <div class="component-detail" style="overflow: visible">
          <component
            ref="component"
            :key="currentComponent.key"
            :is="currentComponent.component"
            v-bind="currentComponent.data"
            @[currentComponent.event]="onComponentEvent"
            @loaded="onLoaded"
            @mounted="onMounted"
          />
        </div>
        <spinner :show="loading || wait" :text="waitText" />
      </div>
    </template>
    <template v-slot:footer>
      <button :disabled="nextDisabled" @click="handleOkClick">
        {{ hasNext ? 'Далее' : 'Ok' }}
      </button>
      <button v-if="isCancellable" @click="onCancel()">Отмена</button>
    </template>
  </modal>
</template>

<script>
import { asyncImport } from '../plugins/api'

import Modal from './Modal.vue'
import Selector from './SelectorComponent.vue'
import SelectorOption from './SelectorOption.vue'
import Message from './Message.vue'

export default {
  name: 'wizard-component',
  components: {
    AddressProps: asyncImport(() => import('./Address/AddressProps.vue')),
    AddressHouseProps: asyncImport(() =>
      import('./Address/AddressHouseProps.vue')
    ),
    ArchiveSettings: asyncImport(() => import('./Archive/ArchiveSettings.vue')),
    BalanceGroupDetail: asyncImport(() =>
      import('./BalanceGroup/BalanceGroupDetail.vue')
    ),
    BalanceGroupItemsFilter: asyncImport(() =>
      import('./BalanceGroup/BalanceGroupItemsFilter.vue')
    ),
    CertPassword: asyncImport(() => import('./Users/CertPassword.vue')),
    CustomPropsFilter: asyncImport(() =>
      import('./CustomProps/CustomPropsFilter.vue')
    ),
    CustomProp: asyncImport(() => import('./CustomProps/CustomProp.vue')),
    EquipDetail: asyncImport(() => import('./Equip/EquipDetail.vue')),
    EquipListFilter: asyncImport(() =>
      import('./EquipList/EquipListFilter.vue')
    ),
    EquipListProps: asyncImport(() => import('./EquipList/EquipListProps.vue')),
    EquipSetSettings: asyncImport(() => import('./Equip/EquipSetSettings.vue')),
    EquipTypeModificationProps: asyncImport(() =>
      import('./EquipType/ModificationProps.vue')
    ),
    EquipTypeProps: asyncImport(() => import('./EquipType/EquipTypeProps.vue')),
    EquipTypesFilter: asyncImport(() =>
      import('./EquipType/EquipTypesFilter.vue')
    ),
    FileFilter: asyncImport(() => import('./FileList/FileFilter.vue')),
    FormParams: asyncImport(() => import('./ReportForm/FormParams.vue')),
    GroupConnectionDetail: asyncImport(() =>
      import('./GroupConnection/GroupConnectionDetail.vue')
    ),
    ImportData: asyncImport(() => import('./Import/ImportData.vue')),
    ImportDataSelector: asyncImport(() => import('./Import/DataSelector.vue')),
    ImportFileSelector: asyncImport(() => import('./Import/FileSelector.vue')),
    JournalFilter: asyncImport(() => import('./Journal/JournalFilter.vue')),
    LoraServerProps: asyncImport(() =>
      import('./SystemNode/LoraServerProps.vue')
    ),
    Measures: asyncImport(() => import('./MeasuresComponent.vue')),
    Message,
    Modal,
    ModemProps: asyncImport(() => import('./SystemNode/ModemProps.vue')),
    ModemPoolProps: asyncImport(() =>
      import('./SystemNode/ModemPoolProps.vue')
    ),
    NodeDetail: asyncImport(() => import('./Node/NodeDetail.vue')),
    PollDataSettings: asyncImport(() => import('./Poll/PollDataSettings.vue')),
    PointGroupDetail: asyncImport(() =>
      import('./PointGroup/PointGroupDetail.vue')
    ),
    PointListFilter: asyncImport(() =>
      import('./PointList/PointListFilter.vue')
    ),
    PointListProps: asyncImport(() => import('./PointList/PointListProps.vue')),
    PointProps: asyncImport(() => import('./Point/PointProps.vue')),
    PointsFilter: asyncImport(() => import('./Point/PointListFilter.vue')),
    RedirectEndPointProps: asyncImport(() =>
      import('./SystemNode/RedirectEndPointProps.vue')
    ),
    ReportFileListFilter: asyncImport(() =>
      import('./ReportFile/ReportFileListFilter.vue')
    ),
    ReportMoek: asyncImport(() => import('./Report/ReportMoek.vue')),
    ReportParams: asyncImport(() => import('./Report/ReportParams.vue')),
    ReportPassport: asyncImport(() => import('./Report/ReportPassport.vue')),
    ReportTaskProps: asyncImport(() =>
      import('./ReportTask/ReportTaskProps.vue')
    ),
    ReportTasksFilter: asyncImport(() =>
      import('./ReportTask/ReportTasksFilter.vue')
    ),
    Selector,
    SelectorOption,
    SetDetail: asyncImport(() => import('./Set/SetDetail.vue')),
    SetListFilter: asyncImport(() => import('./Set/SetListFilter.vue')),
    SetSettings: asyncImport(() => import('./Set/Settings.vue')),
    SipAccountProps: asyncImport(() =>
      import('./SystemNode/SipAccountProps.vue')
    ),
    StatesFilter: asyncImport(() => import('./States/StatesFilter.vue')),
    SymbolSchemasFilter: asyncImport(() =>
      import('./SymbolSchema/SymbolSchemasFilter.vue')
    ),
    SystemMessagesFilter: asyncImport(() =>
      import('./SystemMessages/SystemMessagesFilter.vue')
    ),
    TestEmail: asyncImport(() => import('./SystemProps/TestEmail.vue')),
    TestSms: asyncImport(() => import('./SystemProps/TestSms.vue')),
    UsersFilter: asyncImport(() => import('./Users/UsersFilter.vue')),
    UserProps: asyncImport(() => import('./Users/UserProps.vue')),
    UserGroupProps: asyncImport(() => import('./Users/UserGroupProps.vue')),
    UserSubscriptionProps: asyncImport(() =>
      import('./Users/UserSubscriptionProps.vue')
    ),
    Verify: asyncImport(() => import('./Report/VerifyReport.vue')),
    WriteValue: asyncImport(() => import('./SymbolSchema/WriteValue.vue')),
  },
  props: {
    name: {
      type: String,
      default: null,
    },
    component: {
      type: Object,
      default: () => ({
        event: null,
      }),
    },
    background: {
      type: String,
      default: 'rgba(169, 175, 183, 0.7)',
    },
    cancellable: {
      type: Boolean,
      default: true,
    },
    wait: Boolean,
    waitText: String,
  },
  data() {
    return {
      currentComponent: this.initComponent(this.component),
      currentValue: null,
      loading: false,
    }
  },
  emits: ['cancel', 'end', 'change'],
  watch: {
    component: {
      handler(value) {
        this.currentComponent = this.initComponent(value)
      },
      deep: true,
    },
  },
  computed: {
    hasNext() {
      return typeof this.currentComponent.next === 'function'
    },
    nextDisabled() {
      if (
        Object.prototype.hasOwnProperty.call(this.currentComponent, 'isLast')
      ) {
        return !this.currentComponent.isLast
      }

      if (this.currentComponent.event === null) {
        return false
      }
      return (
        this.currentValue === null ||
        (Array.isArray(this.currentValue) && this.currentValue.length === 0
          ? true
          : false)
      )
    },
    isCancellable() {
      return this.cancellable && this.currentComponent.cancellable
    },
  },
  methods: {
    handleOkClick() {
      this.next()
      this.sendOk()
    },
    sendOk() {
      const options = {
        hasEquipSettingSave: true,
      }
      this.$emitter.emit('equip-setting-node:save', options)
    },
    initComponent(value) {
      return Object.assign(
        { cancellable: true, event: null, key: new Date().getTime() },
        value
      )
    },
    onMounted() {
      this.loading = true
    },
    onLoaded() {
      this.loading = false
    },
    onCancel() {
      this.currentValue = null

      this.$emit('cancel', this.name)
    },
    onComponentEvent(data) {
      this.currentValue = data
      this.$emit('change', this.currentValue)
    },
    async next() {
      if (typeof this.$refs.component.getCertPassword === 'function') {
        let result = await this.$refs.component.getCertPassword()
        if (typeof result === 'string') {
          this.currentValue = result
          this.$emit('change', this.currentValue)
        }
      }

      if (typeof this.$refs.component.validate === 'function') {
        if (!(await this.$refs.component.validate())) {
          return
        }
      }

      if (typeof this.$refs.component.save === 'function') {
        if (!(await this.$refs.component.save())) {
          return
        }
      }

      if (this.hasNext) {
        try {
          this.loading = true
          this.currentComponent = this.initComponent(
            await this.currentComponent.next(this.currentValue)
          )
        } catch (error) {
          this.$store.commit('error', error)
        } finally {
          this.loading = false
        }
      } else {
        this.$emit(
          'end',
          this.currentValue,
          this.name,
          this.currentComponent.component
        )
      }

      this.currentValue = null
    },
  }, // end methods
}
</script>
