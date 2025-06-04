<template>
  <div class="connection-type two">
    <label>Сервер LoRa:</label>
    <select @input="onChange('serverLoRa', $event.target.value)" v-model="localServer" :class="{ 'validation-error': localError.serverLoRa }" :title="localError.serverLoRa">
      <option v-for="(item, index) in group.loraServers" :key="index" :value="item.id">{{ item.name }}</option>
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
      localServer: this.group.serverLoRa,
      localTimeOut: this.group.timeOut,
      localError: {
        serverLoRa: null
      }
    }
  },
  watch: {
    'group.serverLoRa'(value) {
      this.localServer = value
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
