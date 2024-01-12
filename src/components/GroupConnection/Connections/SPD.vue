<template>
  <div class="connection-type two">
    <label>Идентификатор адаптера (до 8 цифр):</label>
    <input @input="onChange('adapter', $event.target.value)" v-model="localAdapter" type="text" :class="{ 'validation-error': localError.adapter }" :title="localError.adapter" maxlength="8" style="width: 100px" />
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
      localAdapter: this.group.adapter,
      localTimeOut: this.group.timeOut,
      localError: {
        adapter: null
      }
    }
  },
  watch: {
    'group.adapter'(value) {
      this.localAdapter = value
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
