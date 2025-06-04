<template>
  <div class="connection-type two container">
    <div class="container-1">
      <div class="item-1-1">
        <label>Идентификатор адаптера (до 8 цифр):</label>
      </div>
      <div class="item-1-2">
        <input
          @input="onChange('adapter', $event.target.value)"
          v-model="localAdapter"
          type="text"
          :class="{ 'validation-error': localError.adapter }"
          :title="localError.adapter"
          maxlength="8"
          style="width: 100px"
        />
      </div>
    </div>

    <div class="container-2">
      <div class="item-2-1">
        <label>Телефон:</label>
      </div>
      <div class="item-2-2">
        <input
          @input="onChange('phone', $event.target.value)"
          v-model.trim="localPhone"
          type="text"
          :class="{ 'validation-error': localError.phone }"
          :title="localError.phone"
          maxlength="30"
        />
      </div>
    </div>

    <div class="container-3">
      <div class="item-3-1">
        <label>Тайм-аут (c):</label>
      </div>

      <div class="item-3-2">
        <number-box
          @update:modelValue="onChange('timeOut', $event)" 
          v-model="localTimeOut"
          style="width: 60px"
          :max="1000"
        />
      </div>
    </div>
  </div>
</template>

<script>
import NumberBox from '@/components/Inputs/NumberBox.vue'

export default {
  props: {
    group: Object,
    error: Object,
  },
  components: {
    NumberBox,
  },
  data() {
    return {
      localAdapter: this.group.adapter,
      localPhone: this.group.phone,
      localTimeOut: this.group.timeOut,
      localError: {
        adapter: null,
        phone: null,
      },
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
<style scoped>
.container {
  display: flex;
  flex-direction: column;
}
.container-1,
.container-2,
.container-3 {
  display: flex;
  flex-direction: row;
}
.item-1-1 {
  justify-self: start;
  align-self: center;
  margin-right: 3px;
}
.item-1-2 {
  align-self: center;
}
.item-2-1 {
  justify-self: start;
  align-self: center;
  margin-right: 3px;
}
.item-2-2 {
  align-self: center;
}
.item-3-1 {
  justify-self: start;
  align-self: center;
  margin-right: 3px;
}
.item-3-2 {
  align-self: center;
}
</style>
