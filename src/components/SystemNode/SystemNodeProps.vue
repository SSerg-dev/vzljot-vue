<template>
  <div class="fit">
    <expantion-panel caption="Основные параметры">
      <div class="grid">
        <label>Наименование:</label>
        <input
          v-focus
          v-model.trim="localName"
          @input="onChanged('name', localName)"
          type="text"
          maxlength="50"
          :class="{ 'validation-error': localError.name }"
          :title="localError.name"
        />
        <label>IP-адрес:</label>
        <input
          v-model.trim="localInternalAddress"
          @input="onChanged('internalAddress', localInternalAddress)"
          type="text"
          maxlength="50"
          :class="{ 'validation-error': localError.internalAddress }"
          :title="localError.internalAddress"
        />
        <label>Порт службы приложений:</label>
        <number-box
          v-model="localApplicationServicePort"
          @update:modelValue="onChanged('applicationServicePort', $event)"
          :min="0"
          :max="65535"
        />
        <label>Порт службы обработки данных:</label>
        <number-box
          v-model="localDataServicePort"
          @update:modelValue="onChanged('dataServicePort', $event)"
          :min="0"
          :max="65535"
        />
        <label>Порт транспортной службы:</label>
        <number-box
          v-model="localTransportServicePort"
          @update:modelValue="onChanged('transportServicePort', $event)"
          :min="0"
          :max="65535"
        />
      </div>
    </expantion-panel>
    <expantion-panel v-if="localGroups" caption="Параметры транспорта">
      <div style="display: grid; grid-template-columns: auto auto; gap: 15px">
        <div class="grid-group">
          <label>COM-порт, USB, опто-порт:</label>
          <div class="group">
            <number-box
              v-model="serialHour"
              @update:modelValue="
                onGroupHourChanged('serial', localGroups.serial, $event)
              "
              :min="0"
              :max="23"
            />
            ч.
            <number-box
              v-model="serialMinute"
              @update:modelValue="
                onGroupMinuteChanged('serial', localGroups.serial, $event)
              "
              :min="0"
              :max="59"
            />
            м.
            <number-box
              v-model="serialSecond"
              @update:modelValue="
                onGroupSecondChanged('serial', localGroups.serial, $event)
              "
              :min="0"
              :max="59"
            />
            с.
          </div>
          <label>Ethernet:</label>
          <div class="group">
            <number-box
              v-model="ethernetHour"
              @update:modelValue="
                onGroupHourChanged('ethernet', localGroups.ethernet, $event)
              "
              :min="0"
              :max="23"
            />
            ч.
            <number-box
              v-model="ethernetMinute"
              @update:modelValue="
                onGroupMinuteChanged('ethernet', localGroups.ethernet, $event)
              "
              :min="0"
              :max="59"
            />
            м.
            <number-box
              v-model="ethernetSecond"
              @update:modelValue="
                onGroupSecondChanged('ethernet', localGroups.ethernet, $event)
              "
              :min="0"
              :max="59"
            />
            с.
          </div>
          <label>Модем, CSD:</label>
          <div class="group">
            <number-box
              v-model="csdHour"
              @update:modelValue="
                onGroupHourChanged('csd', localGroups.csd, $event)
              "
              :min="0"
              :max="23"
            />
            ч.
            <number-box
              v-model="csdMinute"
              @update:modelValue="
                onGroupMinuteChanged('csd', localGroups.csd, $event)
              "
              :min="0"
              :max="59"
            />
            м.
            <number-box
              v-model="csdSecond"
              @update:modelValue="
                onGroupSecondChanged('csd', localGroups.csd, $event)
              "
              :min="0"
              :max="59"
            />
            с.
          </div>
          <label>Взлет СПД:</label>
          <div class="group">
            <number-box
              v-model="spdHour"
              @update:modelValue="
                onGroupHourChanged('spd', localGroups.spd, $event)
              "
              :min="0"
              :max="23"
            />
            ч.
            <number-box
              v-model="spdMinute"
              @update:modelValue="
                onGroupMinuteChanged('spd', localGroups.spd, $event)
              "
              :min="0"
              :max="59"
            />
            м.
            <number-box
              v-model="spdSecond"
              @update:modelValue="
                onGroupSecondChanged('spd', localGroups.spd, $event)
              "
              :min="0"
              :max="59"
            />
            с.
          </div>
          <label>АССВ-030 GPRS (энергосбер.):</label>
          <div class="group">
            <number-box
              v-model="assvGprsPowerSavingModeHour"
              @update:modelValue="
                onGroupHourChanged(
                  'assvGprsPowerSavingMode',
                  localGroups.assvGprsPowerSavingMode,
                  $event
                )
              "
              :min="0"
              :max="23"
            />
            ч.
            <number-box
              v-model="assvGprsPowerSavingModeMinute"
              @update:modelValue="
                onGroupMinuteChanged(
                  'assvGprsPowerSavingMode',
                  localGroups.assvGprsPowerSavingMode,
                  $event
                )
              "
              :min="0"
              :max="59"
            />
            м.
            <number-box
              v-model="assvGprsPowerSavingModeSecond"
              @update:modelValue="
                onGroupSecondChanged(
                  'assvGprsPowerSavingMode',
                  localGroups.assvGprsPowerSavingMode,
                  $event
                )
              "
              :min="0"
              :max="59"
            />
            с.
          </div>
          <label>АССВ-030 GPRS (обычный):</label>
          <div class="group">
            <number-box
              v-model="assvGprsHour"
              @update:modelValue="
                onGroupHourChanged('assvGprs', localGroups.assvGprs, $event)
              "
              :min="0"
              :max="23"
            />
            ч.
            <number-box
              v-model="assvGprsMinute"
              @update:modelValue="
                onGroupMinuteChanged('assvGprs', localGroups.assvGprs, $event)
              "
              :min="0"
              :max="59"
            />
            м.
            <number-box
              v-model="assvGprsSecond"
              @update:modelValue="
                onGroupSecondChanged('assvGprs', localGroups.assvGprs, $event)
              "
              :min="0"
              :max="59"
            />
            с.
          </div>
        </div>
        <div
          style="
            display: flex;
            flex-direction: column;
            align-items: end;
            justify-content: space-between;
          "
        >
          <div class="grid-group">
            <label>АСЕВ-040:</label>
            <div class="group">
              <number-box
                v-model="asevHour"
                @update:modelValue="
                  onGroupHourChanged('asev', localGroups.asev, $event)
                "
                :min="0"
                :max="23"
              />
              ч.
              <number-box
                v-model="asevMinute"
                @update:modelValue="
                  onGroupMinuteChanged('asev', localGroups.asev, $event)
                "
                :min="0"
                :max="59"
              />
              м.
              <number-box
                v-model="asevSecond"
                @update:modelValue="
                  onGroupSecondChanged('asev', localGroups.asev, $event)
                "
                :min="0"
                :max="59"
              />
              с.
            </div>
            <label>GPRS:</label>
            <div class="group">
              <number-box
                v-model="gprsHour"
                @update:modelValue="
                  onGroupHourChanged('gprs', localGroups.gprs, $event)
                "
                :min="0"
                :max="23"
              />
              ч.
              <number-box
                v-model="gprsMinute"
                @update:modelValue="
                  onGroupMinuteChanged('gprs', localGroups.gprs, $event)
                "
                :min="0"
                :max="59"
              />
              м.
              <number-box
                v-model="gprsSecond"
                @update:modelValue="
                  onGroupSecondChanged('gprs', localGroups.gprs, $event)
                "
                :min="0"
                :max="59"
              />
              с.
            </div>
            <label>Остальные:</label>
            <div class="group">
              <number-box
                v-model="defaultHour"
                @update:modelValue="
                  onGroupHourChanged('default', localGroups.default, $event)
                "
                :min="0"
                :max="23"
              />
              ч.
              <number-box
                v-model="defaultMinute"
                @update:modelValue="
                  onGroupMinuteChanged('default', localGroups.default, $event)
                "
                :min="0"
                :max="59"
              />
              м.
              <number-box
                v-model="defaultSecond"
                @update:modelValue="
                  onGroupSecondChanged('default', localGroups.default, $event)
                "
                :min="0"
                :max="59"
              />
              с.
            </div>
          </div>
          <button v-if="systemNode.editable" @click="onDefaultClick">
            По умолчанию
          </button>
        </div>
      </div>
    </expantion-panel>

    <expantion-panel caption="Модемы">
      <div class="flex-two-line">
        <check-box
          v-model="localNextModemOnNoCarrierCsd"
          :disabled="false"
          @update:modelValue="
            onChangeNextModemOnNoCarrierCsd('nextModemOnNoCarrierCsd', $event)
          "
        >
          Переходить к следующему модему при ответе NO CARRIER для CSD
          подключений
        </check-box>

        <div class="second-line">
          <check-box
            v-model="localCountNextModemOnNoCarrierCsd"
            :disabled="!localNextModemOnNoCarrierCsd"
            @update:modelValue="
              onChangeCountNextModemOnNoCarrierCsd(
                'countNextModemOnNoCarrierCsd',
                $event
              )
            "
          >
            Ограничить количество переходов:
          </check-box>

          <number-box
            v-model="localLimitTransitions"
            :disabled="
              !localCountNextModemOnNoCarrierCsd ||
              !localNextModemOnNoCarrierCsd
            "
            @update:modelValue="onChanged('limitTransitions', $event)"
            :min="1"
            :max="1000"   
            class="numberbox"
          />
        </div>
      </div>
    </expantion-panel> 
  </div>
