<template>
  <div class="connection-type">
    <div class="connection-type two">
      <label>IP-адрес:</label>
      <input @input="onChange('networkAddress', localNetworkAddress)" v-model="localNetworkAddress" type="text" :class="{ 'validation-error': localError.networkAddress }" :title="localError.networkAddress" />
      <label>Порт:</label>
      <number-box @input="onChange('networkPort', localNetworkPort)" v-model="localNetworkPort" :min="1" :max="65535" :class="{ 'validation-error': localError.networkPort }" :title="localError.networkPort" style="width: 111px"/>
    </div>
    <div class="connection-type two">
      <label>Тайм-аут (c):</label>
      <number-box @update:modelValue="onChange('timeOut', $event)" v-model="localTimeOut" style="width: 60px" :max="1000" />
    </div>
  </div>
</template>

<script>
import NumberBox from '../../Inputs/NumberBox.vue'

export default {
  props: {
    group: Object,
    error: Object
  },
  components: {
    NumberBox
  },
  data() {
    return {
      localNetworkAddress: this.group.networkAddress,
      localNetworkPort: this.group.networkPort,
      localTimeOut: this.group.timeOut,
      localError: {
        networkAddress: null,
        networkPort: null
      }
    }
  },
  watch: {
    'group.networkAddress'(value) {
      this.localNetworkAddress = value
    },
    'group.networkPort'(value) {
      this.localNetworkPort = value
    },
    'group.timeOut'(value) {
      this.localTimeOut = value
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
