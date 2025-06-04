<template>
  <div class="component-detail">
    <tabs>
      <tabx v-if="$store.state.user?.userRights.systemNode" text="Параметры">
        <preserver-component
          v-bind="{
            readOnly,
            saving,
            disabled: !hasChanges || loading,
            loading,
          }"
          @saveClick="save()"
        >
          <system-node-props
            v-bind="{ systemNode: localItem, error: localError }"
            @changed="onChanged"
            @groupChanged="onGroupChanged"
          />
        </preserver-component>
      </tabx>

      <tabx v-if="$store.state.user?.userRights.systemNode" text="SIP-аккаунты">
        <preserver-component
          v-bind="{
            readOnly,
            saving,
            disabled: !hasChanges || loading,
            loading,
          }"
          @saveClick="save()"
        >
          <sip-accounts
            v-bind="{ items: localItem.sipAccounts }"
            @changed="onSipAccountChanged"
            @add="onSipAccountAdd"
            @remove="onSipAccountRemove"
          />
        </preserver-component>
      </tabx>
      <tabx
        v-if="$store.state.user?.userRights.systemNode"
        text="Модемы и пулы"
      >
        <preserver-component
          v-bind="{
            readOnly,
            saving,
            disabled: !hasChanges || loading,
            loading,
          }"
          @saveClick="save()"
        >
          <modem-pools
            v-bind="{ pools: localItem.pools, modems: localItem.modems }"
            @modemChanged="onModemChanged"
            @poolChanged="onPoolChanged"
            @modemAdd="onModemAdd"
            @poolAdd="onPoolAdd"
            @remove="onPoolRemove"
          />
        </preserver-component>
      </tabx>
      <tabx
        v-if="
          $store.state.user?.userRights.systemNode &&
          $store.state.user?.userRights.allowRedirectEndpoints
        "
        text="Перенаправление адаптеров"
      >
        <preserver-component
          v-bind="{
            readOnly,
            saving,
            disabled: !hasChanges || loading,
            loading,
          }"
          @saveClick="save()"
        >
          <redirect-endpoints
            v-bind="{
              items: localItem.endPoints,
              redirectEndPointProperties: localItem.redirectEndPointProperties,
            }"
            @changed="onEndPointChanged"
            @endPointPropertiesChanged="onEndPointPropertiesChanged"
            @add="onEndPointAdd"
            @remove="onEndPointRemove"
          />
        </preserver-component>
      </tabx>
      <tabx v-if="$store.state.user?.userRights.systemNode" text="Серверы LoRa">
        <preserver-component
          v-bind="{
            readOnly,
            saving,
            disabled: !hasChanges || loading,
            loading,
          }"
          @saveClick="save()"
        >
          <lora-servers
            v-bind="{ items: localItem.loraServers }"
            @changed="onLoraServerChanged"
            @add="onLoraServerAdd"
            @remove="onLoraServerRemove"
          />
        </preserver-component>
      </tabx>
      <tab
        v-if="$store.state.user?.userRights.reportFile"
        text="Сформированные отчеты"
      >
        <report-file-list v-bind="{ id, type: 18 }" />
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
import { computed, defineComponent, PropType, provide, ref, watch } from 'vue'

import { IModem, Modem } from '@/classes/modem'
import { IModemPool, ModemPool } from '@/classes/modemPool'
import { IRedirectEndPoint, RedirectEndPoint } from '@/classes/redirectEndPoint'
import { SipAccount, ISipAccount } from '@/classes/sipAccount'
import { RedirectEndPointProperties } from '@/classes/redirectEndPointProperties'
import { ILoraServer, LoraServer } from '@/classes/loraServer'
import {
  SystemNode,
  Group,
  Port,
  SystemNodeError,
} from '../../classes/systemNode'

import JournalList from '../Journal/JournalList.vue'
import LoraServers from './LoraServers.vue'
import ModemPools from './ModemPools.vue'
import PreserverComponent from '../PreserverComponent.vue'
import RedirectEndpoints from './RedirectEndpoints.vue'
import ReportFileList from '../ReportFile/ReportFileList.vue'
import SipAccounts from './SipAccounts.vue'
import StateList from '../States/StateList.vue'
import SystemMessages from '../SystemMessages/SystemMessages.vue'
import SystemNodeProps from './SystemNodeProps.vue'
import Tab from '../Tabs/Tab.vue'
import Tabx from '../Tabs/Tabx.vue'
import Tabs from '../Tabs/Tabs.vue'
import Wizard from '../Wizard.vue'
import { setupTreeComponent } from '../Base/baseComponent'
import { store } from '@/store/store'

