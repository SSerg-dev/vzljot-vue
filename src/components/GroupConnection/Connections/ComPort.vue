<template>
  <div class="connection-type">
    <div class="connection-type two">
      <label>Подключение:</label>
      <select
        @change="onChange('type', parseInt($event.target.value))"
        v-model="localType"
      >
        <option :value="connectionTypes.comPort_RS232">RS-232</option>
        <option :value="connectionTypes.comPort_RS485">RS-485</option>
        <option :value="connectionTypes.comPort_RSEthernet">Ethernet</option>
      </select>
    </div>
    <div class="connection-type two">
      <template
        v-if="
          group.type === connectionTypes.comPort_RS232 ||
          group.type === connectionTypes.comPort_RS485
        "
      >
        <div class="connection-type two">
          <label>Порт:</label>
          <select
            @change="onChange('comPort', localComPort)"
            v-model="localComPort"
            :class="{ 'validation-error': localError.comPort }"
            :title="localError.comPort"
          >
            <option v-for="(r, index) in group.ports" :key="index" :value="r">
              {{ r.name }}
            </option>
          </select>
        </div>
        <div class="connection-type two">
          <label>Скорость:</label>
          <select
            @change="onChange('comSpeed', localComSpeed)"
            v-model="localComSpeed"
            :class="{ 'validation-error': localError.comSpeed }"
            :title="localError.comSpeed"
          >
            <option
              v-for="item in $store.state.env.comPortSpeeds"
              :key="item"
              :value="item"
            >
              {{ item }}
            </option>
          </select>
        </div>
      </template>
      <template v-if="group.type === connectionTypes.comPort_RSEthernet">
        <div class="connection-type two">
          <label>IP-адрес:</label>
          <input
            @input="onChange('networkAddress', localNetworkAddress)"
            v-model="localNetworkAddress"
            type="text"
            :class="{ 'validation-error': localError.networkAddress }"
            :title="localError.networkAddress"
          />
        </div>
        <div class="connection-type two">
          <label>Порт:</label>
          <number-box
            @update:modelValue="onChange('networkPort', $event)"
            v-model="localNetworkPort"
            :min="0"
            :max="65535"
            :class="{ 'validation-error': localError.networkPort }"
            :title="localError.networkPort"
            style="width: 60px"
          />
        </div>
      </template>
    </div>
    <div class="connection-type two">
      <template v-if="group.type === connectionTypes.comPort_RSEthernet">
        <label>Протокол:</label>
        <select
          @input="onChange('networkProtocol', parseInt($event.target.value))"
          v-model="localNetworkProtocol"
        >
          <option
            v-for="key in Object.keys($store.state.env.networkProtocols)"
            :key="key"
            :value="parseInt(key)"
          >
            {{ $store.state.env.networkProtocols[key].text }}
          </option>
        </select>
      </template>
      <label>Тайм-аут (c):</label>
      <number-box
        @update:modelValue="onChange('timeOut', $event)"
        v-model="localTimeOut"
        style="width: 60px"
        :max="1000"
      />
    </div>
  </div>
</template>

<script>
import NumberBox from '../../Inputs/NumberBox.vue'
import { matchType } from '../../../plugins/api'

export default {
  props: {
    group: Object,
    error: Object,
  },
  components: { NumberBox },
  data() {
    return {
      localType: this.group.type,
      localComPort: this.group.comPort,
      localComSpeed: this.group.comSpeed,
      localNetworkAddress: this.group.networkAddress,
      localNetworkPort: this.group.networkPort,
      localNetworkProtocol: this.group.networkProtocol,
      localTimeOut: this.group.timeOut,
      connectionTypes: matchType(this.$store.state.env.connectionTypes),
      localError: {
        comPort: null,
        comSpeed: null,
        networkAddress: null,
        networkPort: null,
      },
    }
  },
  watch: {
    'group.type'(value) {
      this.localType = value
    },
    'group.comPort'(value) {
      this.localComPort = value
    },
    'group.comSpeed'(value) {
      this.localComSpeed = value
    },
    'group.networkAddress'(value) {
      this.localNetworkAddress = value
    },
    'group.networkPort'(value) {
      this.localNetworkPort = value
    },
    'group.networkProtocol'(value) {
      this.localNetworkProtocol = value
    },
    'group.timeOut'(value) {
      this.localTimeOut = value
    },
    error(value) {
      Object.keys(this.localError).forEach((r) => (this.localError[r] = null))
      if (value) {
        Object.entries(value).forEach(([k, v]) => (this.localError[k] = v))
      }
    },
  },
  methods: {
    onChange(prop, value) {
      this.$emit('changed', prop, value)

      if (prop === 'type') {
        this.$emit('changeConnectionType', value)
      }
    },
  },
}
</script>
