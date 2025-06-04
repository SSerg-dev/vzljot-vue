<template>
  <expantion-panel caption="Настройки мнемосхемы" :resizable="false" class="fit">
    <div class="grid">
      <div class="grid two">
        <label>Наименование:</label>
        <input v-if="!schema.isSystem" v-model.trim="name" type="text" @input="onChange('name', name)" style="width: 300px;" maxlength="80" :class="{ 'validation-error': localError.name }" :title="localError.name" />
        <template v-else>{{ schema.name }}</template>
        <label>Тип:</label>
        {{ type !== null ? (type !== setTypes.none ? $store.state.env.setTypes[type].text : 'Шаблон') : null }}
        <template v-if="schema.equipType && schema.equipType.name">
          <label>Модель прибора:</label>
          {{ equipType.name }}
        </template>
      </div>
      <check-box v-if="type === setTypes.equipType" @update:modelValue="onChange('availableForAll', $event)" v-model="availableForAll">Доступна для всех приборов</check-box>
    </div>
  </expantion-panel>
</template>

<script>
import { matchType } from '../../plugins/api.js'

import CheckBox from '../Inputs/CheckBox.vue'
import ExpantionPanel from '../ExpantionPanel.vue'

export default {
  components: {
    CheckBox,
    ExpantionPanel
  },
  props: {
    schema: Object,
    error: {
      type: Object,
      default: () => ({
        name: null
      })
    }
  },
  data() {
    return {
      name: this.schema.name,
      availableForAll: this.schema.availableForAll,
      type: this.schema.type,
      equipType: this.schema.equipType,
      localError: JSON.parse(JSON.stringify(this.error))
    }
  },
  computed: {
    setTypes() {
      return matchType(this.$store.state.env.setTypes)
    }
  },
  watch: {
    error: {
      handler(r) {
        this.localError = JSON.parse(JSON.stringify(r))
      },
      deep: true
    },
    'schema.name'(r) {
      this.name = r
    },
    'schema.availableForAll'(r) {
      this.availableForAll = r
    },
    'schema.type'(r) {
      this.type = r
    },
    'schema.equipType': {
      handler(r) {
        this.equipType = r
      },
      deep: true
    }
  },
  methods: {
    onChange(prop, value) {
      this.$emit('changed', prop, value)
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
