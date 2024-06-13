<template>
  <div class="wrapper">
    <div class="component-detail">
      <slot></slot>
    </div>
    <div v-if="!readOnly" class="footer">
      <v-button
        caption="Сохранить"
        @click="onSaveClick"
        :disabled="saving || disabled"
      />
    </div>
  </div>
</template>

<script>
import VButton from './Inputs/VButton.vue'
import { store } from '@/store/store'

export default {
  components: {
    VButton,
  },
  props: {
    saving: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      delay: 3000,
    }
  },
  methods: {
    onSaveClick() {
      const type = this.$store.state.equip.validateTypes.date
      const isValid = this.validate(type)

      if (!this.readOnly && isValid) {
        this.$emit('saveClick')
      }
    },
    validate(type) {
      switch (type) {
        case 'date':
          {
            if (
              store.state.card.timeLastChecking?.getTime &&
              store.state.card.timeNextChecking?.getTime
            ) {
              if (
                typeof store.state.card.timeLastChecking.getTime() ===
                  'number' &&
                typeof store.state.card.timeNextChecking.getTime() === 'number'
              ) {
                if (
                  store.state.card.timeLastChecking.getTime() <
                  store.state.card.timeNextChecking.getTime()
                ) {
                  return true
                } else {
                  this.$emitter.emit('preserver-component:display', 'block')

                  this.$toast.show(
                    `⚠️ Дата следующей поверки должна быть больше даты предыдущей поверки.`,
                    this.delay
                  )
                  setTimeout(() => {
                    this.$emitter.emit('preserver-component:display', 'none')
                  }, this.delay) 

                  return false
                }
              }
            } else return true
          }
          break

        default:
          return true
      }
    },
  },
}
</script>

<style scoped>
.wrapper {
  display: grid;
  flex: 1;
  overflow: auto;
  grid-template-rows: 1fr min-content;
  gap: 2px;
}

.footer {
  padding: 5px;
  width: 100%;
  background-color: #f6f8fb;
  display: flex;
  justify-content: flex-end;
}
</style>
