<template>
  <transition
    enter-active-class="enter-active"
    leave-class="leave"
    leave-active-class="leave-active"
    leave-to-class="leave-to"
    @beforeEnter="beforeEnter"
    @enter="enter"
    @afterEnter="afterEnter"
    @beforeLeave="beforeLeave"
    @leave="leave"
    @afterLeave="afterLeave"
  >
    <slot />
  </transition>
</template>

<script>
export default {
  methods: {
    beforeEnter(el) {
      el.style.height = '0px'
    },
    enter(el) {
      requestAnimationFrame(() => {
        el.style.height = el.scrollHeight + 'px'
      })
    },
    afterEnter(el) {
      el.style.removeProperty('height')
    },
    beforeLeave(el) {
      el.style.height = el.clientHeight + 'px'
    },
    leave(el) {
      requestAnimationFrame(() => {
        el.style.height = '0px'
      })
    },
    afterLeave(el) {
      el.style.removeProperty('height')
    }
  }
}
</script>

<style scoped>
  .leave {
    opacity: 1;
  }

  .enter-active,
  .leave-active {
    overflow: hidden;
    transition: all .3s ease;
  }

  .leave-to {
    opacity: 0;
  }
</style>