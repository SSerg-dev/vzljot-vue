<template>
  <div class="grid">
    <div class="grid">
      <div class="grid two">
        <label>Состояние:</label>
        <select v-model="value.enabled" @change="onChange()">
          <option :value="false">отключен</option>
          <option :value="true">включен</option>
        </select>
      </div>
      <check-box
        v-model="value.useSystem"
        :disabled="!value.enabled"
        @update:modelValue="onChange()"
        >использовать параметры системы</check-box
      >
      <div class="grid" style="grid-template-columns: max-content 1fr">
        <label :disabled="disabled">Данные:</label>
        <div class="grid" style="grid-template-columns: repeat(3, 200px)">
          <template
            v-for="([k, v], index) in Object.entries(
              $store.state.env.pollDataTypes
            )"
          >
            <check-box
              v-if="
                value[v.type] !== null &&
                hasShowDataColdWater(index) &&
                hasShowTimeSync(index)
              "
              :key="k"
              v-model="value[v.type]"
              :disabled="disabled"
              @update:modelValue="onChange()"
              :class="{ 'validation-error': error.pollDataType }"
              :title="error.pollDataType"
              >{{ v.text }}</check-box
            >
          </template>
        </div>
      </div>
    </div>

    <div class="grid">
      <div class="grid two">
        <label :disabled="disabled"
          >Разрешенный интервал сбора и рассылки:</label
        >
        <div class="grid" style="grid-template-columns: repeat(8, auto)">
          <number-box
            @update:modelValue="onChange()"
            :disabled="disabled"
            v-model="value.allowStartHour"
            style="width: 25px"
            :min="0"
            :max="23"
          />
          <label :disabled="disabled">ч</label>
          <number-box
            @update:modelValue="onChange()"
            :disabled="disabled"
            v-model="value.allowStartMin"
            style="width: 25px"
            :min="0"
            :max="59"
          />
          <label :disabled="disabled">мин</label>
          <number-box
            @update:modelValue="onChange()"
            :disabled="disabled"
            v-model="value.allowEndHour"
            style="width: 25px"
            :min="0"
            :max="23"
          />
          <label :disabled="disabled">ч</label>
          <number-box
            @update:modelValue="onChange()"
            :disabled="disabled"
            v-model="value.allowEndMin"
            style="width: 25px"
            :min="0"
            :max="59"
          />
          <label :disabled="disabled">мин</label>
        </div>
      </div>
      <div class="grid two">
        <label :disabled="disabled">Диапазон сбора архивов:</label>
        <div class="grid two">
          <select
            v-model="value.depthType"
            @change="onChange()"
            :disabled="disabled"
          >
            <option :value="0">на глубину</option>
            <option :value="1">с даты</option>
          </select>
          <div class="grid two" v-if="value.depthType === 0">
            <number-box
              @update:modelValue="onChange()"
              :disabled="disabled"
              v-model="value.depth"
              style="width: 50px"
              :min="1"
              :max="999"
            />
            <label :disabled="disabled">дн.</label>
          </div>
          <date-picker
            v-else
            @update:modelValue="onChange()"
            :disabled="disabled"
            v-model="value.dateStart"
            :format="dateFormat"
            style="width: 90px"
          />
        </div>
      </div>
      <div class="grid two">
        <label :disabled="disabled"
          >Периодичность обновления приборных настроек:</label
        >
        <div
          class="grid"
          style="grid-template-columns: min-content min-content"
        >
          <number-box
            :disabled="disabled"
            @update:modelValue="onChange()"
            v-model="value.periodEquipSettings"
            style="width: 3em"
            :min="1"
            :max="999"
          />
          <label :disabled="disabled">дн.</label>
        </div>
      </div>
    </div>
    <check-box
      v-model="value.allowCaptureData"
      @update:modelValue="onChange()"
      :disabled="disabled"
      >Разрешить сбор отсутствующих данных вне диапазона</check-box
    >
    <check-box
      v-model="value.autoEnableControl"
      @update:modelValue="onChange()"
      :disabled="disabled"
      >Автоматическое включение контроля при поступлении данных</check-box
    >
    <expantion-panel
      caption="Контроль поступления и рассылки данных"
      :resizable="false"
    >
      <div class="grid">
        <div class="grid two">
          <label :disabled="!value.enabled">Состояние:</label>
          <select
            :disabled="!value.enabled"
            v-model="value.control"
            @change="onChange()"
          >
            <option :value="false">отключен</option>
            <option :value="true">включен</option>
          </select>
        </div>
        <check-box
          v-model="value.controlSystem"
          @update:modelValue="onChange()"
          :disabled="!value.enabled || !value.control"
          >использовать параметры системы</check-box
        >
        <tabs>
          <tabx
            text="Архивы"
            v-if="
              pollData.archiveHour ||
              pollData.archiveDay ||
              pollData.archiveMonth
            "
          >
            <poll-period-props
              @change="onPeriodArchiveChange"
              v-bind="periodArchiveData"
            />
          </tabx>
          <tabx text="Данные наборов" v-if="pollData.setParams">
            <poll-period-props
              @change="onPeriodSetParamsChange"
              v-bind="periodSetParamsData"
            />
          </tabx>
          <tabx text="Текущие события" v-if="pollData.equipEvents">
            <poll-period-props
              @change="onPeriodEquipEventsChange"
              v-bind="periodEquipEventsData"
            />
          </tabx>
          <tabx text="Настроечные параметры" v-if="pollData.equipCustomizing">
            <poll-period-props
              @change="onPeriodEquipCustomizingChange"
              v-bind="periodEquipCustomizingData"
            />
          </tabx>

          <tabx text="Рассылка параметров ХВ" v-if="pollData.setDataColdWater">
            <poll-period-props
              @change="onPeriodSetDataColdWaterChange"
              v-bind="periodSetDataColdWaterData"
            />
          </tabx>
          <tabx text="Параметры ХВ" v-if="pollData.coldWater">
            <poll-period-props
              @change="onPeriodColdWaterChange"
              v-bind="periodColdWaterData"
            />
          </tabx>
          <tabx text="База параметров" v-if="pollData.equipDatabaseParams">
            <poll-period-props
              @change="onPeriodEquipDatabaseParamsChange"
              v-bind="periodEquipDatabaseParamsData"
            />
          </tabx>
          <tabx text="Синхронизация времени" v-if="pollData.timeSync">
            <poll-period-props
              @change="onPeriodTimeSyncChange"
              v-bind="periodTimeSyncData"
            />
          </tabx>
        </tabs>
        <div
          style="margin: 10px 0 10px 0; height: 1px; background-color: #ecf0f6"
        />
        <div class="grid two">
          <check-box
            v-model="value.autoDisableControl"
            :disabled="!value.enabled || !value.control || value.controlSystem"
            @update:modelValue="onChange()"
            >Автоматическое выключение контроля после:</check-box
          >
          <div
            :disabled="!value.enabled || !value.control || value.controlSystem"
          >
            <number-box
              @update:modelValue="onChange()"
              :disabled="
                !value.enabled ||
                !value.control ||
                value.controlSystem ||
                !value.autoDisableControl
              "
              v-model="value.retryCount"
              style="width: 25px"
              :min="0"
              :max="99"
            />
            попыток
          </div>
          <label
            :disabled="!value.enabled || !value.control || value.controlSystem"
            >Время ожидания:</label
          >
          <div
            :disabled="!value.enabled || !value.control || value.controlSystem"
          >
            <number-box
              @update:modelValue="onChange()"
              :disabled="
                !value.enabled || !value.control || value.controlSystem
              "
              v-model="value.waitHour"
              style="width: 25px"
              :min="0"
              :max="23"
            />
            ч
            <number-box
              @update:modelValue="onChange()"
              :disabled="
                !value.enabled || !value.control || value.controlSystem
              "
              v-model="value.waitMin"
              style="width: 25px"
              :min="0"
              :max="59"
            />
            мин
          </div>
        </div>
      </div>
    </expantion-panel>
    <expantion-panel caption="Настройки автовызова" :resizable="false">
      <div class="grid two">
        <label :disabled="!value.enabled || !value.control">Состояние:</label>
        <select
          :disabled="!value.enabled || !value.control"
          v-model="value.autoRequest"
          @change="onChange()"
        >
          <option :value="false">отключен</option>
          <option :value="true">включен</option>
        </select>
      </div>
    </expantion-panel>
  </div>
