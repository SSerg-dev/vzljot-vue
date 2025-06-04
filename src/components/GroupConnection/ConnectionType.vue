<template>
  <div class="group-connection-type-grid">
    <div class="group-connection-type-grid two">
      <label>Тип подключения:</label>
      <select v-model="localGroupType" @change="onChanged(localGroupType)">
        <option v-for="r in connectionTypes" :key="r.type" :value="r.type">
          {{ r.name }}
        </option>
      </select>
    </div>
    <expantion-panel
      v-show="component != 'None'"
      caption="Параметры подключения"
      :staticHeight="false"
      :resizable="false"
    >
      <transition name="group-connection-fade" mode="out-in">
        <component
          :is="component"
          v-bind="Object.assign({}, componentData, { error })"
          @changed="onGroupChanged"
          @changeConnectionType="onChangeConnectionType"
        />
      </transition>
    </expantion-panel>
  </div>
</template>

<script>
import { asyncImport } from '../../plugins/api'

import ExpantionPanel from '../ExpantionPanel.vue'

export default {
  components: {
    None: asyncImport(() => import('./Connections/None.vue')),
    ASDV: asyncImport(() => import('./Connections/ASDV.vue')),
    ASEV: asyncImport(() => import('./Connections/ASEV.vue')),
    ASSV: asyncImport(() => import('./Connections/ASSV.vue')),
    ComPort: asyncImport(() => import('./Connections/ComPort.vue')),
    GPRS: asyncImport(() => import('./Connections/GPRS.vue')),
    Bars02Multiport_GPRS: asyncImport(() =>
      import('./Connections/BarsGPRS.vue')
    ),
    Ebyte: asyncImport(() => import('./Connections/Ebyte.vue')),
    Esco_GPRS: asyncImport(() => import('./Connections/EscoGPRS.vue')),
    Eldis_GPRS: asyncImport(() => import('./Connections/EldisGPRS.vue')),
    IOT_Vega_Server: asyncImport(() =>
      import('./Connections/IOTVegaServer.vue')
    ),
    Modem: asyncImport(() => import('./Connections/Modem.vue')),
    Radio: asyncImport(() => import('./Connections/Radio.vue')),
    OptoPortIEC1107: asyncImport(() => import('./Connections/OptoIEC.vue')),
    SPD: asyncImport(() => import('./Connections/SPD.vue')),
    TELEOFIS_WRX: asyncImport(() => import('./Connections/Teleofis.vue')),
    Internet_TFTP: asyncImport(() => import('./Connections/TFTP.vue')),
    Usr_Gprs232_730: asyncImport(() => import('./Connections/UsrGprs232.vue')),
    iRZ_ATM: asyncImport(() => import('./Connections/IRZ.vue')),
    BitCordSprutNet: asyncImport(() => import('./Connections/SprutGPRS.vue')),
    PulsarGPRS: asyncImport(() => import('./Connections/PulsarGPRS.vue')),
    Robustel: asyncImport(() => import('./Connections/Robustel.vue')),
    Lers_Lite: asyncImport(() => import('./Connections/LersLite.vue')),
    Lers_Plus: asyncImport(() => import('./Connections/LersPlus.vue')),
    LoRa: asyncImport(() => import('./Connections/LoRa.vue')),
    Karat902: asyncImport(() => import('./Connections/Karat902.vue')),
    Eldis1203_GPRS: asyncImport(() =>
      import('./Connections/Eldis1203GPRS.vue')
    ),
    Eldis210x_GPRS: asyncImport(() =>
      import('./Connections/Eldis210xGPRS.vue')
    ),
    Eldis310x_GPRS: asyncImport(() =>
      import('./Connections/Eldis310xGPRS.vue')
    ),
    Usb: asyncImport(() => import('./Connections/Usb.vue')),

    ExpantionPanel,
  },
  props: {
    connectionTypes: Array,
    groupType: Number,
    error: Object,
  },
  data() {
    return {
      localGroupType: this.groupType,
    }
  },
  computed: {
    component() {
      if (this.connectionTypes !== null && this.localGroupType) {
        const type = this.connectionTypes.find(
          (r) => r.type === this.localGroupType
        )
        if (type) {
          return type.component
        }
      }
      return null
    },
    componentData() {
      if (this.connectionTypes !== null && this.localGroupType) {
        const type = this.connectionTypes.find(
          (r) => r.type === this.localGroupType
        )
        if (type) {
          const options = {
            connectionGroup: type.data.group,
            devEUI:
              +type.data.group.adapter > 0 && +type.data.group.serverLoRa > 0
                ? +type.data.group.adapter
                : -1,
          }
          this.$store.commit('setEquip', options.devEUI)

          return type.data
        }
      }
      return null
    },
  },
  watch: {
    groupType(value) {
      this.localGroupType = value
    },
    localGroupType(value) {
      this.$emit('changeConnectionGroupType', value) 
    },
  },
  methods: {
    getData() {
      return this.componentData ? this.componentData.group : null
    },
    onChangeConnectionType(connectionType) {
      this.$emit('changeConnectionType', connectionType)
    },
    onChanged(value) {
      this.$emit('typeChanged', 'groupType', value)
    },
    onGroupChanged(prop, value) {
      this.componentData.group[prop] = value

      this.$emit('groupChanged', this.componentData.group)
    },
  },
}
</script>

<style>
.group-connection-type-grid {
  display: grid;
  gap: 5px 3px;
}

.group-connection-type-grid .two {
  grid-template-columns: auto 1fr;
}

.group-connection-type-grid > label {
  text-align: right;
}

.group-connection-fade-enter-active,
.group-connection-fade-leave-active {
  transition: opacity 0.2s ease;
}

.group-connection-fade-enter,
.group-connection-fade-leave-to {
  opacity: 0;
}

.connection-type {
  display: grid;
  gap: 5px 3px;
  grid-template-rows: max-content;
}

.connection-type.two {
  grid-template-columns: max-content max-content;
}

.connection-type select {
  width: fit-content;
}
</style>
