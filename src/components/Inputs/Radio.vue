<template>
  <label :class="['radio-wrapper', { 'is-disabled': isDisabled }, { 'is-checked': isChecked }]">
    <span class="radio-outer-circle" :class="{ 'is-disabled': isDisabled, 'is-checked': isChecked }">
      <span class="radio-inner-circle"></span>
      <input class="radio-input" type="radio" :value="modelValue" :checked="isChecked" @input="handleChange" :disabled="isDisabled" tabindex="-1" />
    </span>
    <span class="radio_text" @keydown.stop>
      <slot></slot>
    </span>
  </label>
</template>

<script>
export default {
  name: 'radio-input',
  props: {
    modelValue: [Boolean, String, Number, Object],
    label: {
      type: [Boolean, String, Number, Object],
      default: false
    },
    disabled: Boolean
  },
  emits: ['update:modelValue'],
  computed: {
    isChecked() {
      return this.label === this.modelValue
    },
    isDisabled() {
      return this.disabled
    }
  },
  methods: {
    handleChange() {
      this.$emit('update:modelValue', this.label)
    }
  }
}
</script>

<style scoped>
.radio-wrapper {
  align-items: center;
  display: flex;
  margin: 0;
  cursor: pointer;
  width: fit-content;
}

.radio-inner-circle {
  background-color: lightslategray;
  border-radius: 50%;
  opacity: 0;
  transform: scale(1);
  transition-duration: 0.3s;
  transition-property: transform, opacity, background-color;
  width: 14px;
  height: 14px;
  margin: 0;
  z-index: -1;
}

.radio-wrapper.is-checked .radio-inner-circle {
  opacity: 1;
  transform: scale(0.7);
  z-index: 0;
}

.radio-wrapper.is-disabled {
  opacity: 0.5;
  cursor: default;
}

.radio-outer-circle {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  border-radius: 50%;
  border: 2px solid lightslategray;
  transition: border-color 0.2s;
}

.radio-input {
  height: 1px;
  margin: 0;
  opacity: 0;
  outline: none;
  padding: 0;
  position: absolute;
  width: 1px;
}

.radio_text {
  margin-left: 5px;
  user-select: none;
  text-align: left;
}
</style>
