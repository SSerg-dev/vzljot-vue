<template>
  <div style="font-size: 14px; padding: 15px; min-width: 450px">
    <div v-for="(r, i) in options" :key="i" style="padding: 3px">
      <radio :label="r.type" v-model="option" @change="handleChange">{{
        r.text
      }}</radio>
    </div>
  </div>
</template>

<script>
import Radio from './Inputs/Radio.vue'

export default {
  name: 'selectorOption',
  components: {
    Radio,
  },
  props: {
    options: {
      type: Array,
      default: () => [],
    },
    defaultOption: Object,
  },
  data() {
    return {
      option: this.defaultOption
        ? this.defaultOption.type
        : this.options
        ? this.options.length > 0
          ? this.options[0].type
          : null
        : null,
    }
  },
  mounted() {
    this.$nextTick().then(() => {
      if (this.option != null) {
        this.$emit('selectionChanged', this.option)
      }
    })
  },
  methods: {
    handleChange(e) {
      this.$emit('selectionChanged', e.target.value)
    },
  },
}
</script>
