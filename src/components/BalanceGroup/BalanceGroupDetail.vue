<template>
  <expantion-panel caption="Основные параметры" :resizable="false" class="fit">
    <div class="grid two">
      <label>Наименование:</label>
      <input v-focus v-model.trim="localName" type="text" @input="onChange('name', $event.target.value)" style="width: 300px" maxlength="80" :class="{ 'validation-error': localError.name }" :title="localError.name" />
    </div>
  </expantion-panel>
</template>

<script>
import { BalanceGroup } from '@/classes/balanceGroup'

import ExpantionPanel from '../ExpantionPanel.vue'

export default {
  components: {
    ExpantionPanel
  },
  props: {
    name: String,
    error: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      localName: null,
      localError: JSON.parse(JSON.stringify(this.error))
    }
  },
  created() {

    this.$watch(
      () => this.name,
      value => this.localName = value
    )

    this.$watch(
      () => this.error,
      value => this.localError = JSON.parse(JSON.stringify(value)),
      { deep: true }
    )
  },
  methods: {
    onChange(prop, value) {
      this.$emit('change', prop, value)
    },
    async save() {
      try {
        this.localError = {}
        await new BalanceGroup({ name: this.localName }).save()

        return true
        
      } catch (error) {
        if (error.response?.status !== 552) {
          if (error.response?.status === 551) {
            this.localError = error.response.data
          } else {
            this.$store.commit('error', error)
          }
        }
      }
    }
  }
}
</script>

<style scoped>
.grid {
  display: grid;
  grid-gap: 5px 3px;
}

.grid.two {
  grid-template-columns: 1fr max-content;
}

.grid label {
  text-align: right;
}
</style>
