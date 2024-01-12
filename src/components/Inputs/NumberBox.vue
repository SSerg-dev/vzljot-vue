<template>
  <input type="text" class="numberbox" @input="handleChange" @keydown="onKeydown" :value="modelValue" :disabled="disabled" style="text-align: right" />
</template>

<script>
export default {
  props: {
    modelValue: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: Number.MAX_SAFE_INTEGER || 9007199254740991
    },
    min: {
      type: Number,
      default: 0
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'input'],
  methods: {
    onKeydown(e) {
      switch (e.key) {
        case 'Up':
        case 'ArrowUp':
          e.preventDefault()
          this.update(parseInt(this.modelValue) + 1)
          break
        case 'Down':
        case 'ArrowDown':
          e.preventDefault()
          this.update(parseInt(this.modelValue) - 1)
          break
      }
    },
    handleChange(e) {
      if (e.target.value === '') {
        e.target.value = this.min
        this.$emit('update:modelValue', this.min)
        this.$emit('input', this.min)
        return
      }

      if (!/^\d+$/.test(e.target.value)) {
        e.target.value = this.modelValue
        return
      }

      if (parseInt(e.target.value) >= this.max) e.target.value = this.max
      if (parseInt(e.target.value) <= this.min) e.target.value = this.min

      this.$emit('update:modelValue', parseInt(e.target.value))
      this.$emit('input', parseInt(e.target.value))
    },
    update(value) {
      if (value >= parseInt(this.min) && value <= parseInt(this.max)) {
        this.$emit('update:modelValue', parseInt(value))
        this.$emit('input', parseInt(value))
      }
    }
  }
}
</script>
