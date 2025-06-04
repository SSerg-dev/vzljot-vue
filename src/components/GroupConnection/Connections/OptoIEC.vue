<template>
  <div class="connection-type two">
    <label>COM-порт:</label>
    <select @change="onChange('comPort', localComPort)" v-model="localComPort" :class="{ 'validation-error': localError.comPort }" :title="localError.comPort">
      <option v-for="(r, index) in group.ports" :key="index" :value="r">{{ r.name }}</option>
    </select>
    <label>Тайм-аут (c):</label>
    <number-box @update:modelValue="onChange('timeOut', $event)" v-model="localTimeOut" style="width: 60px" :max="1000" />
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
      localComPort: this.group.comPort,
      localTimeOut: this.group.timeOut,
      localError: {
        comPort: null
      }
    }
  },
  watch: {
    'group.comPort'(value) {
      this.localComPort = value
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
