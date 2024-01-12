<template>
  <div class="fit">
    <expantion caption="Основные параметры" :resizable="false">
      <div class="grid">
        <div class="grid two">
          <label>{{ $store.state.env.addressTypes[type].text }}:</label>
          <input v-model.trim="localName" type="text" maxlength="200" @input="onChange('name', localName)" :class="{ 'validation-error': localError.name }" :title="localError.name" />
        </div>
        <check-box v-model="localHidden" @update:modelValue="onChange('hidden', $event)">Не отображать эту часть адреса</check-box>
      </div>
    </expantion>
  </div>
</template>

<script>
import { Address } from '@/classes/address'

import CheckBox from '../Inputs/CheckBox.vue'
import Expantion from '../ExpantionPanel.vue'

export default {
  props: {
    addressId: {
      type: Number,
      default: null
    },
    name: {
      type: String,
      default: null
    },
    hidden: Boolean,
    type: {
      type: Number,
      default: 1
    },
    error: {
      type: Object,
      default: () => ({
        name: null
      })
    }
  },
  components: {
    CheckBox,
    Expantion
  },
  data() {
    return {
      localName: this.name,
      localHidden: this.hidden,
      localError: JSON.parse(JSON.stringify(this.error))
    }
  },
  watch: {
    name(name) {
      this.localName = name
    },
    hidden(value) {
      this.localHidden = value
    },
    error: {
      handler(error) {
        this.localError = JSON.parse(JSON.stringify(error))
      },
      deep: true
    }
  },
  methods: {
    onChange(name, value) {
      this.$emit('change', name, value)
    },
    async save() {
      try {
        Object.keys(this.localError).forEach(r => (this.localError[r] = null))

        const address = new Address({
          addressId: this.addressId,
          type: this.type,
          name: this.localName,
          hidden: this.localHidden
        })

        await address.save()

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
  gap: 5px 3px;
}

.grid.two {
  grid-template-columns: max-content max-content;
}

.grid label {
  text-align: right;
}

.grid input[type='text'] {
  width: 200px;
}
</style>
