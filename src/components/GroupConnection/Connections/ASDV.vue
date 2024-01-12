<template>
  <div class="connection-type two">
    <label>COM-порт:</label>
    <select @change="onChange('comPort', localComPort)" v-model="localComPort" :class="{ 'validation-error': localError.comPort }" :title="localError.comPort">
      <option v-for="(r, index) in group.ports" :key="index" :value="r">{{ r.name }}</option>
    </select>
    <label>Скорость:</label>
    <select @change="onChange('comSpeed', parseInt($event.target.value))" v-model="localComSpeed" :class="{ 'validation-error': localError.comSpeed }" :title="localError.comSpeed">
      <option v-for="item in $store.state.env.comPortSpeeds" :key="item" :value="item">{{ item }}</option>
    </select>
  </div>
</template>

<script>
  export default {
    props: {
      group: Object,
      error: Object
    },
    data() {
      return {
        localComPort: this.group.comPort,
        localComSpeed: this.group.comSpeed,
        localError: {
          comPort: null,
          comSpeed: null
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
      error(value) {
        Object.keys(this.localError).forEach(r => this.localError[r] = null)
        if (value) {
          Object.entries(value).forEach(([k, v]) => this.localError[k] = v)
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