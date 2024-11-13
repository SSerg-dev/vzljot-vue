<template>
  <div class="toast-container">
    <div v-for="(toast, index) in toasts" :key="index" class="toast-items">
      <span class="toast-message item-1">{{ toast.message }}</span>
      <button class="toast-close item-2" @click="removeToast(index)">
        &times;
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onBeforeUnmount } from 'vue'

export default {
  name: 'ToastContainer',
  setup() {
    const toasts = ref([])
    let timeout = null

    const addToast = (message, duration = 3000) => {
      toasts.value.push({ message })
      timeout = setTimeout(() => {
        toasts.value.shift()
      }, duration)
    }

    const removeToast = (index) => {
      toasts.value.splice(index, 1)
    }
    onBeforeUnmount(() => {
      timeout = null
    })
    return {
      toasts,
      addToast,
      removeToast,
      timeout,
    }
  },
}
</script>

<style>
.toast-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  z-index: 99999;
}

.toast-items {
  display: flex;
  justify-content: space-between;
  align-items: center;

  width: 470px;
  height: max-content * 2;

  padding: 10px 10px 10px 20px;

  background: #fff;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px #ccc solid;

  font-size: larger;
  border-radius: 5px;

  margin-bottom: 10px;
  opacity: 1;

  transform: translateY(-20px);
  transition: opacity 0.3s ease, transform 0.3s ease;

  pointer-events: auto;
  position: relative;
}



.item-1 {
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-2 {
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding-bottom: 10px;
}

.toast-close {
  background: none;
  border: none;
  color: #abacb1;
  font-size: 20px;
  cursor: pointer;
}

.toast-close:focus {
  outline: none;
}

button {
  min-width: 42px;
}
</style>
