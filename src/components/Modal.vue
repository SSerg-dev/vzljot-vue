<template>
  <transition>
    <div :style="backgroundStyle">
      <div class="modal-wrapper">
        <div class="modal-header">
          <slot name="header"> Header </slot>
          <div
            v-if="cancellable"
            class="fas fa-times icon"
            @click="$emit('cancel')"
            title="Закрыть"
          />
        </div>
        <div class="modal-content">
          <slot name="content"> Content </slot>
        </div>
        <div class="modal-footer">
          <slot name="footer">
            <button @click="$emit('ok')" :disabled="okDisabled">Ок</button>
            <button v-if="cancellable" @click="$emit('cancel')">Отмена</button>
          </slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'vue-modal',
  props: {
    background: {
      type: String,
      default: 'rgba(169, 175, 183, 0.7)',
    },
    okDisabled: {
      type: Boolean,
      default: false,
    },
    cancellable: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    backgroundStyle() {
      return {
        position: 'absolute',
        top: '0',
        bottom: '0',
        left: '0',
        right: '0',
        background: this.background,
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        overflow: 'auto',
        'z-index': '10000',
        transition: 'opacity .3s ease',
      }
    },
  },

  beforeUnmount() {
    const options = {
      isNodeCreate: false,
    }
    this.$store.commit('setCard', options)
  },
}
</script>

<style scoped>
.modal-wrapper {
  display: flex;
  flex-direction: column;
}

.modal-header,
.modal-footer {
  display: grid;
  gap: 5px 3px;
  align-items: center;
  background-color: rgb(236, 240, 246);
  color: slategrey;
  user-select: none;
}

.modal-header {
  grid-template-columns: auto min-content;
  font-size: larger;
  padding: 5px 10px;
  background-color: #596673;
  color: antiquewhite;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}

.modal-footer {
  padding: 5px 10px;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
}

.modal-content {
  padding: 10px;
  background-color: #fff;
}

.modal-footer {
  grid-template-columns: min-content min-content;
  justify-content: end;
}

.modal-header .fa-times {
  cursor: pointer;
  transition: 0.3s;
  font-size: x-large;
}

.modal-header .fa-times:hover {
  color: antiquewhite;
  transform: rotate(90deg);
}
</style>
