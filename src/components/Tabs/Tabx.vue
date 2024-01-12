<template>
  <div class="content" v-show="isActive">
    <div class="tab">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'
import { inject, ref, onBeforeMount, onBeforeUnmount, watch } from 'vue'

export default {
  name: 'tabx-component',
  props: {
    text: {
      type: String,
      default: ''
    },
    selected: Boolean,
    name: {
      type: String,
      default: null
    }
  },
  setup(props) {
    const uuid = ref(uuidv4())
    const isActive = ref(props.selected)

    const provider = inject('provider')

    watch(
      () => provider.selectedIndex,
      () => (isActive.value = uuid.value === provider.selectedIndex)
    )

    onBeforeMount(() => {
      const tab = {
        text: props.text,
        uuid: uuid.value
      }

      if (props.hasOwnProperty('name')) {
        tab.name = props.name
      }

      if (props.hasOwnProperty('selected')) {
        tab.selected = props.selected
      }

      if (tab.selected) {
        provider.selectedIndex = tab.uuid
      }

      if (!provider.selectedIndex) {
        provider.selectedIndex = tab.uuid
      }

      provider.tabs.push(tab)

      isActive.value = uuid.value === provider.selectedIndex
    })

    onBeforeUnmount(() => {
      const index = provider.tabs.findIndex(r => r.uuid === uuid.value)

      if (index > -1) {
        provider.tabs.splice(index, 1)
      }

      if (provider.selectedIndex === uuid.value) {
        if (index > 0) {
          provider.selectedIndex = provider.tabs[index - 1].uuid
        } else if (index === 0) {
          if (provider.tabs.length > 0) {
            provider.selectedIndex = provider.tabs[0].uuid
          } else {
            provider.selectedIndex = null
          }
        }
      }
    })

    return { isActive, uuid }
  }
}
</script>
