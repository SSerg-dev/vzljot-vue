<template>
  <div class="fit">
    <expantion-panel
      caption="Основные параметры"
      :staticHeight="false"
      :largeWidth="true"
    >
      <div class="equip-grid two">
        <label>Наименование:</label>
        <input
          v-model.trim="localEquip.name"
          @input="onChange('name', $event.target.value)"
          type="text"
          maxlength="80"
          :class="{ 'validation-error': localError.name }"
          :title="localError.name"
        />
        <label>Примечание:</label>
        <input
          v-model="localEquip.note"
          @input="onChange('note', $event.target.value)"
          type="text"
          maxlength="200"
        />
        <label>Модель:</label>
        <select
          v-if="!localEquip.id"
          v-model="localEquip.equipType"
          @change="onEquipTypeChange(localEquip.parentId, localEquip.type)"
          :class="{ 'validation-error': localError.equipType }"
          :title="localError.equipType"
        >
          <option
            v-for="(item, index) in localEquip.equipTypes"
            :key="index"
            :value="item.code"
          >
            {{ item.name }}
          </option>
        </select>

        <input v-else v-model="equipTypeInfo.name" type="text" readonly />

        <label v-if="hasShowVegaFields">Идентификатор DevEUI (hex):</label>
        <input
          v-if="hasShowVegaFields"
          v-model.trim="localEquip.serialNumber"
          @input="onChange('serialNumber', $event.target.value)"
          type="text"
          maxlength="200"
          :class="{ 'validation-error': localError.devEUI }"
          :title="localError.devEUI"
        />

        <div />

        <div
          :style="{
            'justify-content': 'right',
            display: 'grid',
            'grid-template-columns': 'auto auto',
            gap,
            'justify-items': 'right',
          }"
        >
          <label
            v-if="
              (!localEquip.isGroupType('none') ||
                localEquip.isEquipTypeVisible(localEquip.equipType)) &&
              localEquip.isBusAddressVisible(localEquip.equipType)
            "
            >Сетевой адрес:
            <number-box
              v-if="!localEquip.isGroupType('IOT_Vega_Server')"
              v-model="localEquip.busAddress"
              @update:modelValue="onChange('busAddress', $event)"
              style="width: 60px"
              :class="{ 'validation-error': localError.busAddress }"
              :title="localError.busAddress"
            />
            <input
              v-else
              v-model="localEquip.networkId"
              @input="onChange('networkId', $event.target.value)"
              style="width: 60px"
              :class="{ 'validation-error': localError.networkId }"
              :title="localError.networkId"
              type="text"
              maxlength="80"
            />
          </label>

          <div
            style="margin-left: 10px"
            v-if="!localEquip.isVega(localEquip.equipType)"
          >
            <label>
              Заводской номер:
              <input
                v-model.trim="localEquip.serialNumber"
                @input="onChange('serialNumber', $event.target.value)"
                type="text"
                style="width: 100px"
                maxlength="30"
                :class="{ 'validation-error': localError.serialNumber }"
                :title="localError.serialNumber"
              />
            </label>
          </div>

          <div
            v-if="
              localEquip.isGroupType('comPort') &&
              !isConnectionTypeEthernet &&
              !localEquip.isVega(localEquip.equipType)
            "
          >
            Стоповые биты:
            <select
              v-model="localEquip.stopBit"
              @change="onChange('stopBit', localEquip.stopBit)"
            >
              <option
                v-for="[k, v] in Object.entries($store.state.env.stopBitsEnum)"
                :key="k"
                :value="v.value"
              >
                {{ v.text }}
              </option>
            </select>
          </div>

          <div
            v-if="
              localEquip.isGroupType('comPort') &&
              !isConnectionTypeEthernet &&
              !localEquip.isGroupType('none')
            "
          >
            Четность:
            <select
              v-model="localEquip.parity"
              @change="onChange('parity', localEquip.parity)"
            >
              <option
                v-for="[k, v] in Object.entries($store.state.env.parityEnum)"
                :key="k"
                :value="v.value"
              >
                {{ v.text }}
              </option>
            </select>
          </div>

          <div
            v-if="
              (!localEquip.isGroupType('none') &&
                !localEquip.isGroupType('ASDV')) ||
              (localEquip.isGroupType('comPort') &&
                !isConnectionTypeEthernet &&
                !localEquip.isVega(localEquip.equipType))
            "
          >
            Попытки опроса:
            <select
              v-model="localEquip.retry"
              @change="onChange('retry', localEquip.retry)"
            >
              <option :value="null">Авто</option>
              <option :value="1">1</option>
              <option :value="2">2</option>
              <option :value="3">3</option>
              <option :value="4">4</option>
              <option :value="5">5</option>
            </select>
          </div>
          <label v-if="Object.keys(protocols).length > 0"
            >Протокол:
            <select
              v-model="localEquip.protocol"
              @input="onChange('protocol', $event.target.value)"
            >
              <option
                v-for="key in Object.keys(protocols)"
                :key="key"
                :value="key"
              >
                {{ protocols[key] }}
              </option>
            </select>
          </label>
          <label v-if="equipTypeInfo.hasOwnProperty('password')"
            >Пароль:
            <input
              v-model.trim="localEquip.password"
              @input="onChange('password', $event.target.value)"
              type="text"
              style="width: 80px"
              maxlength="20"
              :class="{ 'validation-error': localError.password }"
              :title="localError.password"
            />
          </label>
        </div>

        <connection-type
          style="grid-column: span 2"
          v-if="localEquip.showGroup"
          :error="localError.group"
          :groupType="localEquip.groupType"
          :connectionTypes="localEquip.connectionTypes"
          @changeConnectionGroupType="onGroupTypeChange"
          @groupChanged="onGroupChanged"
        />

        <equip-detail-time-sync
          style="grid-column: span 2"
          :timeZonesType="localEquip.timeZonesType"
          :timeZones="localEquip.timeZones"
          @onChangedTimeZoneType="handleTimeZoneType"
        />
      </div>
    </expantion-panel>
    <div v-if="!isCreate">
      <expantion-panel
        caption="Средство измерения"
        :opened="false"
        :largeWidth="true"
      >
        <equip-detail-modifications
          v-bind="{ equip: localEquip }"
          @modifications-updated="handleModificationsUpdated"
          @last-checking-updated="handleLastCheckingUpdated"
          @next-checking-updated="handleNextCheckingUpdated"
        />
      </expantion-panel>

      <expantion-panel
        v-if="equip.id !== null"
        caption="Сбор и рассылка данных"
        :opened="false"
        :largeWidth="true"
      >
        <data-capture
          ref="dataCapture"
          v-bind="{ pollData: localEquip.pollData, error }"
          @changed="onChange"
        />
      </expantion-panel>
      <expantion-panel
        v-if="localEquip.id !== null"
        caption="Анализ"
        :opened="false"
        :largeWidth="true"
      >
        <div class="equip-grid">
          <check-box
            @update:modelValue="
              onChange('analyze', { ...localEquip.analyze, checked: $event })
            "
            v-model="localEquip.analyze.checked"
            >Выполнять анализ настроечных параметров</check-box
          >
          <div class="equip-grid two">
            <label :disabled="!localEquip.analyze.checked"
              >Набор эталонных настроек:</label
            >
            <div
              style="
                display: grid;
                grid-template-columns: 1fr min-content min-content;
                gap: 3px;
                align-items: center;
              "
            >
              <input
                :disabled="!localEquip.analyze.checked"
                type="text"
                readonly
                v-model="localEquip.analyze.standard.name"
                :class="{ 'validation-error': localError.set }"
                :title="localError.set"
              />
              <div
                :disabled="!localEquip.analyze.checked"
                class="fas fa-ellipsis-h icon equip-button"
                @click="selectSet(localEquip.id, 'standard')"
                title="Выбрать набор..."
              />
              <div
                :disabled="!localEquip.analyze.checked"
                class="fas fa-times icon equip-button"
                @click="clearStandardSet(localEquip.id, 'source')"
                title="Очистить набор"
              />
            </div>
            <label :disabled="!localEquip.analyze.checked"
              >Набор проектных настроек:</label
            >
            <div
              style="
                display: grid;
                grid-template-columns: 1fr min-content min-content;
                gap: 3px;
                align-items: center;
              "
            >
              <input
                :disabled="!localEquip.analyze.checked"
                type="text"
                readonly
                v-model="localEquip.analyze.project.name"
                :class="{ 'validation-error': localError.set }"
                :title="localError.set"
              />
              <div
                :disabled="!localEquip.analyze.checked"
                class="fas fa-ellipsis-h icon equip-button"
                @click="selectSet(localEquip.id, 'project')"
                title="Выбрать набор..."
              />
              <div
                :disabled="!localEquip.analyze.checked"
                class="fas fa-times icon equip-button"
                @click="clearProjectSet()"
                title="Очистить набор"
              />
            </div>
            <label :disabled="!localEquip.analyze.checked"
              >Допустимая погрешность, %:</label
            >
            <input
              type="number"
              @input="
                onChange('analyze', {
                  ...localEquip.analyze,
                  margin: $event.target.value,
                })
              "
              v-model="localEquip.analyze.margin"
              style="width: 60px"
              step="0.1"
              :min="0"
              :max="5"
              :disabled="!localEquip.analyze.checked"
              :class="{ 'validation-error': localError.margin }"
              :title="localError.margin"
            />
          </div>
        </div>
      </expantion-panel>

      <expantion-panel
        v-if="hasSetDataColdWater"
        caption="Рассылка параметров холодной воды"
        :opened="false"
        :largeWidth="true"
      >
        <div class="connection-type cold-water-container">
          <div class="container-1">
            <div class="item-1-1">
              <check-box
                v-model="localEquip.coldWater.checkedTemperature"
                @update:modelValue="handleColdWaterCheck('temperature', $event)"
                >Выполнять рассылку температуры ХВ</check-box
              >
            </div>

            <div class="item-1-2">
              <check-box
                v-model="localEquip.coldWater.checkedPressure"
                @update:modelValue="handleColdWaterCheck('pressure', $event)"
                >Выполнять рассылку давления ХВ</check-box
              >
            </div>
          </div>

          <div class="container-2">
            <div class="item-2-1">
              <label>Источник:</label>
            </div>

            <div class="item-2-2">
              <input
                :disabled="
                  !(
                    localEquip.coldWater.checkedTemperature ||
                    localEquip.coldWater.checkedPressure
                  )
                "
                type="text"
                readonly
                v-model="localEquip.coldWater.source.name"
                :class="{ 'validation-error': localError.source }"
                :title="localError.source"
              />
            </div>

            <div class="item-2-3">
              <div
                :disabled="
                  !(
                    localEquip.coldWater.checkedTemperature ||
                    localEquip.coldWater.checkedPressure
                  )
                "
                class="fas fa-ellipsis-h icon equip-button"
                @click="handleColdWaterSourceSelect(localEquip.id, 'source')"
                title="Выбрать источник..."
              />
            </div>

            <div class="item-2-4">
              <div
                :disabled="
                  !(
                    localEquip.coldWater.checkedTemperature ||
                    localEquip.coldWater.checkedPressure
                  )
                "
                class="fas fa-times icon equip-button"
                @click="handleColdWaterSourceClear"
                title="Очистить источник"
              />
            </div>
          </div>
        </div>
      </expantion-panel>

      <expantion-panel
        v-if="localEquip.customProps && localEquip.customProps.length > 0"
        caption="Пользовательские параметры"
        :opened="false"
        :largeWidth="true"
      >
        <object-props
          v-bind="{ customProps: localEquip.customProps }"
          @changed="onChange"
        />
      </expantion-panel>
    </div>

    <transition>
      <wizard
        v-if="wizard"
        v-bind="wizard"
        @cancel="cancelWizard"
        @end="onWizardEnd"
        @change="onColdWaterChanged"
      />
    </transition>
  </div>
