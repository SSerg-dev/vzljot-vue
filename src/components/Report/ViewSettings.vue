<template>
  <div class="grid-view-settings">
    <div class="grid-view-settings two">
      <label :disabled="disabled">Метки времени:</label>
      <select v-model="localTimeType" @update:modelValue="onChange('timeType', parseInt($event))" :disabled="disabled">
        <option v-for="r in $store.state.env.reportTimeTypes" :key="r.id" :value="r.id">{{ r.text }}</option>
      </select>
    </div>
    <check-box v-if="option" v-model="localEmptyRows" @update:modelValue="onChange('addEmptyRows', $event)" :disabled="disabled">Заполнить отчет недостающими записями</check-box>
    <check-box v-if="showIdle && option" v-model="localIdle" @update:modelValue="onChange('idle', $event)" :disabled="disabled">Выполнить расчет при наличии нештатных ситуаций</check-box>
  </div>
</template>

<script>
import CheckBox from '../Inputs/CheckBox.vue'

export default {
  components: {
    CheckBox
  },
  props: {
    timeType: {
      type: Number,
      default: null
    },
    addEmptyRows: {
      type: Boolean,
      default: false
    },
    idle: {
      type: Boolean,
      default: false
    },
    showIdle: {
      type: Boolean,
      default: false
    },
    reportType: String,
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      localIdle: this.idle,
      localEmptyRows: this.addEmptyRows,
      localTimeType: this.timeType
    }
  },
  emits: ['change'],
  created() {
    this.$watch('addEmptyRows', r => (this.localEmptyRows = r))
    this.$watch('idle', r => (this.localIdle = r))
    this.$watch('timeType', r => (this.localTimeType = r))
  },
  computed: {
    option() {
      return this.reportType === 'balance' || this.reportType === 'summary' ? false : true
    }
  },
  methods: {
    onChange(prop, value) {
      this.$emit('change', prop, value)
    }
  }
}
</script>

<style scoped>
.grid-view-settings {
  display: grid;
  grid-gap: 5px 3px;
  text-align: end;
}

.grid-view-settings .two {
  grid-template-columns: auto max-content;
}

</style>
