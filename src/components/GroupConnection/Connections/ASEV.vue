<template>
  <div class="connection-type">
    <label
      >Идентификатор адаптера (до 8 цифр):
      <input @input="onChange('adapter', $event.target.value)" v-model="localAdapter" type="text" :class="{ 'validation-error': localError.adapter }" :title="localError.adapter" maxlength="8" style="width: 100px" />
    </label>
    <label
      >Пароль для дистанционной настройки (6 символов):
      <input @input="onChange('password', $event.target.value)" v-model="localPassword" type="text" :class="{ 'validation-error': localError.password }" :title="localError.password" maxlength="6" style="width: 100px" />
    </label>
    <div class="connection-type two">
      <label
        >IP-адрес:
        <input @input="onChange('networkAddress', $event.target.value)" v-model="localNetworkAddress" type="text" :class="{ 'validation-error': localError.networkAddress }" :title="localError.networkAddress" />
      </label>
      <label
        >Порт:
        <number-box @update:modelValue="onChange('networkPort', $event)" v-model="localNetworkPort" :min="0" :max="65535" :class="{ 'validation-error': localError.networkPort }" :title="localError.networkPort" style="width: 100px" />
      </label>
    </div>
    <label
      >Тайм-аут (c):
      <number-box @update:modelValue="onChange('timeOut', $event)" v-model="localTimeOut" style="width: 60px" :max="1000" />
    </label>
    <check-box @update:modelValue="onChange('dontUseAsd', $event)" v-model="localDontUseAsd">Не использовать оптимизацию запросов</check-box>
    <div v-if="group.hasOwnProperty('redirect')" class="connection-type two">
      <check-box @update:modelValue="onChange('redirect', $event)" v-model="localRedirect">Перенаправление входящих:</check-box>
      <select @change="onChange('endPoint', $event.target.value)" v-model="localEndPoint" :disabled="!localRedirect">
        <option v-for="item in group.endPoints" :key="item.id" :value="item.id">{{ item.name }}</option>
      </select>
    </div>
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
      localPassword: this.group.password,
      localNetworkAddress: this.group.networkAddress,
      localNetworkPort: this.group.networkPort,
      localTimeOut: this.group.timeOut,
      localDontUseAsd: this.group.dontUseAsd,
      localForcedDisconnect: this.group.forcedDisconnect,
      localDontListenSocket: this.group.dontListenSocket,
      localRedirect: this.group.redirect,
      localEndPoint: this.group.endPoint,
      localError: {
        networkAddress: false,
        networkPort: false,
        adapter: false,
        password: false
      }
    }
  },
  computed: {
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
    'group.networkAddress'(value) {
      this.localNetworkAddress = value
    },
    'group.networkPort'(value) {
      this.localNetworkPort = value
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
    }
  }
}
</script>
