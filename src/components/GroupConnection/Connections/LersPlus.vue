<template>
  <div class="connection-type">
    <div class="connection-type two">
      <label>Идентификатор GPRS-модема:</label>
      <input @input="onChange('adapter', $event.target.value)" v-model="localAdapter" type="text" :class="{ 'validation-error': localError.adapter }" :title="localError.adapter" maxlength="29" style="width: 250px" />
    </div>
    <div class="connection-type two">
      <label>Порт:</label>
      <select @change="onChange('internalComPort', localInternalComPort)" v-model="localInternalComPort">
        <option v-for="(v, index) in Object.values($store.state.env.internalComPorts)" :key="index" :value="index">{{ v.text }}</option>
      </select>
      <label>Телефон:</label>
      <input @input="onChange('phone', localPhone)" v-model.trim="localPhone" type="text" :class="{ 'validation-error': localError.phone }" :title="localError.phone" maxlength="30" />
    </div>
    <div class="connection-type two">
      <div class="connection-type two">
        <label>Вызов:</label>
        <select @change="onChange('type', localType)" v-model="localType">
          <option :value="connectionTypes.LERS_GSM_Plus_SMS">Через СМС</option>
          <option :value="connectionTypes.LERS_GSM_Plus">Через модем</option>
          <option :value="connectionTypes.LERS_GSM_Plus_SIP">Через VoIP</option>
          <option :value="connectionTypes.LERS_GSM_Plus_WithoutCall">Без вызова</option>
        </select>
      </div>
      <div v-if="group.type === connectionTypes.LERS_GSM_Plus_SMS" class="connection-type">
        <div class="connection-type two">
          <label>Текст вызова:</label>
          <input @input="onChange('callText', localCallText)" v-model="localCallText" type="text" :class="{ 'validation-error': localError.callText }" :title="localError.callText" />
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
            <select @change="onChange('comSpeed', localComSpeed)" v-model="localComSpeed" :class="{ 'validation-error': localError.comSpeed }" :title="localError.comSpeed">
              <option v-for="r in $store.state.env.comPortSpeeds" :key="r" :value="r">{{ r }}</option>
            </select>
          </div>
        </div>
      </div>
      <div v-else-if="group.type === connectionTypes.LERS_GSM_Plus" class="connection-type two">
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
      <div v-else-if="group.type === connectionTypes.LERS_GSM_Plus_SIP" class="connection-type two">
        <label>SIP-аккаунт:</label>
        <select @change="onChange('sip', localSip)" v-model="localSip">
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
      localInternalComPort: this.group.internalComPort,
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
