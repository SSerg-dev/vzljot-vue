<template>
  <transition name="ui-fab">
    <div class="ui-fab" :style="getStyle()" :title="title" @click="$emit('click')" />
  </transition>
</template>

<script>
export default {
  props: {
    title: String,
    fabStyle: {
      type: [Object, Array],
      default: () => ({
        width: '30px',
        height: '30px',
        borderRadius: '50%'
      })
    }
  },
  methods: {
    getStyle() {
      return this.fabStyle instanceof Array ? Object.assign({}, ...this.fabStyle) : Object.assign({}, this.$store.getters.styleColors, this.fabStyle)
    }
  }
}
</script>

<style>
.ui-fab {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border: none;
  cursor: pointer;
  outline: none;
  transition: box-shadow 0.1s ease;
  position: relative;
}

.ui-fab:hover {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
}

.ui-fab:active {
  box-shadow: none;
}

.ui-fab-enter-active,
.ui-fab-leave-active {
  transition: transform 0.1s ease-in;
}

.ui-fab-enter,
.ui-fab-leave-to {
  transform: scale(0);
}

.ui-fab-enter-to {
  transform: scale(1);
}
</style>
