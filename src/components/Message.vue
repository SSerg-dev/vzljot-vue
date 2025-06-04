<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'message-component',
  props: {
    text: String
  }
})
</script>

<template>
  <div class="message-component">
    {{ text }}
  </div>
</template>

<style scoped>
.message-component {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-width: 450px;
  min-height: 250px;
}
</style>
