<template>
  <expantion-panel caption="Режимы работы" :resizable="false">
    <check-box ref="winter" v-model="localWinter" @update:modelValue="change('winter', $event)" style="margin: 3px">Отопительный</check-box>
    <check-box ref="summer" v-model="localSummer" @update:modelValue="change('summer', $event)" style="margin: 3px">Межотопительный</check-box>
  </expantion-panel>
</template>

<script>
import CheckBox from '../Inputs/CheckBox.vue'
import ExpantionPanel from '../ExpantionPanel.vue'

export default {
  components: {
    CheckBox,
    ExpantionPanel
  },
  props: {
    winter: {
      type: Boolean,
      default: false
    },
    summer: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      localWinter: this.winter,
      localSummer: this.summer
    }
  },
  watch: {
    winter(value) {
      this.localWinter = value
    },
    summer(value) {
      this.localSummer = value
    }
  },
  methods: {
    change(prop, value) {
      this.$emit('change', prop, value)
    }
  }
}
</script>
