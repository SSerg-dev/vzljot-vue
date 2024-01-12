<template>
  <div class="poll-data-props-grid">
    <label :disabled="!enabled">Периодичность сбора(рассылки) данных:</label>
    <div class="poll-data-props-grid" :style="`grid-template-columns: ${localPeriodType === periodTypes.everyTimeSpan ? 'repeat(7, auto)' : 'auto'} 1fr;`" :disabled="!enabled">
      <template v-if="localPeriodType === periodTypes.everyTimeSpan">
        <number-box :disabled="!enabled" v-model="localPeriodHour" @update:modelValue="onChange('periodHour', $event)" :min="0" :max="23" :class="{ 'validation-error': error.pollDataPeriod }" :title="error.pollDataPeriod" /> ч
        <number-box :disabled="!enabled" v-model="localPeriodMin" @update:modelValue="onChange('periodMin', $event)" :min="0" :max="59" :class="{ 'validation-error': error.pollDataPeriod }" :title="error.pollDataPeriod" /> мин
        <number-box :disabled="!enabled" v-model="localPeriodSec" @update:modelValue="onChange('periodSec', $event)" :min="0" :max="59" :class="{ 'validation-error': error.pollDataPeriod }" :title="error.pollDataPeriod" /> c
      </template>
      <number-box v-else :disabled="!enabled" v-model="localPeriodNum" @update:modelValue="onChange('periodNum', $event)" :min="1" :max="30" />
      <select v-model="localPeriodType" :disabled="!enabled" @change="onChange('periodType', parseInt($event.target.value))">
        <option v-for="r in Object.keys($store.state.env.pollDataPeriodTypes)" :key="r" :value="parseInt(r)">{{ $store.state.env.pollDataPeriodTypes[r].text }}</option>
      </select>
    </div>
    <label :disabled="!enabled">При ошибках, повторять каждые:</label>
    <div :disabled="!enabled">
      <number-box :disabled="!enabled" v-model="localRetryHour" :min="0" :max="23" @update:modelValue="onChange('retryHour', $event)" /> ч <number-box :disabled="!enabled" v-model="localRetryMin" :min="0" :max="59" @update:modelValue="onChange('retryMin', $event)" /> мин
    </div>
  </div>
</template>

<script>
import { matchType } from '../../plugins/api.js'

import NumberBox from '../Inputs/NumberBox.vue'

export default {
  components: {
    NumberBox
  },
  props: {
    enabled: Boolean,
    periodHour: Number,
    periodMin: Number,
    periodNum: Number,
    periodSec: Number,
    periodType: Number,
    retryHour: Number,
    retryMin: Number,
    error: {
      type: Object,
      default: () => {
        return {
          pollDataPeriod: null
        }
      }
    }
  },
  data() {
    return {
      localPeriodHour: this.periodHour,
      localPeriodMin: this.periodMin,
      localPeriodNum: this.periodNum,
      localPeriodSec: this.periodSec,
      localPeriodType: this.periodType,
      localRetryHour: this.retryHour,
      localRetryMin: this.retryMin
    }
  },
  computed: {
    periodTypes() {
      return matchType(this.$store.state.env.pollDataPeriodTypes)
    }
  },
  watch: {
    periodHour(value) {
      this.localPeriodHour = value
    },
    periodMin(value) {
      this.localPeriodMin = value
    },
    periodNum(value) {
      this.localPeriodNum = value
    },
    periodSec(value) {
      this.localPeriodSec = value
    },
    periodType(value) {
      this.localPeriodType = value
    },
    retryHour(value) {
      this.localRetryHour = value
    },
    retryMin(value) {
      this.localRetryMin = value
    }
  },
  methods: {
    onChange(prop, value) {
      this.$emit('change', value, prop)
    }
  }
}
</script>

<style scoped>
.poll-data-props-grid {
  display: grid;
  gap: 5px 3px;
  grid-template-columns: auto 1fr;
  align-items: center;
}

.poll-data-props-grid select {
  width: fit-content;
}

.poll-data-props-grid label {
  text-align: end;
}

.poll-data-props-grid .numberbox {
  width: 25px;
}

.poll-data-props-grid div[disabled='true'] {
  color: gray;
  opacity: 0.7;
}
</style>
