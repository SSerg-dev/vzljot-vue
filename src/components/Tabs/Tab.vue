<template>
  <div class="content" v-if="isActive" :style="{ overflow }">
    <div ref="tabContent" class="tab" :style="{ overflow }">
      <slot :style="{ overflowY: computedOverflowY }"></slot>
    </div>
  </div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'
import {
  inject,
  ref,
  computed,
  onBeforeMount,
  onBeforeUnmount,
  watch,
  onMounted,
} from 'vue'

export default {
  name: 'tab-component',
  props: {
    text: {
      type: String,
      default: '',
    },
    selected: Boolean,
    name: String,
    overflow: {
      type: String,
      default: 'auto',
    },
  },
  setup(props) {
    const uuid = ref(uuidv4())
    const isActive = ref(props.selected)

    const provider = inject('provider') 

    // $$
    const tabContent = ref(null)

    const computedOverflowY = computed(() => {  
      if (
        tabContent.value &&
        tabContent.value.scrollHeight > tabContent.value.clientHeight
      ) {
        return 'scroll'
      } else {
        return 'hidden'
      }
    })

    watch(
      () => provider.selectedIndex,
      () => (isActive.value = uuid.value === provider.selectedIndex)
    )

    onBeforeMount(() => {
      const tab = {
        text: props.text,
        uuid: uuid.value,
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

    // $$
    onMounted(() => {
      // Update computedOverflowY on mount and whenever the component updates
      checkOverflow()
      window.addEventListener('resize', checkOverflow)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', checkOverflow)

      const index = provider.tabs.findIndex((r) => r.uuid === uuid.value)

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

    const checkOverflow = () => {
      // Force update computed property
      computedOverflowY.value
    }

    watch(
      () => props.selected,
      (newVal) => {
        isActive.value = newVal
      }
    )

    return { isActive, uuid, computedOverflowY, tabContent }
  },
}
</script>