export default defineComponent({
  components: {
    JournalList,
    PreserverComponent,
    LoraServers,
    ModemPools,
    ReportFileList,
    RedirectEndpoints,
    SipAccounts,
    StateList,
    SystemMessages,
    SystemNodeProps,
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
      new SystemNode({ uuid: props.uuid }),
      new SystemNodeError({})
    )

    const comPortSpeeds = ref<Array<number>>([])
    const serialPort = ref<number | undefined>(0)
    const serialPorts = ref<Array<Port>>([])

    provide('comPortSpeeds', comPortSpeeds)
    provide('serialPort', serialPort)
    provide('serialPorts', serialPorts)

    watch(
      () => localItem.value.comPortSpeeds,
      (value) => (comPortSpeeds.value = value)
    )

    watch(
      () => localItem.value.serialPort,
      (value) => (serialPort.value = value)
    )

    watch(
      () => localItem.value.serialPorts,
      (value) => (serialPorts.value = value)
    )

    const readOnly = computed(() => {
      return !(
        store.state.user?.userRights.systemNodeEdit ||
        store.state.user?.userRights.sipAccountEdit ||
        store.state.user?.userRights.modemPoolEdit ||
        store.state.user?.userRights.redirectEndpointEdit ||
        store.state.user?.userRights.loRaServerEdit
      )
    })

    const onGroupChanged = (prop: keyof Group, value: number) => {
      if (localItem.value.editable && localItem.value.groups !== undefined) {
        (localItem.value.groups[prop] as number) = value
        hasChanges.value = true
      }
    }

    const onSipAccountChanged = (sipAccount: SipAccount) => {
      const sip = localItem.value.sipAccounts.find(
        (r) => r.uuid === sipAccount.uuid
      )

      if (sip) {
        (Object.keys(sip) as (keyof ISipAccount)[]).forEach(
          (r) =>
            ((sip[r] as string | number | boolean | undefined) = sipAccount[r])
        )
        hasChanges.value = true
      }
    }

    const onSipAccountAdd = (sipAccount: SipAccount) => {
      localItem.value.sipAccounts.push(sipAccount)
      hasChanges.value = true
    }

    const onSipAccountRemove = (sipAccounts: Array<string>) => {
      localItem.value.sipAccounts = localItem.value.sipAccounts.filter(
        (r) => !sipAccounts.includes(r.uuid)
      )
      hasChanges.value = true
    }

    function onModemAdd(modem: Modem, pool: ModemPool | undefined) {
      if (pool === undefined) {
        localItem.value.modems.push(modem)
      } else {
        pool.modems.push(modem)
      }

      hasChanges.value = true
    }

    const onPoolAdd = (pool: ModemPool) => {
      localItem.value.pools.push(pool)
      hasChanges.value = true
    }

    function onPoolRemove(items: Array<string>) {
      localItem.value.modems = localItem.value.modems.filter(
        (r) => !items.includes(r.uuid)
      )
      localItem.value.pools = localItem.value.pools.filter(
        (r) => !items.includes(r.uuid)
      )

      localItem.value.pools.forEach((r) => {
        r.modems = r.modems.filter((r) => !items.includes(r.uuid))
      })

      hasChanges.value = true
    }

    const onModemChanged = (modem: Modem) => {
      const modems: Array<Modem> = []
      localItem.value.pools
        .map((pool) => pool.modems)
        .forEach((r) => modems.push(...r))
      modems.push(...localItem.value.modems)

      const local = modems.find((r) => r.uuid === modem.uuid)

      if (local) {
        (Object.keys(local) as (keyof IModem)[]).forEach(
          (r) =>
            ((local[r] as
              | string
              | number
              | boolean
              | undefined
              | Array<number>) = modem[r])
        )
        hasChanges.value = true
      }
    }

    const onPoolChanged = (pool: ModemPool) => {
      const local = localItem.value.pools.find((r) => r.uuid === pool.uuid)

      if (local) {
        (Object.keys(local) as (keyof IModemPool)[]).forEach(
          (r) =>
            ((local[r] as
              | string
              | number
              | boolean
              | undefined
              | Array<Modem>) = pool[r])
        )
        hasChanges.value = true
      }
    }

    const onEndPointChanged = (redirectEndPoint: IRedirectEndPoint) => {
      const endPoint = localItem.value.endPoints.find(
        (r) => r.uuid === redirectEndPoint.uuid
      )

      if (endPoint) {
        (Object.keys(endPoint) as (keyof IRedirectEndPoint)[]).forEach(
          (r) =>
            ((endPoint[r] as string | number | boolean | undefined) =
              redirectEndPoint[r])
        )
        hasChanges.value = true
      }
    }

    function onEndPointPropertiesChanged(
      redirectEndPointProperties: RedirectEndPointProperties
    ) {
      localItem.value.redirectEndPointProperties =
        new RedirectEndPointProperties(redirectEndPointProperties)
      hasChanges.value = true
    }

    const onEndPointAdd = (redirectEndPoint: RedirectEndPoint) => {
      localItem.value.endPoints.push(redirectEndPoint)
      hasChanges.value = true
    }

    const onEndPointRemove = (redirectEndPoints: Array<string>) => {
      localItem.value.removeRedirectEndpoints(redirectEndPoints)
      hasChanges.value = true
    }

    const onLoraServerChanged = (loraServer: ILoraServer) => {
      const server = localItem.value.loraServers.find(
        (r) => r.uuid === loraServer.uuid
      ) as ILoraServer

      if (server) {
        (Object.keys(server) as (keyof ILoraServer)[]).forEach(
          (r) =>
            ((server[r] as string | number | boolean | undefined) =
              loraServer[r])
        )
        // Object.keys(server).forEach(r => server[r] = loraServer[r])

        hasChanges.value = true
      }
    }

    function onLoraServerAdd(loraServer: LoraServer) {
      localItem.value.loraServers.push(loraServer)
      hasChanges.value = true
    }

    function onLoraServerRemove(loraServers: Array<string>) {
      localItem.value.removeLoraServers(loraServers)
      hasChanges.value = true
    }

    return {
      DBTYPE: 'DbSystemNode',
      hasChanges,
      localItem,
      loading,
      localError,
      onChanged,
      onEndPointChanged,
      onEndPointAdd,
      onEndPointRemove,
      onEndPointPropertiesChanged,
      onGroupChanged,
      onLoraServerAdd,
      onLoraServerChanged,
      onLoraServerRemove,
      onModemChanged,
      onPoolChanged,
      onModemAdd,
      onPoolAdd,
      onPoolRemove,
      onSipAccountChanged,
      onSipAccountAdd,
      onSipAccountRemove,
      onWizardCancel,
      onWizardEnd,
      readOnly,
      save,
      saving,
      wizard,
    }
  },
})
</script>
