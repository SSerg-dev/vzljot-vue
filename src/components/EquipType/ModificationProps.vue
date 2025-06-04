<template>
  <expantion-panel caption="Основные параметры" :resizable="false" class="fit">
    <div class="equip-type-modification-props-grid">
      <label>Наименование:</label>
      <input v-model.trim="localName" type="text" maxlength="80" @input="onChange('name', localName)" style="width: 200px" :class="{ 'validation-error': localError.name }" :title="localError.name" />
      <label v-if="isTemperature || isWeight">Номинальный диаметр:</label>
      <input v-if="isTemperature || isWeight" v-model.number="localDiameter" type="number" @input="onChange('diameter', localDiameter)" />
      <label>Класс точности:</label>
      <input v-model.trim="localAccuracyClass" type="text" maxlength="4" @input="onChange('accuracyClass', localAccuracyClass)" style="width: 50px" />
      <label>Погрешность, %:</label>
      <input v-model.number="localAccuracy" type="number" :min="0" @input="onChange('accuracy', localAccuracy)" />
      <label v-if="isTemperature">Температура, °С: Min:</label>
      <div v-if="isTemperature" class="minmax">
        <input v-model.number="localTmin" type="number" :min="0" @input="onChange('tmin', localTmin)" />
        Max:
        <input v-model.number="localTmax" type="number" :min="0" @input="onChange('tmax', localTmax)" />
      </div>
      <label v-if="isPressure">Давление, МПа: Min:</label>
      <div v-if="isPressure" class="minmax">
        <input v-model.number="localPmin" type="number" :min="0" @input="onChange('pmin', localPmin)" />
        Max:
        <input v-model.number="localPmax" type="number" :min="0" @input="onChange('pmax', localPmax)" />
      </div>
      <label v-if="isVolume">Расход объемный, м3/ч: Min:</label>
      <div v-if="isVolume" class="minmax">
        <input v-model.number="localGvmin" type="number" :min="0" @input="onChange('gvmin', localGvmin)" />
        Max:
        <input v-model.number="localGvmax" type="number" :min="0" @input="onChange('gvmax', localGvmax)" />
      </div>
      <label v-if="isWeight">Расход массовый, т/ч: Min:</label>
      <div v-if="isWeight" class="minmax">
        <input v-model.number="localGmmin" type="number" :min="0" @input="onChange('gmmin', localGmmin)" />
        Max:
        <input v-model.number="localGmmax" type="number" :min="0" @input="onChange('gmmax', localGmmax)" />
      </div>
    </div>
  </expantion-panel>
</template>

<script>
import ExpantionPanel from '../ExpantionPanel.vue'

export default {
  components: {
    ExpantionPanel
  },
  props: {
    name: String,
    isSystem: Boolean,
    isTemperature: Boolean,
    isPressure: Boolean,
    isVolume: Boolean,
    isWeight: Boolean,
    diameter: Number,
    accuracyClass: String,
    accuracy: Number,
    tmin: Number,
    tmax: Number,
    pmin: Number,
    pmax: Number,
    gvmin: Number,
    gvmax: Number,
    gmmin: Number,
    gmmax: Number
  },
  data() {
    return {
      localName: this.name,
      localDiameter: this.diameter,
      localAccuracyClass: this.accuracyClass,
      localAccuracy: this.accuracy,
      localTmin: this.tmin,
      localTmax: this.tmax,
      localPmin: this.pmin,
      localPmax: this.pmax,
      localGvmin: this.gvmin,
      localGvmax: this.gvmax,
      localGmmin: this.gmmin,
      localGmmax: this.gmmax,
      localError: {
        name: null
      }
    }
  },
  watch: {
    name(value) {
      this.localName = value
    },
    diameter(value) {
      this.localDiameter = value
    },
    accuracyClass(value) {
      this.localAccuracyClass = value
    },
    accuracy(value) {
      this.localAccuracy = value
    },
    tmin(value) {
      this.localTmin = value
    },
    tmax(value) {
      this.localTmax = value
    },
    pmin(value) {
      this.localPmin = value
    },
    pmax(value) {
      this.localPmax = value
    },
    gvmin(value) {
      this.localGvmin = value
    },
    gvmax(value) {
      this.localGvmax = value
    },
    gmmin(value) {
      this.localGmmin = value
    },
    gmmax(value) {
      this.localGmmax = value
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
      this.$emit('changed', name, value)
    },
    validateData() {
      Object.keys(this.localError).forEach(r => (this.localError[r] = null))

      if (!this.localName) {
        this.localError.name = 'Наименование не может быть пустым.'
      }

      return !Object.keys(this.localError).some(r => this.localError[r])
    },
    save() {
      if (this.validateData()) {
        let result = {
          name: this.localName,
          diameter: this.localDiameter,
          accuracyClass: this.localAccuracyClass,
          accuracy: this.localAccuracy,
          isSystem: this.isSystem,
          tmin: this.localTmin,
          tmax: this.localTmax,
          pmin: this.localPmin,
          pmax: this.localPmax,
          gvmin: this.localGvmin,
          gvmax: this.localGvmax,
          gmmin: this.localGmmin,
          gmmax: this.localGmmax,
          isTemperature: this.isTemperature,
          isPressure: this.isPressure,
          isVolume: this.isVolume,
          isWeight: this.isWeight
        }
        this.$emit('changed', result)
        return result
      }
      return false
    }
  }
}
</script>

<style>
.equip-type-modification-props-grid {
  display: grid;
  gap: 5px 3px;
  grid-template-columns: 1fr auto;
}

.equip-type-modification-props-grid input[type='number'] {
  width: 100px;
}

.equip-type-modification-props-grid label {
  text-align: right;
}

.equip-type-modification-props-grid .minmax {
  display: grid;
  gap: 5px 3px;
  grid-template-columns: repeat(3, min-content);
}
</style>
