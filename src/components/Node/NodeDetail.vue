<template>
  <expantion caption="Основные параметры" :resizable="false" class="fit">
    <div class="grid-node">
      <label>Наименование:</label>
      <input v-focus v-model.trim="localName" type="text" maxlength="80" @input="onChange('name', localName)" :class="{ 'validation-error': localError.name }" :title="localError.name" />
      <label>Примечание:</label>
      <input v-model.trim="localNote" type="text" maxlength="200" @input="onChange('note', localNote)" />
      <label>Тип:</label>
      <select v-model="localType" @change="onChange('type', localType)">
        <option v-for="[k, v] in Object.entries($store.state.env.nodeTypes)" :key="k" :value="parseInt(k)">
          {{ v.text }}
        </option>
      </select>
      <label>Потребитель:</label>
      <select v-model="localConsumer" @change="onChange('consumer', localConsumer)">
        <option :value="null">(Нет)</option>
        <option v-for="r of $store.state.env.consumers" :key="r.id" :value="r.id">{{ r.name }}</option>
      </select>
      <check-box style="grid-column: span 2;" v-model="localHidden" @update:modelValue="onChange('hidden', $event)">Не отображать эту часть адреса</check-box>
    </div>
  </expantion>
</template>

<script>
import axios from 'axios'

import { Node, NodeError } from '@/classes/node'

import Expantion from '../ExpantionPanel.vue'
import CheckBox from '../Inputs/CheckBox.vue'

export default {
  components: {
    CheckBox,
    Expantion
  },
  props: {
    addressId: {
      type: Number,
      default: null
    },
    name: {
      type: String,
      default: null
    },
    note: {
      type: String,
      default: null
    },
    type: {
      type: Number,
      default: 1
    },
    consumer: {
      type: Number,
      default: null
    },
    hidden: {
      type: Boolean,
      default: false
    },
    error: {
      type: Object,
      default: () => ({
        name: null
      })
    }
  },
  data() {
    return {
      localName: this.name,
      localNote: this.note,
      localType: this.type,
      localConsumer: this.consumer,
      localHidden: this.hidden,
      localError: {
        name: null
      }
    }
  },
  watch: {
    name(value) {
      this.localName = value
    },
    note(value) {
      this.localNote = value
    },
    type(value) {
      this.localType = value
    },
    consumer(value) {
      this.localConsumer = value
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
        this.localError = new NodeError({})

        const node = new Node({
          addressId: this.addressId,
          type: this.localType,
          name: this.localName,
          consumer: this.localConsumer,
          note: this.localNote,
          hidden: this.localHidden
        })

        await node.save()

        return true
      } catch (error) {
        if (axios.isAxiosError(error)) {
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
}
</script>

<style scoped>
.grid-node {
  display: grid;
  gap: 5px 3px;
  grid-template-columns: auto 1fr;
}

.grid-node select {
  min-width: 200px;
  width: fit-content;
}

.grid-node label {
  text-align: right;
}

.grid-node input[type='text'] {
  min-width: 200px;
}

</style>
