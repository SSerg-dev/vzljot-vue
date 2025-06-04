<template>
  <transition name="loader-fade">
    <div v-show="show" class="loader">
      <div class="loader-content">
        <div class="loader-spinner" :style="[show ? { animation: 'spinner 3s linear infinite' } : '']"></div>
        <span style="margin: 0 10px">{{ text }}</span>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'spinnerComponent',
  props: {
    text: {
      type: String,
      default: 'Загрузка...'
    },
    show: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style>
.loader {
  position: absolute;
  display: flex;
  color: #666;
  background-color: rgba(255, 255, 255, 0.4);
  position: absolute;
  z-index: 30000;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

.loader .loader-content {
  display: flex;
  align-items: center;
  color: inherit;
  border: 1px solid currentColor;
  padding: 20px;
  background: white;
  box-shadow: 3px 3px 15px currentColor;
}

.loader .loader-spinner {
  color: inherit;
  border: 3px solid #fff;
  border-radius: 50%;
  border-top: 3px solid currentColor;
  border-bottom: 3px solid currentColor;
  width: 30px;
  height: 30px;
}

.loader-fade-enter-active,
.loader-fade-leave-active {
  transition: opacity 0.2s;
}

.loader-fade-enter,
.loader-fade-leave-to {
  opacity: 0;
}

@keyframes spinner {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
