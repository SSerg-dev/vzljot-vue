<template>
  <div class="wrapper">
    <input v-focus v-model.number="value" type="number" @input="onChange()" />
  </div>
</template>

<script>
export default {
  props: {
    item: Object
  },
  data() {
    return {
      value: null
    }
  },
  methods: {
    onChange() {
      this.$emit('changed', { item: this.item, value: this.value })
    }
  }
}
</script>

<style scoped>
.wrapper {
  padding: 10px;
  background-color: #fff;
}

.wrapper > input {
  max-width: 100px;
}
</style>
