<template>
  <div class="file-selector">
    <div class="file-selector-grid">
      Файл:
      <input type="text" v-model="file.name" style="min-width: 250px;" disabled>
    </div>
    <label>
      <input ref="fileInput" type="file" accept=".zip" class="file-input" @change="handleFiles($event.target.files)" />
      <button @click="onClick">Обзор</button>
    </label>
  </div>
</template>

<script>
export default {
  data() {
    return {
      file: {}
    }
  },
  methods: {
    onClick() {
      this.$refs.fileInput.click()
    },
    handleFiles(files) {
      this.file = files.length > 0 ? files[0] : null

      if (this.file) {
        this.$emit('fileChanged', this.file)
      }
    }
  }
}
</script>

<style scoped>

.file-selector,
.file-selector-grid {
  display: grid;
  grid-gap: 5px 3px;
  grid-template-columns: max-content max-content;
  align-items: baseline;
  justify-content: end;
}

.file-selector {
  padding: 15px;  
}

.file-input {
  display: none;
}
</style>
