<template>
  <expantion-panel caption="Основные параметры" :resizable="false" class="fit">
    <div class="grid">
      <label>Наименование:</label>
      <input
        v-focus
        v-model.trim="localName"
        type="text"
        maxlength="80"
        @input="onChange('name', localName)"
        :class="{ 'validation-error': localError.name }"
        :title="localError.name"
      />
      <label>Примечание:</label>
      <input
        v-model.trim="localNote"
        type="text"
        maxlength="200"
        @input="onChange('note', localNote)"
        :class="{ 'validation-error': localError.note }"
        :title="localError.note"
      />
    </div>
  </expantion-panel>
</template>

<script>
import ExpantionPanel from '../ExpantionPanel.vue'
import { PointGroup } from '@/classes/pointGroup'

export default {
  components: {
    ExpantionPanel
  },
  props: {
    id: {
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
    error: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      localName: this.name,
      localNote: this.note,
      localError: JSON.parse(JSON.stringify(this.error))
    }
  },
  created() {
    this.$watch(
      () => this.name,
      value => (this.localName = value)
    )

    this.$watch(
      () => this.note,
      value => (this.localNote = value)
    )

    this.$watch(
      () => this.error,
      value => (this.localError = JSON.parse(JSON.stringify(value))),
      { deep: true }
    )
  },
  methods: {
    onChange(name, value) {
      this.$emit('change', name, value)
    },
    async save() {
      try {
        Object.keys(this.localError).forEach(r => (this.localError[r] = null))

        const pointGroup = new PointGroup({
          id: this.id,
          name: this.localName,
          note: this.localNote
        })

        await pointGroup.save()

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
  grid-template-columns: auto 1fr;
}

.grid select {
  min-width: 200px;
  width: fit-content;
}

.grid label {
  text-align: right;
}

.grid input[type='text'] {
  min-width: 200px;
}
</style>
