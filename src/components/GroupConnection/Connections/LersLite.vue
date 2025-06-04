<template>
  <div class="connection-type">
    <div class="connection-type two">
      <label>Идентификатор GPRS-модема:</label>
      <input @input="onChange('adapter', $event.target.value)" v-model="localAdapter" type="text" :class="{ 'validation-error': localError.adapter }" :title="localError.adapter" maxlength="29" style="width: 250px" />
    </div>
    <div class="connection-type two">
      <label>Телефон:</label>
      <input @input="onChange('phone', $event.target.value)" v-model.trim="localPhone" type="text" :class="{ 'validation-error': localError.phone }" :title="localError.phone" maxlength="30" />
    </div>
    <div class="connection-type two">
      <div class="connection-type two">
        <label>Вызов:</label>
        <select @change="onChange('type', parseInt($event.target.value))" v-model="localType">
          <option :value="connectionTypes.LERS_GSM_Lite_SMS">Через СМС</option>
          <option :value="connectionTypes.LERS_GSM_Lite">Через модем</option>
          <option :value="connectionTypes.LERS_GSM_Lite_SIP">Через VoIP</option>
          <option :value="connectionTypes.LERS_GSM_Lite_WithoutCall">Без вызова</option>
        </select>
      </div>
      <div v-if="group.type === connectionTypes.LERS_GSM_Lite_SMS" class="connection-type">
        <div class="connection-type two">
          <label>Текст вызова:</label>
          <input @input="onChange('callText', $event.target.value)" v-model="localCallText" type="text" :class="{ 'validation-error': localError.callText }" :title="localError.callText" />
        </div>
        <div class="connection-type two">
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
      </div>
      <div v-else-if="group.type === connectionTypes.LERS_GSM_Lite" class="connection-type two">
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
      <div v-else-if="group.type === connectionTypes.LERS_GSM_Lite_SIP" class="connection-type two">
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

import CheckBox from '../../Inputs/CheckBox.vue'
import NumberBox from '../../Inputs/NumberBox.vue'

export default {
  props: {
    group: Object,
    error: Object
  },
  components: {
    CheckBox,
    NumberBox
  },
  data() {
    return {
      localAdapter: this.group.adapter,
      localPhone: this.group.phone,
      localType: this.group.type,
      localCallText: this.group.callText,
      localComPort: this.group.comPort,
      localComSpeed: this.group.comSpeed,
      localSip: this.group.sip,
      localTimeOut: this.group.timeOut,
      localDontUseAsd: this.group.dontUseAsd,
      localForcedDisconnect: this.group.forcedDisconnect,
      localDontListenSocket: this.group.dontListenSocket,
      localError: {
        adapter: null,
        phone: null,
        comPort: null,
        comSpeed: null,
        callText: null
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
    'group.phone'(value) {
      this.localPhone = value
    },
    'group.type'(value) {
      this.localType = value
    },
    'group.callText'(value) {
      this.localCallText = value
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
