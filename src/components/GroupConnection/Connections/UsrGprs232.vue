<template>
  <div class="connection-type">
    <div class="connection-type two">
      <label>Идентификатор GPRS-модема:</label>
      <input @input="onChange('adapter', $event.target.value)" v-model="localAdapter" type="text" :class="{ 'validation-error': localError.adapter }" :title="localError.adapter" maxlength="30" style="width: 200px" />
    </div>
    <div class="connection-type two">
      <label>Скорость:</label>
      <select @change="onChange('internalComSpeed', localInternalComSpeed)" v-model="localInternalComSpeed" :class="{ 'validation-error': localError.internalComSpeed }" :title="localError.internalComSpeed">
        <option v-for="r in $store.state.env.comPortSpeeds" :key="r" :value="r">{{ r }}</option>
      </select>
    </div>
    <div class="connection-type two">
      <div class="connection-type two">
        <label>Четность:</label>
        <select @change="onChange('internalParity', localInternalParity)" v-model="localInternalParity" :class="{ 'validation-error': localError.internalParity }" :title="localError.internalParity">
          <option v-for="(item, index) in ['Нет', 'Чет', 'Нечет', 'Всегда 1']" :key="index" :value="index">{{ item }}</option>
        </select>
      </div>
      <div class="connection-type two">
        <label>Количество стоп-бит:</label>
        <number-box @update:modelValue="onChange('internalStopBits', $event)" v-model="localInternalStopBits" :class="{ 'validation-error': localError.internalStopBits }" :title="localError.internalStopBits" style="width: 60px" />
      </div>
    </div>
    <div class="connection-type two">
      <label>Тайм-аут (c):</label>
      <number-box @update:modelValue="onChange('timeOut', $event)" v-model="localTimeOut" style="width: 60px" :max="1000" />
    </div>
    <check-box @update:modelValue="onChange('forcedDisconnect', $event)" v-model="localForcedDisconnect">Принудительно разрывать соединение при отсутствии задач</check-box>
  </div>
</template>

<script>
import { matchType } from '../../../plugins/api.js'

import CheckBox from '../../Inputs/CheckBox.vue'
import NumberBox from '../../Inputs/NumberBox.vue'

export default {
  components: {
    CheckBox,
    NumberBox
  },
  props: {
    group: Object,
    error: Object
  },
  data() {
    return {
      localAdapter: this.group.adapter,
      localInternalComSpeed: this.group.internalComSpeed,
      localInternalParity: this.group.internalParity,
      localInternalStopBits: this.group.internalStopBits,
      localTimeOut: this.group.timeOut,
      localDontUseAsd: this.group.dontUseAsd,
      localForcedDisconnect: this.group.forcedDisconnect,
      localDontListenSocket: this.group.dontListenSocket,
      localError: {
        adapter: null,
        internalComSpeed: null,
        internalParity: null,
        internalStopBits: null
      }
    }
  },
  computed: {
    connectionProperties() {
      return matchType(this.$store.state.env.groupConnectionProperties)
    },
    connectionTypes() {
      return matchType(this.$store.state.env.connectionTypes)
    }
  },
  watch: {
    'group.adapter'(value) {
      this.localAdapter = value
    },
    'group.internalComSpeed'(value) {
      this.localInternalComSpeed = value
    },
    'group.internalParity'(value) {
      this.localInternalParity = value
    },
    'group.internalStopBits'(value) {
      this.localInternalStopBits = value
    },
    'group.timeOut'(value) {
      this.localTimeOut = value
    },
    'group.dontUseAsd'(value) {
      this.localDontUseAsd = value
    },
    'group.forcedDisconnect'(value) {
      this.localForcedDisconnect = value
    },
    'group.dontListenSocket'(value) {
      this.localDontListenSocket = value
    },
    error(value) {
      Object.keys(this.localError).forEach(r => (this.localError[r] = null))
      if (value) {
        Object.entries(value).forEach(([k, v]) => (this.localError[k] = v))
      }
    }
  },
  methods: {
    onChange(prop, value) {
      this.$emit('changed', prop, value)
    }
  }
}
</script>
