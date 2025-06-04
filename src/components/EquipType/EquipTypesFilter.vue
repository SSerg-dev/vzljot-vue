<template>
  <div class="users-types-filter">
    <label>Наименование:</label>
    <input v-model="values.name" type="text" @input="onChange" maxlength="80" style="width: 200px;" />
    <label>Назначение:</label>
    <select v-model="values.purpose" @change="onChange">
      <option :value="null">(Все)</option>
      <option v-for="[k, v] in purposes" :key="k" :value="k">{{ v }}</option>
    </select>
    <label>Межповерочный интервал:</label>
    <number-box v-model="values.interval" @update:modelValue="onChange" :min="0" :max="99" style="width: 25px;" />
    <label>Системы:</label>
    <select v-model="values.schemas" @change="onChange">
      <option :value="null">(Все)</option>
      <option v-for="r in schemas" :key="r" :value="r">{{ $store.state.env.pointTypes[r]?.text }}</option>
    </select>
    <label>Является датчиком:</label>
    <div style="display: grid; gap: 5px 3px; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));">
      <check-box v-model="values.isTemperature" @update:modelValue="onChange">температуры</check-box>
      <check-box v-model="values.isPressure" @update:modelValue="onChange">давления</check-box>
      <check-box v-model="values.isVolume" @update:modelValue="onChange">расхода</check-box>
      <check-box v-model="values.isWeight" @update:modelValue="onChange">массового расхода</check-box>
    </div>
    <label>Системная:</label>
    <select v-model="values.isSystem" @change="onChange">
      <option :value="null">(Все)</option>
      <option :value="true">Да</option>
      <option :value="false">Нет</option>
    </select>
    <!-- <check-box v-model="values.isSystem" @update:modelValue="onChange"/> -->
  </div>
</template>

<script>
import CheckBox from '../Inputs/CheckBox.vue'
import NumberBox from '../Inputs/NumberBox.vue'

export default {
  components: {
    CheckBox,
    NumberBox
  },
  props: {
    filter: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      values: JSON.parse(JSON.stringify(this.filter))
    }
  },
  computed: {
    schemas() {
      const flags = []

      Object.keys(this.$store.state.env.pointTypes)
        .map(r => parseInt(r))
        .forEach(r => {
          if (r !== 0) {
            if (!flags.some(value => r & value)) {
              flags.push(r)
            }
          }
        })

      return [...new Set(flags)].sort((a, b) => {
        if (this.$store.state.env.pointTypes[a]?.text.toLowerCase() < this.$store.state.env.pointTypes[b]?.text.toLowerCase()) return -1
        if (this.$store.state.env.pointTypes[a]?.text.toLowerCase() > this.$store.state.env.pointTypes[b]?.text.toLowerCase()) return 1
      })
    },
    purposes() {
      return Object.entries(this.$store.state.env.equipTypePurposeEnum)
        .filter(([k]) => k !== 'none')
        .sort(([, a], [, b]) => {
          if (a.toLowerCase() < b.toLowerCase()) return -1
          if (a.toLowerCase() > b.toLowerCase()) return 1
        })
    }
  },
  methods: {
    onChange() {
      this.$emit('changed', this.values)
    }
  }
}
</script>

<style scoped>
.users-types-filter {
  display: grid;
  grid-gap: 5px 3px;
  grid-template-columns: 1fr auto;
}

.users-types-filter label {
  text-align: right;
}

.users-types-filter select {
  width: fit-content;
}
</style>
