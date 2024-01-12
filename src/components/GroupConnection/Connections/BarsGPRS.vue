<template>
  <div class="connection-type one">
    <div class="connection-type two">
      <label>Идентификатор GPRS-модема:</label>
      <input @input="onChange('adapter', localAdapter)" v-model="localAdapter" type="text" :class="{ 'validation-error': localError.adapter }" :title="localError.adapter" maxlength="29" />
    </div>
    <div class="connection-type two">
      <div class="connection-type two">
        <label>Порт:</label>
        <select @change="onChange('internalComPort', localInternalComPort)" v-model="localInternalComPort" :class="{ 'validation-error': localError.internalComPort }" :title="localError.internalComPort">
          <option v-for="(item, index) in ['RS-232', 'RS-232 + RTS', 'RS-485']" :key="index" :value="index">{{ item }}</option>
        </select>
      </div>
      <div class="connection-type two">
        <label>Скорость:</label>
        <select @change="onChange('internalComSpeed', localInternalComSpeed)" v-model="localInternalComSpeed" :class="{ 'validation-error': localError.internalComSpeed }" :title="localError.internalComSpeed">
          <option v-for="r in $store.state.env.comPortSpeeds" :key="r" :value="r">{{ r }}</option>
        </select>
      </div>
    </div>
    <div class="connection-type two">
      <div class="connection-type two">
        <label>Четность:</label>
        <select @change="onChange('internalParity', localInternalParity)" v-model="localInternalParity" :class="{ 'validation-error': localError.internalParity }" :title="localError.internalParity">
          <option v-for="(item, index) in ['Нет', 'Чет', 'Нечет']" :key="index" :value="index">{{ item }}</option>
        </select>
      </div>
      <div class="connection-type two">
        <label>Количество стоп-бит:</label>
        <number-box @update:modelValue="onChange('internalStopBits', $event)" v-model="localInternalStopBits" :class="{ 'validation-error': localError.internalStopBits }" :title="localError.internalStopBits" style="width: 60px" />
      </div>
    </div>
    <div class="connection-type two">
      <label>Телефон:</label>
      <input @input="onChange('phone', localPhone)" v-model.trim="localPhone" type="text" :class="{ 'validation-error': localError.phone }" :title="localError.phone" maxlength="30" />
    </div>
    <div class="connection-type two">
      <div class="connection-type two">
        <label>Вызов:</label>
        <select @change="onChange('type', localType)" v-model="localType">
          <option :value="connectionTypes.bars02Multiport_GPRS">Через модем</option>
          <option :value="connectionTypes.bars02Multiport_GPRS_SIP">Через VoIP</option>
          <option :value="connectionTypes.bars02Multiport_GPRS_WithoutCall">Без вызова</option>
        </select>
      </div>
      <div v-if="group.type === connectionTypes.bars02Multiport_GPRS" class="connection-type two">
        <div class="connection-type two">
          <label>Порт:</label>
          <select @change="onChange('comPort', localComPort)" v-model="localComPort" :class="{ 'validation-error': localError.comPort }" :title="localError.comPort">
            <option v-for="(r, index) in group.ports" :key="index" :value="r">{{ r.name }}</option>
          </select>
        </div>
        <div class="connection-type two">
          <label>Скорость:</label>
          <select @change="onChange('comSpeed', localComSpeed)" v-model="localComSpeed" :class="{ 'validation-error': localError.comSpeed }" :title="localError.comSpeed">
            <option v-for="r in $store.state.env.comPortSpeeds" :key="r" :value="r">{{ r }}</option>
          </select>
        </div>
      </div>
      <div v-else-if="group.type === connectionTypes.bars02Multiport_GPRS_SIP" class="connection-type two">
        <div class="connection-type two">
          <label :disabled="group.type !== connectionTypes.bars02Multiport_GPRS_SIP">SIP-аккаунт:</label>
          <select @change="onChange('sip', localSip)" v-model="localSip" :disabled="group.type !== connectionTypes.bars02Multiport_GPRS_SIP">
            <option v-for="item in group.sips" :key="item.id" :value="item.id">{{ item.name }}</option>
          </select>
        </div>
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
      localInternalComPort: this.group.internalComPort,
      localInternalComSpeed: this.group.internalComSpeed,
      localInternalParity: this.group.internalParity,
      localInternalStopBits: this.group.internalStopBits,
      localPhone: this.group.phone,
      localType: this.group.type,
      localComPort: this.group.comPort,
      localComSpeed: this.group.comSpeed,
      localSip: this.group.sip,
      localTimeOut: this.group.timeOut,
      localDontUseAsd: this.group.dontUseAsd,
      localForcedDisconnect: this.group.forcedDisconnect,
      localDontListenSocket: this.group.dontListenSocket,
      localError: {
        adapter: null,
        internalComPort: null,
        internalComSpeed: null,
        internalParity: null,
        internalStopBits: null,
        comPort: null,
        comSpeed: null,
        phone: null
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
    'group.internalComPort'(value) {
      this.localInternalComPort = value
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
    'group.phone'(value) {
      this.localPhone = value
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
