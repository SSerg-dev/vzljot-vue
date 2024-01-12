<template>
  <button @click="onClick" class="button">
    <div :class="{ captionrun: run }">{{ caption }}</div>
    <div v-if="run" class="fas fa-spinner icon" :class="{ run: run }" />
  </button>
</template>

<script>
export default {
  props: {
    caption: {
      type: String
    },
    f: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      run: false
    }
  },
  emits: ['click'],
  methods: {
    onClick() {
      this.click()
    },
    async click() {
      if (!this.run) {
        this.$emit('click')
        if (this.f !== null) {
          this.run = true
          await this.f()
          this.run = false
        }
      }
    }
  }
}
</script>

<style scoped>
.button {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  transition: 0.3s ease-out;
}

.captionrun {
  opacity: 0.5;
}

.run {
  position: absolute;
  animation: spinner 1s linear infinite;
  color: white;
  left: 0;
  right: 0;
}
</style>
