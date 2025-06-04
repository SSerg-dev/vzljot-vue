<template>
  <div class="fit">
    <expantion-panel caption="Настройки набора" :resizable="false">
      <div class="set-detail">
        <div class="set-detail two">
          <label>Наименование:</label>
          <input
            v-model.trim="localSet.name"
            type="text"
            style="width: 354px"
            maxlength="80"
            :class="{ 'validation-error': localError.name }"
            :title="localError.name"
            @input="onChange('name', localSet.name)"
          />
          <label>Тип:</label>{{ setTypeText }} <label v-if="localSet.equipType">Модель прибора:</label>{{ localSet.equipType }}
        </div>
        <check-box v-model="localSet.isOpcAllowed" @update:modelValue="onChange('isOpcAllowed', $event)">Разрешить доступ через OPC</check-box>
        <check-box v-model="localSet.isPollAllowed" @update:modelValue="onChange('isPollAllowed', $event)"
          >Разрешить сохранение значений в БД</check-box
        >
        <check-box v-if="isEquipType" v-model="localSet.availableForAll" @update:modelValue="onChange('availableForAll', $event)"
          >Доступен для всех приборов</check-box
        >
        <check-box v-if="isEquipType" v-model="localSet.isCustomizing" @update:modelValue="onChange('isCustomizing', $event)"
          >Использовать в качестве настроечных параметров</check-box
        >
      </div>
    </expantion-panel>
  </div>
</template>

<script>
import { matchType } from '../../plugins/api.js'

import { Set } from '../../classes/set'

import ExpantionPanel from '../ExpantionPanel.vue'
import CheckBox from '../Inputs/CheckBox.vue'

export default {
  name: 'setDetail',
  components: {
    CheckBox,
    ExpantionPanel
  },
  props: {
    set: Object,
    error: Object
  },
  data() {
    return {
      localSet: new Set(this.set),
      localError: {
        name: false
      }
    }
  },
  computed: {
    isEquipType() {
      return this.localSet.type === matchType(this.$store.state.env.setTypes).equipType
    },
    setTypeText() {
      return this.localSet.type ? this.$store.state.env.setTypes[this.localSet.type].text : null
    }
  },
  watch: {
    set: {
      handler(value) {
        this.localSet = value
      },
      deep: true
    },
    error(value) {
      Object.keys(this.localError).forEach(r => (this.localError[r] = null))
      if (value) {
        Object.entries(value).forEach(([k, v]) => (this.localError[k] = v))
      }
    }
  },
  methods: {
    onChange(prop, value) {
      this.$emit('changed', prop, value)
    },
    async save() {
      try {
        await this.localSet.save()
      } catch (error) {
        if (error.response.status === 551) {
          this.localError = error.response.data
        } else {
          this.$store.commit('error', error)
        }

        return false
      }

      return true
    }
  }
}
</script>

<style scoped>
.set-detail {
  display: grid;
  gap: 5px 3px;
  grid-template-rows: max-content;
}

.set-detail.two {
  grid-template-columns: max-content max-content;
}

.set-detail.two label {
  text-align: right;
}
</style>
