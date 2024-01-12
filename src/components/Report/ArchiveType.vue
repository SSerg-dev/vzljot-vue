<template>
  <div>
    <div v-for="item in archiveTypes" :key="item" style="padding: 3px">
      <radio :label="item" v-model="localArchiveType" @update:modelValue="onChange($event)">{{ $store.state.env.archiveTypes[item].text }}</radio>
    </div>
  </div>
</template>

<script>
import Radio from '../Inputs/Radio.vue'

export default {
  components: {
    Radio
  },
  props: {
    modelValue: {
      type: Number,
      default: null
    },
    archiveTypes: {
      type: Array,
      default: () => []
    },
  },
  data() {
    return {
      localArchiveType: this.modelValue
    }
  },
  emits: ['update:modelValue'],
  watch: {
    modelValue(r) {
      this.localArchiveType = r
    }
  },
  methods: {
    onChange(value) {
      this.$emit('update:modelValue', value)
    }
  }
}
</script>
