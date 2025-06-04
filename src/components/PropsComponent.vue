<template>
  <div class="props-background">
    <div
      class="props-header"
      :style="`grid-template-columns: ${
        image1 ? 'min-content ' : ''
      }1fr min-content;`"
    >
      <span v-if="image1" class="icon-wrapper">
        <div :class="`heading-icon ${image1}`" />
      </span>
      {{ text }}
      <div class="fas fa-times icon" title="Закрыть" @click="onClose" />
    </div>
    <div class="props-wrapper">
      <slot />
    </div>
  </div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'

import { getImage, matchType } from '../plugins/api'

// import { safeStringify } from '@/utils/common.functions.js'

const itemTypes = ['equipForm', 'equipType', 'pointForm', 'user']

export default {
  props: {
    uuid: String,
    image: String,
    text: String,
  },
  data() {
    return {
      key: uuidv4(),
    }
  },
  computed: {
    image1() {
      if (this.image) {
        return this.image
      }

      const images = this.$slots
        .default()
        .filter(
          (r) =>
            r.props &&
            r.props.hasOwnProperty('type') &&
            itemTypes.includes(
              this.$store.state.env.itemTypes[r.props.type].type
            )
        )
        .map((r) => {
          const type = { type: r.props.type }

          if (
            r.props.type ===
            matchType(this.$store.state.env.itemTypes).symbolSchema
          ) {
            return `fas fa-project-diagram icon`
          } else if (
            r.props.type === matchType(this.$store.state.env.itemTypes).set
          ) {
            return `fas fa-tasks-alt icon`
          }

          return getImage(type)
        })

      if (images.length > 0) {
        return images[0]
      }

      return null
    },
  },
  created() {
    this.$emitter.on('close', this.onCloseEvent)
    this.$emitter.on('endComponentWizard', this.onCloseEvent)
    this.$emitter.on('cancelComponentWizard', this.onCloseEvent)

    this.$watch(
      '$store.state.equip.equipEvent.hasChangeSave',
      (value) => {
        if (value) {
          this.onClose()
        }
      },
      { deep: true }
    )
  },
  beforeUnmount() {
    this.$emitter.off('close', this.onCloseEvent)
    this.$emitter.off('endComponentWizard', this.onCloseEvent)
    this.$emitter.off('cancelComponentWizard', this.onCloseEvent)
  },
  methods: {
    onClose() {
      if (this.$slots) {
        const slots = this.$slots.default()
        if (slots) {
          slots.forEach((r) => {
            if (
              r.props &&
              r.props.hasOwnProperty('id') &&
              r.props.hasOwnProperty('type') &&
              itemTypes.includes(
                this.$store.state.env.itemTypes[r.props.type].type
              )
            ) {
              console.log('beforeClose', r.props.id, r.props.type, this.key)
              this.$emitter.emit('beforeClose', {
                id: r.props.id,
                type: r.props.type,
                key: this.key,
              })
            } else {
              if (this.uuid) {
                this.$emitter.emit('beforeClose', { uuid: this.uuid })
              } else {
                this.$emitter.emit('props-component:close')

                this.$emitter.emit('beforeCloseEquipSetting', {
                  uuid: r.props.uuid,
                })

                if (!this.$store.state.equip.equipEvent.hasChangeNotSave) {
                  this.$emit('close')
                }
              }
            }
          })
        }
      }
    },
    onCloseEvent(event) {
      if (this.uuid === event.uuid) {
        this.$emit('close')
      }
    },
  },
}
</script>

<style scoped>
.props-background {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(169, 175, 183, 0.7);
  display: flex;
  flex-direction: column;
  overflow: auto;
  z-index: 10000;
  padding: 15px;
  transition: opacity 0.3s ease;
}

.props-header {
  display: grid;
  padding: 3px 10px;
  gap: 10px;
  background-color: #596673;
  color: antiquewhite;
  font-weight: 600;
  font-size: initial;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}

.icon-wrapper {
  font-size: medium;
  display: flex;
  justify-content: center;
  align-items: center;
}

.heading-icon {
  cursor: default;
  font-size: medium;
  color: antiquewhite;
}

.props-header .fa-times {
  cursor: pointer;
  transition: 0.3s;
  font-size: x-large;
}

.props-header .fa-times:hover {
  color: antiquewhite;
  transform: rotate(90deg);
}

.props-wrapper {
  background: white;
  display: flex;
  justify-content: center;
  overflow: auto;
  flex: 1;
  flex-direction: column;
  padding: 2px;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
}
</style>
