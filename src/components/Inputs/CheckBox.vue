<template>
  <label :class="['checkbox-wrapper', { 'is-disabled': disabled }]">
    <span :class="['checkbox-container', { 'is-checked': isChecked }]">
      <span
        class="checkbox-checkbox"
        :style="[
          { 'border-color': color },
          { 'background-color': isChecked ? color : '#fff' },
        ]"
      ></span>
      <input
        class="checkbox-original"
        type="checkbox"
        :disabled="disabled"
        :true-value="trueLabel"
        :false-value="falseLabel"
        :checked="modelValue === trueLabel"
        @change="handleChange"
      />
    </span>
    <span v-if="!!$slots.default" class="checkbox-text">
      <slot></slot>
    </span>
  </label>
</template>
<script>
export default {
  props: {
    color: {
      type: String,
      default: 'lightslategray',
    },
    modelValue: {
      type: [String, Number, Boolean],
      default: false,
    },
    disabled: Boolean,
    trueLabel: {
      type: [String, Number, Boolean],
      default: true,
    },
    falseLabel: {
      type: [String, Number, Boolean],
      default: false,
    },
  },
  emits: ['update:modelValue'],
  computed: {
    isChecked() {
      if (typeof this.modelValue === 'boolean') {
        return this.modelValue
      } else if (this.modelValue !== null && this.modelValue !== undefined) {
        return this.modelValue === this.trueLabel
      }

      return false
    },
  },
  methods: {
    handleChange(e) {
      this.$emit(
        'update:modelValue',
        e.target.checked ? this.trueLabel : this.falseLabel
      )
    },
  },
}
</script>

<style scoped>
.checkbox-wrapper {
  display: inline-flex;
  align-items: center;
  align-self: center;
  margin: 0;
  cursor: pointer;
  width: fit-content;
}

.checkbox-wrapper.validation-error {
  color: #f00;
}

.checkbox-wrapper.is-disabled {
  opacity: 0.5;
  cursor: default;
}

.checkbox-wrapper .checkbox-container {
  white-space: nowrap;
  outline: none;
  display: inline-flex;
}

.checkbox-wrapper .checkbox-checkbox {
  display: inline-flex;
  position: relative;
  border-width: 2px;
  border-style: solid;
  border-radius: 2px;
  box-sizing: border-box;
  width: 16px;
  height: 16px;
  z-index: 1;
  transition: border-color 0.25s cubic-bezier(0.71, -0.46, 0.29, 1.46),
    background-color 0.25s cubic-bezier(0.71, -0.46, 0.29, 1.46);
}

.checkbox-wrapper .checkbox-checkbox:after {
  box-sizing: content-box;
  content: '';
  border: 3px solid #fff;
  border-left: 0;
  border-top: 0;
  height: 7px;
  left: 2px;
  position: absolute;
  top: 0;
  transform: rotate(45deg) scaleY(0);
  width: 4px;
  transition: transform 0.15s ease-in 0.05s;
  transform-origin: center;
}

.checkbox-wrapper .checkbox-container.is-checked .checkbox-checkbox:after {
  transform: rotate(45deg) scaleY(1);
}

.checkbox-wrapper .checkbox-original {
  opacity: 0;
  outline: none;
  position: absolute;
  margin: 0;
  width: 0;
  height: 0;
  z-index: -1;
}

.checkbox-wrapper .checkbox-text {
  padding-left: 5px;
  user-select: none;
  text-align: left;
}
</style>
