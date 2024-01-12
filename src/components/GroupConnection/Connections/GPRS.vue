<template>
  <div class="connection-type">
    <div class="connection-type two">
      <div class="connection-type two">
        <label>Порт подключения:</label>
        <number-box @update:modelValue="onChange('networkPort', $event)" v-model="localNetworkPort" style="width: 60px" :min="0" :max="65535" :class="{ 'validation-error': localError.networkPort }" :title="localError.networkPort" />
      </div>
      <div class="connection-type">
       <check-box @update:modelValue="onChange('dontListenSocket', $event)" v-model="localDontListenSocket">Не прослушивать порт</check-box>
      </div>
    </div>
    <div class="connection-type two">
      <label>Телефон 1:</label>
      <input @input="onChange('phone', $event.target.value)" v-model.trim="localPhone" type="text" :class="{ 'validation-error': localError.phone }" :title="localError.phone" maxlength="30" />
      <label>Телефон 2:</label>
      <input @input="onChange('phone2', $event.target.value)" v-model.trim="localPhone2" type="text" :class="{ 'validation-error': localError.phone2 }" :title="localError.phone2" maxlength="30" />
    </div>
    <div class="connection-type two">
      <div class="connection-type two">
        <label>Вызов:</label>
        <select @change="onChange('type', parseInt($event.target.value))" v-model="localType">
          <option :value="connectionTypes.GPRS_WithoutIdentifications">Через модем</option>
          <option :value="connectionTypes.GPRS_WithoutIdentifications_SIP">Через VoIP</option>
          <option :value="connectionTypes.GPRS_WithoutIdentifications_WithoutCall">Без вызова</option>
        </select>
      </div>
      <div v-if="group.type === connectionTypes.GPRS_WithoutIdentifications" class="connection-type two">
        <div class="connection-type two">
          <label>Порт:</label>
          <select @change="onChange('comPort', localComPort)" v-model="localComPort" :class="{ 'validation-error': localError.comPort }" :title="localError.comPort">
            <option v-for="(r, index) in group.ports" :key="index" :value="r">{{ r.name }}</option>
          </select>
        </div>
        <div class="connection-type two">
          <label>Скорость:</label>
          <select @change="onChange('comSpeed', parseInt($event.target.value))" v-model="localComSpeed" :class="{ 'validation-error': localError.comSpeed }" :title="localError.comSpeed">
            <option v-for="r in $store.state.env.comPortSpeeds" :key="r" :value="r">{{ r }}</option>
          </select>
        </div>
      </div>
      <div v-else-if="group.type === connectionTypes.GPRS_WithoutIdentifications_SIP" class="connection-type two">
        <label>SIP-аккаунт:</label>
        <select @change="onChange('sip', $event.target.value)" v-model="localSip">
          <option v-for="item in group.sips" :key="item.id" :value="item.id">{{ item.name }}</option>
        </select>
      </div>
      <div v-else />
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

import NumberBox from '../../Inputs/NumberBox.vue'
import CheckBox from '../../Inputs/CheckBox.vue'

export default {
  props: {
    group: Object,
    error: Object
  },
  components: { 
    NumberBox,
    CheckBox
  },
  data() {
    return {
      localNetworkPort: this.group.networkPort,
      localPhone: this.group.phone,
      localPhone2: this.group.phone2,
      localType: this.group.type,
      localComPort: this.group.comPort,
      localComSpeed: this.group.comSpeed,
      localSip: this.group.sip,
      localTimeOut: this.group.timeOut,
      localDontUseAsd: this.group.dontUseAsd,
      localForcedDisconnect: this.group.forcedDisconnect,
      localDontListenSocket: this.group.dontListenSocket,
      localError: {
        networkPort: null,
        phone: null,
        phone2: null,
        comPort: null,
        comSpeed: null
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
    'group.networkPort'(value) {
      this.localNetworkPort = value
    },
    'group.phone'(value) {
      this.localPhone = value
    },
    'group.phone2'(value) {
      this.localPhone2 = value
    },
    'group.type'(value) {
      this.localType = value
    },
    'group.comPort'(value) {
      this.localComPort = value
    },
    'group.comSpeed'(value) {
      this.localComSpeed = value
    },
    'group.sip'(value) {
      this.localSip = value
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
