<template>
  <div>
    <div v-if="!largeWidth" class="exp-header">
      {{ caption }}
      <div
        v-if="resizable"
        :class="[
          'exp-header-button',
          { close: localOpened },
          'fas',
          'fa-angle-double-down',
        ]"
        @click="onClick()"
        :title="style.maxHeight === '0px' ? 'Показать' : 'Скрыть'"
      />
    </div>

    <label v-else class="exp-header clickable-label"
      @click="onClick()">
      {{ caption }}
      <div
        v-if="resizable"
        :class="[
          'exp-header-button',
          { close: localOpened },
          'fas',
          'fa-angle-double-down',
        ]"
        :title="style.maxHeight === '0px' ? 'Показать' : 'Скрыть'"
      />
    </label>

    <div ref="slot" :style="style">
      <div class="slot-wrapper">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
const timeOut = 200

export default {
  props: {
    caption: String,
    opened: {
      type: Boolean,
      default: true,
    },
    staticHeight: {
      type: Boolean,
      default: true,
    },
    resizable: {
      type: Boolean,
      default: true,
    },
    largeWidth: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      style: {
        overflow: this.opened ? 'visible' : 'hidden',
        maxHeight: this.opened ? null : this.resizable ? '0px' : null,
        transition: `max-height ${timeOut}ms ease-out`,
      },
      localOpened: this.opened,
    }
  },
  async mounted() {
    await this.$nextTick()
    if (this.resizable) {
      const slot = this.$refs.slot
      this.style.maxHeight =
        (this.localOpened ? (slot ? slot.scrollHeight : 0) : 0) + 'px'
    }

    if (!this.staticHeight && this.resizable) {
      setInterval(() => {
        if (this.localOpened && this.$refs.slot) {
          this.style.maxHeight = this.$refs.slot.scrollHeight + 'px'
        }
      }, 50)
    }
  },
  watch: {
    opened(value) {
      this.expand(value)
    },
  },
  methods: {
    onClick() {
      this.$emit('open', !this.localOpened)
      this.expand(!this.localOpened)
    },
    expand(value) {
      this.localOpened = value
      this.style.maxHeight = (value ? this.$refs.slot.scrollHeight : 0) + 'px'
      if (value) {
        setTimeout(() => (this.style.overflow = 'visible'), timeOut)
      } else {
        this.style.overflow = 'hidden'
      }
    },
  },
}
</script>

<style scoped>
.exp-header {
  color: #666;
  background-color: #ecf0f6;
  text-align: left;
  padding: 10px;
  font-weight: bold;
  user-select: none;
  border-bottom: 1px solid white;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.exp-header-button {
  padding: 5px;
  cursor: pointer;
  transition: transform 0.2s;
}

.exp-header-button.close {
  transform: rotate(180deg);
}

.slot-wrapper {
  padding: 5px 15px;
}
.clickable-label {
  cursor: pointer;
}
</style>
