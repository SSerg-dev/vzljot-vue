<template>
  <div class="connection-type container">
    <div class="container-1">
      <div class="item-1-1">
        <check-box
          v-model="localCheckedTemperature"
          @update:modelValue="
            handleColdWaterCheck('source', {
              ...localEquip.coldWater,
              type: 'temperature',
              checked: $event,
            })
          "
          >Выполнять рассылку температуры ХВ</check-box
        >
      </div>

      <div class="item-1-2">
        <check-box
          v-model="localCheckedPressure"
          @update:modelValue="
            handleColdWaterCheck('source', {
              ...localEquip.coldWater,
              type: 'pressure',
              checked: $event,
            })
          "
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
          :disabled="!(localCheckedTemperature || localCheckedPressure)"
          type="text"
          readonly
          v-model="localEquip.analyze.standard.name"
          :class="{ 'validation-error': localError.set }"
          :title="localError.set"
        />
      </div>

      <div class="item-2-3">
        <div
          :disabled="!(localCheckedTemperature || localCheckedPressure)"
          class="fas fa-ellipsis-h icon equip-button"
          @click="handleColdWaterSourceSelect(localEquip.id, 'source')"
          title="Выбрать источник..."
        />
      </div>

      <div class="item-2-4">
        <div
          :disabled="!(localCheckedTemperature || localCheckedPressure)"
          class="fas fa-times icon equip-button"
          @click="handleColdWaterSourceClear()"
          title="Очистить источник"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { Equip } from '@/classes/equip'
import CheckBox from '@/components/Inputs/CheckBox.vue'

export default {
  name: 'EquipDetailColdWater',
  components: {
    CheckBox,
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

      localCheckedTemperature: false,
      localCheckedPressure: true,
      action: '',
    }
  },
  created() {
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
  },
  methods: {
    handleColdWaterCheck(prop, options) {
      switch (options.type) {
        case 'temperature':
          this.localCheckedTemperature = options.checked
          options.checkedTemperature = options.checked
          this.$emit('cold-water-temperature-check', prop, options)
          break
        case 'pressure':
          this.localCheckedPressure = options.checked
          options.checkedPressure = options.checked
          this.$emit('cold-water-pressure-check', prop, options)
          break

        default:
          break
      }
    },
    handleColdWaterSourceSelect(id, type) {
      const options = {
        id,
        type,
      }
      this.$emit('cold-water-source-select', options)
    },
    handleColdWaterSourceClear() {
      this.$emit('cold-water-source-clear')
    },
  },
}
</script>

<style>
.container {
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
.equip-button {
  padding: 1px;
  border: 1px solid lightslategray;
  min-width: 1.3em;
  border-radius: 2px;
  display: flex;
  justify-content: center;
}
input {
  width: 100%;
}
</style>
