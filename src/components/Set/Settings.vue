<template>
  <div class="set-settings">
    <div class="set-settings two">
      <label class="field">Пауза между запросами, с.:</label>
      <number-box v-model="localPause" :min="0" :max="86399" style="text-align: end; width: 60px;" @update:modelValue="onChange" />
    </div>
    <check-box v-model="localConvert" @update:modelValue="onChange">Выполнять преобразование единиц измерения</check-box>
  </div>
</template>

<script>
import CheckBox from '../Inputs/CheckBox.vue'
import NumberBox from '../Inputs/NumberBox.vue'

export default {
  name: 'setSettings',
  components: {
    CheckBox,
    NumberBox
  },
  props: {
    pause: Number,
    convert: Boolean
  },
  data() {
    return {
      localPause: this.pause,
      localConvert: this.convert
    }
  },
  methods: {
    onChange() {
      this.$emit('changed', { pause: this.localPause, convert: this.localConvert })
    }
  }
}
</script>

<style scoped>
.set-settings {
  display: grid;
  grid-gap: 5px 3px;
}

.set-settings.two {
  grid-template-columns: max-content max-content;
}

.set-settings label {
  text-align: right;
}
</style>
