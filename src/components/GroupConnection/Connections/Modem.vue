<template>
  <div class="connection-type">
    <div class="connection-type two">
      <div class="connection-type two">
        <label>Порт опроса:</label>
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
    <div class="connection-type two">
      <label
        >Телефон:
        <input @input="onChange('phone', $event.target.value)" v-model.trim="localPhone" type="text" :class="{ 'validation-error': localError.phone }" :title="localError.phone" maxlength="30" />
      </label>
      <check-box @update:modelValue="onChange('type', $event)" v-model="localType" :trueLabel="connectionTypes.modem_ASEV" :falseLabel="connectionTypes.modem">через адаптер ACEB-040</check-box>
    </div>
    <div class="connection-type two">
      <label>Тайм-аут (c):</label>
      <number-box @update:modelValue="onChange('timeOut', $event)" v-model="localTimeOut" style="width: 60px" :max="1000" />
    </div>
  </div>
</template>

<script>
import CheckBox from '../../Inputs/CheckBox.vue'
import NumberBox from '../../Inputs/NumberBox.vue'
import { matchType } from '../../../plugins/api'

export default {
  name: 'groupModem',
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
      localComPort: this.group.comPort,
      localComSpeed: this.group.comSpeed,
      localPhone: this.group.phone,
      localType: this.group.type,
      localTimeOut: this.group.timeOut,
      connectionTypes: matchType(this.$store.state.env.connectionTypes),
      localError: {
        comPort: null,
        comSpeed: null,
        phone: null
      }
    }
  },
  watch: {
    'group.comPort'(value) {
      this.localComPort = value
    },
    'group.comSpeed'(value) {
      this.localComSpeed = value
    },
    'group.phone'(value) {
      this.localPhone = value
    },
    'group.type'(value) {
      this.localType = value
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
