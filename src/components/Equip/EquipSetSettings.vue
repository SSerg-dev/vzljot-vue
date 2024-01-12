<template>
  <measures-component :measures="localMeasures" @changed="onChange()" />
</template>

<script>
import MeasuresComponent from '../MeasuresComponent.vue'

export default {
  components: {
    MeasuresComponent
  },
  props: {
    measures: Array
  },
  data() {
    return {
      localMeasures: JSON.parse(JSON.stringify(this.measures))
    }
  },
  methods: {
    onChange() {
      this.$emit('changed', this.localMeasures)
    }
  }
}
</script>

<style scoped>
.filter {
  display: grid;
  grid-gap: 5px 3px;
}
</style>
