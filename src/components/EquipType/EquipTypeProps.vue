<template>
  <expantion-panel caption="Основные параметры" :resizable="false" class="fit">
    <div class="equip-type-props-grid">
      <label>Наименование:</label>
      <input v-if="!isSystem" v-model.trim="localName" type="text" maxlength="80" @input="onChange('name', localName)" style="width: 200px" :class="{ 'validation-error': localError.name }" :title="localError.name" />
      <div v-else style="width: 200px">{{ localName }}</div>
      <label>Межповерочный интервал:</label>
      <div style="display: grid; gap: 5px 3px; grid-template-columns: auto 1fr">
        <number-box v-if="!isSystem" v-model="localInterval" type="text" :min="0" :max="99" @update:modelValue="onChange('interval', $event)" style="width: 25px" />
        <div v-else>{{ localInterval }}</div>
        <span>{{ yearCaption }}</span>
      </div>
      <label>Является датчиком:</label>
      <div v-if="!isSystem" style="display: grid; gap: 5px 3px; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr))">
        <check-box v-model="localIsTemperature" @update:modelValue="onChange('isTemperature', $event)">температуры</check-box>
        <check-box v-model="localIsPressure" @update:modelValue="onChange('isPressure', $event)">давления</check-box>
        <check-box v-model="localIsVolume" @update:modelValue="onChange('isVolume', $event)">расхода</check-box>
        <check-box v-model="localIsWeight" @update:modelValue="onChange('isWeight', $event)">массового расхода</check-box>
      </div>
      <div v-else>{{ sensorCaption }}</div>
    </div>
  </expantion-panel>
</template>

<script>
import CheckBox from '../Inputs/CheckBox.vue'
import ExpantionPanel from '../ExpantionPanel.vue'
import NumberBox from '../Inputs/NumberBox.vue'

import EquipType from '../../classes/equipType'

export default {
  components: {
    CheckBox,
    ExpantionPanel,
    NumberBox
  },
  props: {
    name: String,
    interval: Number,
    isTemperature: Boolean,
    isPressure: Boolean,
    isVolume: Boolean,
    isWeight: Boolean,
    isSystem: Boolean,
    error: Object
  },
  data() {
    return {
      localName: this.name,
      localInterval: this.interval,
      localIsTemperature: this.isTemperature,
      localIsPressure: this.isPressure,
      localIsVolume: this.isVolume,
      localIsWeight: this.isWeight,
      localError: {
        name: null
      }
    }
  },
  computed: {
    sensorCaption() {
      let a = [this.localIsTemperature ? 'температуры' : null, this.localIsPressure ? 'давления' : null, this.localIsVolume ? 'расхода' : null, this.localIsWeight ? 'массового расхода' : null]

      a = a.filter(r => r !== null)

      if (a.length) {
        return a.reduce((acc, r, i) => (acc += `${i ? ' ;' : ''}${r}`), '')
      }

      return 'нет'
    },
    yearCaption() {
      let caption = 'лет'

      if (!(this.localInterval > 4 && this.localInterval < 21)) {
        const remainder = this.localInterval % 10

        switch (remainder) {
          case 1:
            caption = 'год'
            break
          case 2:
          case 3:
          case 4:
            caption = 'года'
            break
          default:
            break
        }
      }

      return caption
    }
  },
  watch: {
    name(value) {
      this.localName = value
    },
    interval(value) {
      this.localInterval = value
    },
    isTemperature(value) {
      this.localIsTemperature = value
    },
    isPressure(value) {
      this.localIsPressure = value
    },
    isVolume(value) {
      this.localIsVolume = value
    },
    isWeight(value) {
      this.localIsWeight = value
    },
    error: {
      handler(error) {
        this.localError = JSON.parse(JSON.stringify(error))
      },
      deep: true
    }
  },
  methods: {
    onChange(name, value) {
      this.$emit('change', name, value)
    },
    async save() {
      try {
        Object.keys(this.localError).forEach(r => (this.localError[r] = null))

        const equipType = new EquipType({
          name: this.localName,
          interval: this.localInterval,
          isTemperature: this.localIsTemperature,
          isPressure: this.localIsPressure,
          isVolume: this.localIsVolume,
          isWeight: this.localIsWeight
        })

        await equipType.save()

        return true
      } catch (error) {
        if (error.response.status === 551) {
          this.localError = error.response.data
        } else {
          this.$store.commit('error', error)
        }
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style scoped>
.equip-type-props-grid {
  display: grid;
  gap: 5px 3px;
  grid-template-columns: 1fr auto;
}

.equip-type-props-grid select {
  min-width: 200px;
  width: fit-content;
}

.equip-type-props-grid label {
  text-align: right;
}
</style>
