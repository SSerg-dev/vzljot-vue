<template>
  <div class="connection-type">
    
    
    <div class="connection-type two">
      <label>Lite Идентификатор DevEUI (hex):</label>
      <input
        @input="onChange('adapter', $event.target.value)"
        v-model="localAdapter"
        type="text"
        :class="{ 'validation-error': localError.adapter }"
        :title="localError.adapter"
        style="width: 100%" 
      />
    </div>
    
    
  </div>
</template>

<script>

export default {
  components: {
  },
  props: {
    group: Object,
    error: Object,
  },
  data() {

    return {
      // localServerLoRa: this.group.serverLoRa,
      localAdapter: 42,//this.group.adapter,
      localError: {
        adapter: null,
        timeOut: null,
        serverLoRa: null,
      },
    }
  },
  created() {
  },
  watch: {
    'group.serverLoRa'(value) {
      this.localServerLoRa = value
    },
    'group.adapter'(value) {
      this.localAdapter = value
    },
    error(value) {
      Object.keys(this.localError).forEach((r) => (this.localError[r] = null))
      if (value) {
        Object.entries(value).forEach(([k, v]) => (this.localError[k] = v))
      }
    },
  },
  methods: {
    onChange(prop, value) {
      this.$emit('changed', prop, value)
    },
    
  },
}
</script>