</template>

<script lang="ts">
import ExpantionPanel from '@/components/ExpantionPanel.vue'
import NumberBox from '@/components/Inputs/NumberBox.vue'
import CheckBox from '@/components/Inputs/CheckBox.vue'

import { defineComponent, PropType, ref, watch } from 'vue'
import { SystemNode, SystemNodeError } from '@/classes/systemNode'

export default defineComponent({
  components: {
    ExpantionPanel,
    NumberBox,
    CheckBox,
  },
  props: {
    systemNode: {
      type: Object as PropType<SystemNode>,
      required: true,
    },
    error: {
      type: Object as PropType<SystemNodeError>,
      required: true,
    },
  },
  setup(props) {
    const localName = ref(props.systemNode.name)
    const localInternalAddress = ref(props.systemNode.internalAddress)
    const localApplicationServicePort = ref(
      props.systemNode.applicationServicePort
    )
    const localDataServicePort = ref(props.systemNode.dataServicePort)
    const localTransportServicePort = ref(props.systemNode.transportServicePort)
    const localGroups = ref(JSON.parse(JSON.stringify(props.systemNode.groups)))

    const localNextModemOnNoCarrierCsd = ref(
      props.systemNode.nextModemOnNoCarrierCsd
    )
    const localCountNextModemOnNoCarrierCsd = ref(
      props.systemNode.countNextModemOnNoCarrierCsd
    )
    const localLimitTransitions = ref(props.systemNode.limitTransitions)

    let localError = ref(new SystemNodeError(props.error))

    watch(
      () => props.systemNode.nextModemOnNoCarrierCsd,
      (value) => (localNextModemOnNoCarrierCsd.value = value),
      { deep: true }
    )
    watch(
      () => props.systemNode.countNextModemOnNoCarrierCsd,
      (value) => (localCountNextModemOnNoCarrierCsd.value = value),
      { deep: true }
    )
    watch(
      () => props.systemNode.limitTransitions,
      (value) => {
        localLimitTransitions.value = value
        if (value === 0) {
          localLimitTransitions.value = 1
        }
      },
      { deep: true }
    )
    watch(
      () => props.systemNode.name,
      (value) => (localName.value = value)
    )
    watch(
      () => props.systemNode.internalAddress,
      (value) => (localInternalAddress.value = value)
    )
    watch(
      () => props.systemNode.applicationServicePort,
      (value) => (localApplicationServicePort.value = value)
    )
    watch(
      () => props.systemNode.dataServicePort,
      (value) => (localDataServicePort.value = value)
    )
    watch(
      () => props.systemNode.transportServicePort,
      (value) => (localTransportServicePort.value = value)
    )
    watch(
      () => props.systemNode.groups,
      (value) =>
        (localGroups.value = value ? JSON.parse(JSON.stringify(value)) : value),
      { deep: true }
    )

    watch(
      () => props.error,
      (value) => (localError.value = JSON.parse(JSON.stringify(value))),
      { deep: true }
    )

    return {
      localName,
      localInternalAddress,
      localApplicationServicePort,
      localDataServicePort,
      localTransportServicePort,
      localError,
      localGroups,
      localNextModemOnNoCarrierCsd,
      localCountNextModemOnNoCarrierCsd,
      localLimitTransitions,
    }
  },
  computed: {
    serialSecond: {
      get(): number {
        return this.getSeconds(this.localGroups.serial)
      },
      set(value: number) {
        this.localGroups.serial = this.setSeconds(
          this.localGroups.serial,
          value
        )
      },
    },
    serialMinute: {
      get(): number {
        return this.getMinutes(this.localGroups.serial)
      },
      set(value: number) {
        this.localGroups.serial = this.setMinutes(
          this.localGroups.serial,
          value
        )
      },
    },
    serialHour: {
      get(): number {
        return this.getHours(this.localGroups.serial)
      },
      set(value: number) {
        this.localGroups.serial = this.setHours(this.localGroups.serial, value)
      },
    },
    ethernetSecond: {
      get(): number {
        return this.getSeconds(this.localGroups.ethernet)
      },
      set(value: number) {
        this.localGroups.ethernet = this.setSeconds(
          this.localGroups.ethernet,
          value
        )
      },
    },
    ethernetMinute: {
      get(): number {
        return this.getMinutes(this.localGroups.ethernet)
      },
      set(value: number) {
        this.localGroups.ethernet = this.setMinutes(
          this.localGroups.ethernet,
          value
        )
      },
    },
    ethernetHour: {
      get(): number {
        return this.getHours(this.localGroups.ethernet)
      },
      set(value: number) {
        this.localGroups.ethernet = this.setHours(
          this.localGroups.ethernet,
          value
        )
      },
    },
    csdSecond: {
      get(): number {
        return this.getSeconds(this.localGroups.csd)
      },
      set(value: number) {
        this.localGroups.csd = this.setSeconds(this.localGroups.csd, value)
      },
    },
    csdMinute: {
      get(): number {
        return this.getMinutes(this.localGroups.csd)
      },
      set(value: number) {
        this.localGroups.csd = this.setMinutes(this.localGroups.csd, value)
      },
    },
    csdHour: {
      get(): number {
        return this.getHours(this.localGroups.csd)
      },
      set(value: number) {
        this.localGroups.csd = this.setHours(this.localGroups.csd, value)
      },
    },
    spdSecond: {
      get(): number {
        return this.getSeconds(this.localGroups.spd)
      },
      set(value: number) {
        this.localGroups.spd = this.setSeconds(this.localGroups.spd, value)
      },
    },
    spdMinute: {
      get(): number {
        return this.getMinutes(this.localGroups.spd)
      },
      set(value: number) {
        this.localGroups.spd = this.setMinutes(this.localGroups.spd, value)
      },
    },
    spdHour: {
      get(): number {
        return this.getHours(this.localGroups.spd)
      },
      set(value: number) {
        this.localGroups.spd = this.setHours(this.localGroups.spd, value)
      },
    },
    assvGprsPowerSavingModeSecond: {
      get(): number {
        return this.getSeconds(this.localGroups.assvGprsPowerSavingMode)
      },
      set(value: number) {
        this.localGroups.assvGprsPowerSavingMode = this.setSeconds(
          this.localGroups.assvGprsPowerSavingMode,
          value
        )
      },
    },
    assvGprsPowerSavingModeMinute: {
      get(): number {
        return this.getMinutes(this.localGroups.assvGprsPowerSavingMode)
      },
      set(value: number) {
        this.localGroups.assvGprsPowerSavingMode = this.setMinutes(
          this.localGroups.assvGprsPowerSavingMode,
          value
        )
      },
    },
    assvGprsPowerSavingModeHour: {
      get(): number {
        return this.getHours(this.localGroups.assvGprsPowerSavingMode)
      },
      set(value: number) {
        this.localGroups.assvGprsPowerSavingMode = this.setHours(
          this.localGroups.assvGprsPowerSavingMode,
          value
        )
      },
    },
    assvGprsSecond: {
      get(): number {
        return this.getSeconds(this.localGroups.assvGprs)
      },
      set(value: number) {
        this.localGroups.assvGprs = this.setSeconds(
          this.localGroups.assvGprs,
          value
        )
      },
    },
    assvGprsMinute: {
      get(): number {
        return this.getMinutes(this.localGroups.assvGprs)
      },
      set(value: number) {
        this.localGroups.assvGprs = this.setMinutes(
          this.localGroups.assvGprs,
          value
        )
      },
    },
    assvGprsHour: {
      get(): number {
        return this.getHours(this.localGroups.assvGprs)
      },
      set(value: number) {
        this.localGroups.assvGprs = this.setHours(
          this.localGroups.assvGprs,
          value
        )
      },
    },
    asevSecond: {
      get(): number {
        return this.getSeconds(this.localGroups.asev)
      },
      set(value: number) {
        this.localGroups.asev = this.setSeconds(this.localGroups.asev, value)
      },
    },
    asevMinute: {
      get(): number {
        return this.getMinutes(this.localGroups.asev)
      },
      set(value: number) {
        this.localGroups.asev = this.setMinutes(this.localGroups.asev, value)
      },
    },
    asevHour: {
      get(): number {
        return this.getHours(this.localGroups.asev)
      },
      set(value: number) {
        this.localGroups.asev = this.setHours(this.localGroups.asev, value)
      },
    },
    gprsSecond: {
      get(): number {
        return this.getSeconds(this.localGroups.gprs)
      },
      set(value: number) {
        this.localGroups.gprs = this.setSeconds(this.localGroups.gprs, value)
      },
    },
    gprsMinute: {
      get(): number {
        return this.getMinutes(this.localGroups.gprs)
      },
      set(value: number) {
        this.localGroups.gprs = this.setMinutes(this.localGroups.gprs, value)
      },
    },
    gprsHour: {
      get(): number {
        return this.getHours(this.localGroups.gprs)
      },
      set(value: number) {
        this.localGroups.gprs = this.setHours(this.localGroups.gprs, value)
      },
    },
    defaultSecond: {
      get(): number {
        return this.getSeconds(this.localGroups.default)
      },
      set(value: number) {
        this.localGroups.default = this.setSeconds(
          this.localGroups.default,
          value
        )
      },
    },
    defaultMinute: {
      get(): number {
        return this.getMinutes(this.localGroups.default)
      },
      set(value: number) {
        this.localGroups.default = this.setMinutes(
          this.localGroups.default,
          value
        )
      },
    },
    defaultHour: {
      get(): number {
        return this.getHours(this.localGroups.default)
      },
      set(value: number) {
        this.localGroups.default = this.setHours(
          this.localGroups.default,
          value
        )
      },
    },
  },
  methods: {
    getSeconds(value: number) {
      return (
        value / 1000 - (this.getHours(value) * 60 + this.getMinutes(value)) * 60
      )
    },
    setLimitTransitions(prop: number, value: number) {
      return prop + value
    },
    setSeconds(prop: number, value: number) {
      return (
        ((this.getHours(prop) * 60 + this.getMinutes(prop)) * 60 + value) * 1000
      )
    },
    getMinutes(value: number) {
      return Math.trunc((value / 1000 - this.getHours(value) * 60 * 60) / 60)
    },
    setMinutes(prop: number, value: number) {
      return (
        ((this.getHours(prop) * 60 + value) * 60 + this.getSeconds(prop)) * 1000
      )
    },
    setHours(prop: number, value: number) {
      return (
        ((value * 60 + this.getMinutes(prop)) * 60 + this.getSeconds(prop)) *
        1000
      )
    },
    getHours(value: number) {
      return Math.trunc(value / 60 / 60 / 1000)
    },
    onChanged(prop: string, value: any) {
      this.$emit('changed', prop, value)
    },
    onChangeNextModemOnNoCarrierCsd(prop: string, value: any) {
      this.$emit('changed', prop, value)
    },
    onChangeCountNextModemOnNoCarrierCsd(prop: string, value: any) { 
      this.$emit('changed', prop, value)
    },
    onGroupSecondChanged(prop: string, propValue: number, value: number) {
      this.$emit('groupChanged', prop, this.setSeconds(propValue, value))
    },
    onGroupMinuteChanged(prop: string, propValue: number, value: number) {
      this.$emit('groupChanged', prop, this.setMinutes(propValue, value))
    },
    onGroupHourChanged(prop: string, propValue: number, value: number) {
      this.$emit('groupChanged', prop, this.setHours(propValue, value))
    },

    onDefaultClick() {
      Object.entries(this.systemNode.defaultGroups).forEach(([k, v]) =>
        this.$emit('groupChanged', k, v)
      )
    },
  },
})
</script>

<style scoped>
.grid,
.grid-group {
  display: grid;
  gap: 5px 3px;
  grid-template-columns: auto 1fr;
}

.grid-group {
  align-self: flex-start;
}

.grid label,
.grid-group label {
  text-align: right;
}

.grid .numberbox,
.grid-group .numberbox {
  width: 60px;
}

.group {
  display: grid;
  gap: 5px 3px;
  grid-template-columns: repeat(6, min-content);
  align-items: baseline;
}

.group .numberbox {
  width: 2em;
}
.flex-two-line {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.second-line {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-left: 16px;
}

.numberbox {
  width: 60px;
}
</style>
