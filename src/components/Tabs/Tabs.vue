<template>
  <div class="tabs-container" :style="{ overflow }">
    <div class="tabs">
      <div v-for="r in tabs" :key="r.uuid" :class="['tab', { active: r.uuid === selectedIndex }]" @click="click(r)">{{ r.text }}</div>
    </div>
    <slot></slot>
  </div>
</template>

<script>
import '../../assets/tabs.css'

import { provide, reactive, toRefs } from 'vue'

const getSlots = slots => {
  return slots.default().filter(r => r.type.name === 'tab-component' || r.type.name === 'tabx-component')
}

const getTabs = slots => {
  return getSlots(slots).map((r, index) => {
    return {
      index,
      text: r.props.text
    }
  })
}

export default {
  name: 'tabs-component',
  props: {
    overflow: {
      type: String,
      default: 'auto'
    }
  },
  emits: ['click'],
  created() {
    this.$watch(
      () => this.tabs.length,
      () => {
        const slots = getTabs(this.$slots)
        this.tabs.sort((a, b) => {
          const aIndex = slots.findIndex(r => r.text === a.text)
          const bIndex = slots.findIndex(r => r.text === b.text)

          return slots[aIndex].index - slots[bIndex].index
        })
      }
    )
  },
  setup() {
    const selectedIndex = null
    const tabs = reactive([])

    const state = reactive({
      selectedIndex,
      tabs
    })

    provide('provider', state)

    return { ...toRefs(state) }
  },
  methods: {
    click(tab) {
      this.selectedIndex = tab.uuid

      this.$emit('click', tab.name)
    }
  }
}
</script>
