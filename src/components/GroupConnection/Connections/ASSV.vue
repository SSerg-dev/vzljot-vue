<template>
  <div class="connection-type">
    <div class="connection-type two">
      <label>Идентификатор адаптера (до 8 цифр):</label>
      <input @input="onChange('adapter', $event.target.value)" v-model="localAdapter" type="text" :class="{ 'validation-error': localError.adapter }" :title="localError.adapter" maxlength="8" style="width: 130px" />
    </div>
    <div class="connection-type two">
      <label>Пароль для дистанционной настройки (6 символов):</label>
      <input @input="onChange('password', $event.target.value)" v-model="localPassword" type="text" :class="{ 'validation-error': localError.password }" :title="localError.password" maxlength="6" style="width: 100px" />
    </div>
    <div class="connection-type two">
      <div class="connection-type two">
        <label>Телефон 1:</label>
        <div class="connection-type two">
          <input @input="onChange('phone', $event.target.value)" v-model.trim="localPhone" type="text" :class="{ 'validation-error': localError.phone }" :title="localError.phone" maxlength="30" />
          <div class="fas fa-volume icon voice-button" @click="onVoiceClick('phone', localPhone)" title="Голосовой вызов" />
        </div>
        <label>Телефон 2:</label>
        <div class="connection-type two">
          <input @input="onChange('phone2', $event.target.value)" v-model.trim="localPhone2" type="text" :class="{ 'validation-error': localError.phone2 }" :title="localError.phone2" maxlength="30" />
          <div class="fas fa-volume icon voice-button" @click="onVoiceClick('phone2', localPhone2)" title="Голосовой вызов" />
        </div>
      </div>
      <div class="connection-type two">
        <label>Режим:</label>
        <select @change="onChange('mode', $event.target.value)" v-model="localMode">
          <option :value="connectionTypes.ASSV_GPRS">GPRS</option>
          <option :value="connectionTypes.ASSV_CSD">CSD</option>
        </select>
      </div>
    </div>
    <div class="connection-type two">
      <div class="connection-type two">
        <label>Вызов:</label>
        <select @change="onChange('type', parseInt($event.target.value))" v-model="localType">
          <option :value="connectionTypes.ASSV_GPRS">Через модем</option>
          <option :value="connectionTypes.ASSV_GPRS_SIP">Через VoIP</option>
          <option :value="connectionTypes.ASSV_GPRS_WithoutCall">Без вызова</option>
        </select>
      </div>
      <div v-if="group.type === connectionTypes.ASSV_GPRS" class="connection-type two">
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
      <div v-else-if="group.type === connectionTypes.ASSV_GPRS_SIP" class="connection-type two">
        <label>SIP-аккаунт:</label>
        <select @change="onChange('sip', $event.target.value)" v-model="localSip">
          <option v-for="item in group.sips" :key="item.id" :value="item.id">{{ item.name }}</option>
        </select>
      </div>
      <div v-else />
    </div>
    <div class="connection-type two">
      <label>Тайм-аут (c):</label>
      <number-box @input="onChange('timeOut', $event)" v-model="localTimeOut" style="width: 60px" :max="1000" />
    </div>
    <check-box @update:modelValue="onChange('dontUseAsd', $event)" v-model="localDontUseAsd">Не использовать оптимизацию запросов</check-box>
    <div class="connection-type two" v-if="group.hasOwnProperty('redirect')">
      <check-box @update:modelValue="onChange('redirect', $event)" v-model="localRedirect" :disabled="group.mode === connectionTypes.ASSV_CSD">Перенаправление входящих:</check-box>
      <select @change="onChange('endPoint', localEndPoint)" v-model="localEndPoint" :disabled="!group.redirect || group.mode === connectionTypes.ASSV_CSD" :class="{ 'validation-error': localError.endPoint }" :title="localError.endPoint">
        <option v-for="item in group.endPoints" :key="item.id" :value="item.id">{{ item.name }}</option>
      </select>
    </div>
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
  components: { NumberBox, CheckBox },
  data() {
    return {
      localAdapter: this.group.adapter,
      localPassword: this.group.password,
      localPhone: this.group.phone,
      localPhone2: this.group.phone2,
      localMode: this.group.mode,
      localType: this.group.type,
      localComPort: this.group.comPort,
      localComSpeed: this.group.comSpeed,
      localSip: this.group.sip,
      localTimeOut: this.group.timeOut,
      localDontUseAsd: this.group.dontUseAsd,
      localForcedDisconnect: this.group.forcedDisconnect,
      localDontListenSocket: this.group.dontListenSocket,
      localRedirect: this.group.redirect,
      localEndPoint: this.group.endPoint,
      localError: {
        adapter: null,
        password: null,
        phone: null,
        phone2: null,
        comPort: null,
        comSpeed: null,
        endPoint: null
      }
    }
  },
  computed: {
    connectionTypes() {
      return matchType(this.$store.state.env.connectionTypes)
    },
    groupConnectionProperties() {
      return matchType(this.$store.state.env.groupConnectionProperties)
    }
  },
  watch: {
    'group.adapter'(value) {
      this.localAdapter = value
    },
    'group.password'(value) {
      this.localPassword = value
    },
    'group.phone'(value) {
      this.localPhone = value
    },
    'group.phone2'(value) {
      this.localPhone2 = value
    },
    'group.mode'(value) {
      this.localMode = value
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
    'group.redirect'(value) {
      this.localRedirect = value
    },
    'group.endPoint'(value) {
      this.localEndPoint = value
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

      if (prop === 'mode' && value === this.connectionTypes.ASSV_CSD) {
        this.$emit('changed', 'type', this.connectionTypes.ASSV_GPRS)
      }
    },
    onVoiceClick(prop, value) {
      if (value && !value.endsWith(';')) {
        this.$emit('changed', prop, value + ';')
      }
    }
  }
}
</script>

<style scoped>
.voice-button {
  padding: 1px;
  border: 1px solid lightslategray;
  min-width: 1.3em;
  border-radius: 2px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
