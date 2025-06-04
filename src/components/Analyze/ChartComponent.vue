<template>
  <div class="wrapper"></div>
</template>

<script>
import '../../chart/css/tooltip.css'

import { Chart } from './components/chart'

export default {
  props: {
    columns: {
      type: Array,
      default: () => []
    },
    rows: {
      type: Array,
      default: () => []
    },
    wrongs: {
      type: Array,
      default: () => []
    },
    archive: String
  },
  data() {
    return {
      chart: null
    }
  },
  async mounted() {
    await this.$nextTick()

    this.chart = new Chart(this.$el, this.columns, this.rows, this.wrongs, this.archive)
  },
  beforeUnmount() {
    this.chart.dispose()
  },
  watch: {
    rows(value) {
      this.chart.update(this.columns, value, this.wrongs, this.archive)
    }
  }
}
</script>

<style scoped>
.wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
}

</style>
