<template>
  <div class="filter">
    <label>Начало:</label>
    <date-picker v-model="localFilter.periodStart" format="DD.MM.YYYY" clearable style="width: 90px" @update:modelValue="onChange" />
    <label>Окончание:</label>
    <date-picker v-model="localFilter.periodEnd" format="DD.MM.YYYY" clearable style="width: 90px" @update:modelValue="onChange" />
  </div>
</template>

<script>
import DatePicker from '../Inputs/DatePicker.vue'

export default {
  components: {
    DatePicker
  },
  props: {
    filter: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      localFilter: JSON.parse(JSON.stringify(this.filter))
    }
  },
  watch: {
    filter(value) {
      this.localFilter = value
    }
  },
  methods: {
    onChange() {
      this.$emit('changed', this.localFilter)
    }
  }
}
</script>

<style scoped>
.filter {
  display: grid;
  grid-gap: 5px 3px;
  grid-template-columns: 1fr auto;
}

.filter label {
  text-align: right;
}
</style>