</template>

<script>
import { matchType } from '../../plugins/api.js'

import CheckBox from '../Inputs/CheckBox.vue'
import NumberBox from '../Inputs/NumberBox.vue'
import DatePicker from '../Inputs/DatePicker.vue'
import ExpantionPanel from '../ExpantionPanel.vue'
import PollPeriodProps from '../SystemProps/PollPeriodProps.vue'
import Tabs from '../Tabs/Tabs.vue'
import Tabx from '../Tabs/Tabx.vue'

export default {
  components: {
    CheckBox,
    NumberBox,
    DatePicker,
    ExpantionPanel,
    PollPeriodProps,
    Tabs,
    Tabx,
  },
  props: {
    pollData: Object,
    error: Object,
  },
  data() {
    return {
      dateFormat: 'DD.MM.YYYY',
      value: JSON.parse(JSON.stringify(this.pollData)),
    }
  },
  watch: {
    pollData: {
      handler(value) {
        this.value = JSON.parse(JSON.stringify(value))
      },
      deep: true,
    },
  },
  computed: {
    hasTimeSync() {
      return this.$store.state.equip.hasTimeSync
    },
    hasShowTimeSync() {
      return (index) => {
        if (this.hasTimeSync) {
          return true
        } else {
          const indicesToCheck = [9]
          return !indicesToCheck.includes(index)
        }
      }
    },
    hasSetDataColdWater() {
      return this.$store.state.equip.hasSetDataColdWater
    },
    hasShowDataColdWater() {
      return (index) => {
        if (this.hasSetDataColdWater) {
          return true
        } else {
          const indicesToCheck = [6, 7, 8]
          return !indicesToCheck.includes(index)
        }
      }
    },
    hasDataColdWater() {
      return this.value.setDataColdWater
    },
    disabled() {
      return !this.value.enabled || this.value.useSystem
    },
    periodTypes() {
      return matchType(this.$store.state.env.pollDataPeriodTypes)
    },
    pollDataTypes() {
      return matchType(this.$store.state.env.pollDataTypes)
    },
    periodArchiveData() {
      return Object.assign(
        {
          enabled:
            this.value.enabled &&
            this.value.control &&
            !this.value.controlSystem,
          error: Object.assign(
            { pollDataPeriod: this.error.periodArchive },
            this.error
          ),
        },
        this.value.periodArchive
      )
    },
    periodSetParamsData() {
      return Object.assign(
        {
          enabled:
            this.pollData.enabled &&
            this.pollData.control &&
            !this.value.controlSystem,
          error: Object.assign(
            { pollDataPeriod: this.error.periodSetParams },
            this.error
          ),
        },
        this.pollData.periodSetParams
      )
    },
    periodEquipEventsData() {
      return Object.assign(
        {
          enabled:
            this.pollData.enabled &&
            this.pollData.control &&
            !this.value.controlSystem,
          error: Object.assign(
            { pollDataPeriod: this.error.periodEquipEvents },
            this.error
          ),
        },
        this.pollData.periodEquipEvents
      )
    },
    periodEquipCustomizingData() {
      return Object.assign(
        {
          enabled:
            this.pollData.enabled &&
            this.pollData.control &&
            !this.value.controlSystem,
          error: Object.assign(
            { pollDataPeriod: this.error.periodEquipCustomizing },
            this.error
          ),
        },
        this.pollData.periodEquipCustomizing
      )
    },
    periodSetDataColdWaterData() {
      return Object.assign(
        {
          enabled:
            this.pollData.enabled &&
            this.pollData.control &&
            !this.value.controlSystem,
          error: Object.assign(
            { pollDataPeriod: this.error.periodSetDataColdWater },
            this.error
          ),
        },
        this.pollData.periodSetDataColdWater
      )
    },
    periodColdWaterData() {
      return Object.assign(
        {
          enabled:
            this.pollData.enabled &&
            this.pollData.control &&
            !this.value.controlSystem,
          error: Object.assign(
            { pollDataPeriod: this.error.periodColdWater },
            this.error
          ),
        },
        this.pollData.periodColdWater
      )
    },
    periodEquipDatabaseParamsData() {
      return Object.assign(
        {
          enabled:
            this.pollData.enabled &&
            this.pollData.control &&
            !this.value.controlSystem,
          error: Object.assign(
            { pollDataPeriod: this.error.periodEquipDatabaseParams },
            this.error
          ),
        },
        this.pollData.periodEquipDatabaseParams
      )
    },
    periodTimeSyncData() {
      return Object.assign(
        {
          enabled:
            this.pollData.enabled &&
            this.pollData.control &&
            !this.value.controlSystem,
          error: Object.assign(
            { pollDataPeriod: this.error.periodTimeSync },
            this.error
          ),
        },
        this.pollData.periodTimeSync
      )
    },
  },
  methods: {
    onChange() {
      this.$emit('changed', 'pollData', this.value)
    },
    onPeriodArchiveChange(value, prop) {
      this.value.periodArchive[prop] = value
      this.onChange()
    },
    onPeriodSetParamsChange(value, prop) {
      this.value.periodSetParams[prop] = value
      this.onChange()
    },
    onPeriodEquipEventsChange(value, prop) {
      this.value.periodEquipEvents[prop] = value
      this.onChange()
    },
    onPeriodEquipCustomizingChange(value, prop) {
      this.value.periodEquipCustomizing[prop] = value
      this.onChange()
    },
    onPeriodSetDataColdWaterChange(value, prop) {
      this.value.periodSetDataColdWater[prop] = value
      this.onChange()
    },
    onPeriodColdWaterChange(value, prop) {
      this.value.periodColdWater[prop] = value
      this.onChange()
    },
    onPeriodEquipDatabaseParamsChange(value, prop) {
      this.value.periodEquipDatabaseParams[prop] = value
      this.onChange()
    },
    onPeriodTimeSyncChange(value, prop) {
      this.value.periodTimeSync[prop] = value
      this.onChange()
    },
  },
}
</script>

<style scoped>
.grid {
  display: grid;
  gap: 5px 3px;
}

.grid.two {
  grid-template-columns: max-content max-content;
}

.grid select {
  width: fit-content;
}

.grid div[disabled='true'] {
  color: gray;
  opacity: 0.7;
}
</style>