</template>

<script>
import { Equip } from '@/classes/equip'

import { matchType } from '../../plugins/api.js'

import CheckBox from '../Inputs/CheckBox.vue'
import DataCapture from './DataCapture.vue'
import NumberBox from '../Inputs/NumberBox.vue'
import ExpantionPanel from '../ExpantionPanel.vue'
import ConnectionType from '../GroupConnection/ConnectionType.vue'
import ObjectProps from '../CustomProps/ObjectProps.vue'
import Wizard from '../Wizard.vue'

import { wizardSelectSet } from '@/plugins/wizardComponents/wizardSelectSet'
import { wizardSourceSelectSet } from '@/plugins/wizardComponents/wizardSourceSelectSet'

import EquipDetailModifications from '@/components/Equip/EquipDetailModifications.vue'
import EquipDetailTimeSync from '@/components/Equip/EquipDetailTimeSync.vue'

export default {
  components: {
    CheckBox,
    ConnectionType,
    DataCapture,
    NumberBox,
    ExpantionPanel,
    ObjectProps,
    Wizard,
    EquipDetailModifications,
    EquipDetailTimeSync,
  },
  props: {
    equip: {
      type: Equip,
      default: () => new Equip({}),
    },
    error: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      localEquip: new Equip(this.equip),
      localError: JSON.parse(JSON.stringify(this.error)),
      wizard: null,
      action: '',
      isTemperature: false,
      isPressure: false,
      oldColdWaterSource: null,
      localConnectionGroupAdapter:
        this.$store.state.equip.connectionGroup.adapter,
      notConnectType: Object.freeze(10),
      loRaConnectType: Object.freeze(25),
      localConnectType: -1,
    }
  },
  created() {
    this.$watch(
      '$store.state.equip.groupType',
      (value) => {
        this.localConnectType = value
      },
      { deep: true }
    )
    this.$watch(
      () => this.equip,
      (value) => (this.localEquip = new Equip(value)),
      { deep: true }
    )
    this.$watch(
      () => this.error,
      (value) => (this.localError = JSON.parse(JSON.stringify(value))),
      { deep: true }
    )
    this.$watch(
      () => this.localEquip.timeZones,
      (value) => {
        this.$store.state.env.timeZones = value
      },
      { deep: true }
    )
    this.$watch(
      () => this.$store.state.equip.connectionGroup.adapter,
      (value) => {
        if (value) {
          this.localConnectionGroupAdapter = value
        }
      },
      { deep: true }
    )
  },
  computed: {
    hasShowVegaFields() {
      let result
      const isVega = this.localEquip.isVega(this.localEquip.equipType)
      const isLoRaConnect =
        this.localEquip.groupType === this.loRaConnectType ? true : false

      /* $$ 
      const isCreate = this.action === 'create' ? true : false
      result = (isVega && isCreate && !isLoRaConnect ? true : false) ||
               (isVega && !isCreate && !isLoRaConnect ? true : false) 
      */
      result =
        isVega &&
        !isLoRaConnect &&
        this.$store.state.equip.groupConnectionType !== this.loRaConnectType

      return result
    },
    isCreate() {
      return this.$store.state.card.isNodeCreate
    },
    hasSetDataColdWater() {
      return this.$store.state.equip.hasSetDataColdWater
    },
    equipTypeInfo() {
      return this.localEquip.equipTypes && this.localEquip.equipTypes.length > 0
        ? this.localEquip.getEquipTypeInfo(this.localEquip.equipType)
        : {}
    },
    protocols() {
      return this.equipTypeInfo.protocols ? this.equipTypeInfo.protocols : {}
    },
    gap() {
      let count =
        (this.localEquip.isGroupType('comPort') &&
        !this.isConnectionTypeEthernet
          ? 2
          : 0) +
        (Object.keys(this.protocols).length > 0 ? 1 : 0) +
        (this.equipTypeInfo.hasOwnProperty('password') ? 1 : 0) +
        (!this.localEquip.isGroupType('none') &&
        this.localEquip.isBusAddressVisible(this.localEquip.equipType)
          ? 1
          : 0)
      return count > 0 ? '5px 10px' : '5px 0'
    },
    isConnectionTypeEthernet() {
      if (
        this.localEquip.connectionTypes &&
        this.localEquip.connectionTypes.length > 0
      ) {
        const connectionGroupTypes = matchType(
          this.$store.state.env.connectionGroupTypes
        )
        const connectionTypes = matchType(this.$store.state.env.connectionTypes)

        return (
          this.localEquip.connectionTypes[connectionGroupTypes.comPort].data
            .group.type === connectionTypes.comPort_RSEthernet
        )
      }

      return false
    },
  },

  async mounted() {
    this.$emitter.emit('equip-detail:equip', this.localEquip)

    this.$emit('mounted')
    if (!this.localEquip.id) {
      this.create(this.localEquip.parentId, this.localEquip.type)
    }
  },
  methods: {
    selectSet(id, type) {
      this.wizard =
        type === 'standard'
          ? wizardSelectSet(this.$http, id, type)
          : wizardSelectSet(this.$http, id, type)
    },
    clearStandardSet() {
      this.onChange('analyze', {
        ...this.localEquip.analyze,
        standard: { id: null, name: null },
      })
    },
    selectColdWaterSource(id, type) {
      this.wizard = wizardSourceSelectSet(this.$http, id, type)
      if (!this.oldColdWaterSource) {
        // assign clone
        this.oldColdWaterSource = { ...this.localEquip.coldWater.source }
      }
    },
    clearColdWaterSource() {
      this.equip.coldWater.source.id = null
      this.localEquip.coldWater.source.name = ''

      this.onChange('source', {
        ...this.localEquip.coldWater,
        source: { id: null, name: null },
      })
    },
    clearProjectSet() {
      this.onChange('analyze', {
        ...this.localEquip.analyze,
        project: { id: null, name: null },
      })
    },
    onWizardEnd(data, name) {
      this.wizard = null

      const optionsColdWater = {
        ...this.localEquip.coldWater,
        [name]: { id: data[0].id, name: data[0].name },
      }
      const optionsAnalyze = {
        ...this.localEquip.analyze,
        [name]: { id: data[0].id, name: data[0].name },
      }
      if (name === 'source') {
        this.onChange('source', optionsColdWater)
        return
      } else {
        this.onChange('analyze', optionsAnalyze)
      }
    },
    cancelWizard(name) {
      this.wizard = null

      if (name === 'source') {
        this.equip.coldWater.source.id = this.oldColdWaterSource.id
        this.localEquip.coldWater.source.name = this.oldColdWaterSource.name
      }
    },
    onChange(prop, value) {
      this.$emit('changed', prop, value)
      if (prop === 'serialNumber') {
        this.$store.state.equip.devEUI = value
      }
      if (this.action !== 'create') {
        this.action = 'change'
      }
    },
    onColdWaterChanged(selectedItem) {
      if (selectedItem[0].id > 0) {
        this.equip.coldWater.source.id = selectedItem[0].id
        this.localEquip.coldWater.source.name = selectedItem[0].name
      }
    },
    onGroupTypeChange(groupType) {
      this.localEquip.groupType = groupType
      this.onChange('groupType', groupType)
    },
    onGroupChanged(group) {
      this.$emit('groupChanged', group)
    },
    async onEquipTypeChange(parentId, type) {
      try {
        const { data } = await this.$http.get('equip/getConnectionTypes', {
          params: { parentId, type, code: this.localEquip.equipType },
        })

        const options = {
          nodeChange: {
            equipType: this.localEquip.equipType,
          },
        }
        this.$store.commit('setCard', options)
        this.$emitter.emit(
          'equip-detail:change-equip-type',
          this.localEquip.equipType
        )

        this.localEquip.connectionTypes = data

        const connectionGroupTypes = matchType(
          this.$store.state.env.connectionGroupTypes
        )
        const comPortConnection = data.find(
          (r) => r.type === connectionGroupTypes.comPort
        )
        if (
          data.find((r) => r.type === connectionGroupTypes.comPort)
            ? this.localEquip.groupType !== connectionGroupTypes.comPort
            : this.localEquip.groupType !== connectionGroupTypes.none
        ) {
          this.localEquip.groupType = comPortConnection
            ? connectionGroupTypes.comPort
            : connectionGroupTypes.none
          this.onChange('groupType', this.localEquip.groupType)
        }

        if (!this.localEquip.id) {
          const equpTypeInfo = this.localEquip.getEquipTypeInfo(
            this.localEquip.equipType
          )
          const oldEqupTypeInfo = this.localEquip.getEquipTypeInfo(
            this.oldLocalEquipType
          )

          if (
            !this.localEquip.name ||
            this.localEquip.name === oldEqupTypeInfo.name
          ) {
            this.localEquip.name = equpTypeInfo.name
            this.onChange('name', equpTypeInfo.name)
          }

          if (
            this.localEquip.password !== equpTypeInfo.hasOwnProperty('password')
              ? equpTypeInfo.password
              : null
          ) {
            this.localEquip.password = equpTypeInfo.hasOwnProperty('password')
              ? equpTypeInfo.password
              : null
            this.onChange('password', this.localEquip.password)
          }

          if (this.localEquip.busAddress !== equpTypeInfo.defaultBusAddress) {
            this.localEquip.busAddress = equpTypeInfo.defaultBusAddress
            this.onChange('busAddress', this.localEquip.busAddress)
          }

          if (this.localEquip.protocol !== 0) {
            this.localEquip.protocol = 0
            this.onChange('protocol', this.localEquip.protocol)
          }

          if (this.localEquip.networkId !== null) {
            this.localEquip.networkId = null
            this.onChange('networkId', this.localEquip.networkId)
          }

          if (this.localEquip.retry !== null) {
            this.localEquip.retry = null
            this.onChange('retry', this.localEquip.retry)
          }

          this.oldLocalEquipType = this.localEquip.equipType
        }

        this.onChange('equipType', this.localEquip.equipType)
      } catch (error) {
        this.$store.commit('error', error)
      }
    },
    async create(parentId, type) {
      try {
        await this.localEquip.create(this.$http, parentId, type)

        this.action = 'create'
        const options = {
          nodeChange: {
            timeLastChecking: null,
            timeNextChecking: null,
          },
        }

        this.$store.commit('setCard', options)
        this.$emitter.emit('equip-detail:create-equip', type)

        this.oldLocalEquipType = this.localEquip.equipType

        this.$emit('loaded')
      } catch (error) {
        this.$store.commit('error', error)
      }
    },
    async save() {
      try {
        this.localError = {}
        this.action = ''
        this.$store.state.equip.connectionGroup.adapter = ''

        await this.localEquip.save()

        return true
      } catch (error) {
        if (error.response?.status !== 552) {
          if (error.response?.status === 551) {
            this.localError = error.response.data
          } else {
            this.$store.commit('error', error)
          }
        }
      }
    },

    handleModificationsUpdated(changedModifications) {
      const type = this.action

      switch (type) {
        case 'change':
          this.equip.equipTypeModificationId = changedModifications.id
          this.onChange('modifications', changedModifications.id)
          break
        case 'create':
          this.localEquip.equipTypeModificationId = changedModifications.id
          this.onChange('modifications', changedModifications.id)
          break
        default:
          this.equip.equipTypeModificationId = changedModifications.id
          this.onChange('modifications', changedModifications.id)
          break
      }
    },
    handleLastCheckingUpdated(changedLastChecking) {
      const type = this.action
      switch (type) {
        case 'change':
          this.equip.timeLastChecking = changedLastChecking
          this.onChange('last-checking', changedLastChecking)
          break
        case 'create':
          this.localEquip.timeLastChecking = changedLastChecking
          this.onChange('last-checking', changedLastChecking)
          break
        default:
          this.equip.timeLastChecking = changedLastChecking
          this.onChange('last-checking', changedLastChecking)
          break
      }
    },
    handleNextCheckingUpdated(changedNextChecking) {
      const type = this.action
      switch (type) {
        case 'change':
          this.equip.timeNextChecking = changedNextChecking
          this.onChange('next-checking', changedNextChecking)
          break
        case 'create':
          this.localEquip.timeNextChecking = changedNextChecking
          this.onChange('next-checking', changedNextChecking)
          break
        default:
          this.equip.timeNextChecking = changedNextChecking
          this.onChange('next-checking', changedNextChecking)
          break
      }
    },
    handleColdWaterSourceSelect(id, type) {
      this.selectColdWaterSource(id, type)
    },
    handleColdWaterSourceClear() {
      this.clearColdWaterSource()
    },
    handleColdWaterCheck(type, event) {
      switch (type) {
        case 'temperature':
          this.isTemperature = event
          this.localEquip.coldWater.checkedTemperature = event
          break
        case 'pressure':
          this.isPressure = event
          this.localEquip.coldWater.checkedPressure = event
          break

        default:
          break
      }
      this.onChange('coldWater', {
        ...this.localEquip.coldWater,
      })
    },
    updatedEquipSetting(changedValues) {
      this.onChange('equipSetting', changedValues)
    },
    handleTimeZoneType(timeZonesType) {
      this.onChange('timeZone', timeZonesType)
      this.$store.state.equip.timeZonesType = timeZonesType
    },
  }, // end methods
}
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

.equip-grid.three-container {
  grid-template-columns: auto auto 1fr;
  grid-template-rows: auto auto 1fr;
}

.three-item-1,
.three-item-3,
.three-item-5 {
  justify-self: end;
}

.three-item-2,
.three-item-4,
.three-item-6 {
  grid-column: 2 / span 2;
}

.date-picker {
  width: 20%;
}

/*  */
.cold-water-container {
  display: flex;
  flex-direction: column;
}
.container-1 {
  display: flex;
  flex-direction: row;
  column-gap: 3px;
}
.container-2 {
  display: flex;
  column-gap: 3px;
  align-items: center;
}
.item-1-1 {
  justify-self: start;
  align-self: center;
  margin-right: 10px;
}
.item-1-2 {
  align-self: center;
  margin-right: 10px;
}
.item-2-1 {
  justify-self: start;
  align-self: stretch;
  margin-right: 2px;
  margin-left: 5px;
}
.item-2-2 {
  width: 100%;
  align-self: center;
}
.item-2-3,
.item-2-4 {
  align-self: center;
}

input {
  width: 100%;
}
</style>
