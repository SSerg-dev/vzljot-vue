<template>
  <div class="fit">
    <expantion-panel caption="Основные параметры" :resizable="false">
      <div class="grid">
        <div class="grid two">
          <label>Номер дома:</label>
          <input v-model.trim="localNumber" type="text" maxlength="25" @input="onChange('number', localNumber)" :class="{ 'validation-error': localError.number }" :title="localError.number" />
          <label>Корпус:</label>
          <input v-model.trim="localBuilding" type="text" maxlength="25" @input="onChange('building', localBuilding)" />
          <label>Строение:</label>
          <input v-model.trim="localConstruction" type="text" maxlength="25" @input="onChange('construction', localConstruction)" />
          <label>Литера:</label>
          <input v-model.trim="localLetter" type="text" maxlength="25" @input="onChange('letter', localLetter)" />
          <label>Примечание:</label>
          <input v-model.trim="localNote" type="text" maxlength="75" @input="onChange('note', localNote)" />
        </div>
        <check-box v-model="localHidden" @update:modelValue="onChange('hidden', $event)">Не отображать эту часть адреса</check-box>
      </div>
    </expantion-panel>
  </div>
</template>

<script>
import { Address } from '@/classes/address'

import CheckBox from '../Inputs/CheckBox.vue'
import ExpantionPanel from '../ExpantionPanel.vue'

export default {
  components: {
    CheckBox,
    ExpantionPanel
  },
  props: {
    addressId: {
      type: Number,
      default: null
    },
    number: {
      type: String,
      default: null
    },
    building: {
      type: String,
      default: null
    },
    construction: {
      type: String,
      default: null
    },
    letter: {
      type: String,
      default: null
    },
    note: {
      type: String,
      default: null
    },
    hidden: Boolean,
    type: {
      type: Number,
      default: 4
    },
    error: {
      type: Object,
      default: () => ({
        number: null
      })
    }
  },
  data() {
    return {
      localNumber: this.number,
      localBuilding: this.building,
      localConstruction: this.construction,
      localLetter: this.letter,
      localNote: this.note,
      localHidden: this.hidden,
      localError: JSON.parse(JSON.stringify(this.error))
    }
  },
  watch: {
    number(value) {
      this.localNumber = value
    },
    building(value) {
      this.localBuilding = value
    },
    construction(value) {
      this.localConstruction = value
    },
    letter(value) {
      this.localLetter = value
    },
    note(value) {
      this.localNote = value
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
          number: this.localNumber,
          building: this.localBuilding,
          construction: this.localConstruction,
          letter: this.localLetter,
          note: this.localNote,
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
