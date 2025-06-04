<template>
  <div class="wrapper-import-data">
    <div class="table-grid" :style="`grid-template-columns: repeat(3, max-content)`">
      <header class="header" />
      <header class="header">Наименование</header>
      <header class="header">Данные</header>
      <div v-for="(r, index) in tasks" :key="index" class="table-row">
        <span class="cell icon" :ref="r.id">
          <div :class="r.class" :style="r.style" :title="`${r.err > 0 ? `Ошибка ${r.err}: ` : ''}${$store.state.env.errorEnum[r.err].text}`" />
        </span>
        <span class="cell">{{ r.name }}</span>
        <span class="cell">{{ r.text }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import Task from './task'

let abortController

export default {
  props: {
    guid: String,
    systemNode: Number,
    items: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      tasks: []
    }
  },
  created() {
    this.$emitter.on('message', this.processMessage)
  },
  beforeUnmount() {
    if (abortController) abortController.abort()
    this.$emitter.off('message', this.processMessage)
  },
  mounted() {
    this.importData()
  },
  methods: {
    async importData() {
      try {
        abortController = new AbortController()
        await this.$http.post('import/import', { guid: this.guid, systemNode: this.systemNode, items: this.items }, { signal: abortController.signal })
      } catch (error) {
        this.tasks.forEach(r => r.stop())
        if (!abortController.signal.aborted) {
          this.$store.commit('error', error)
        }
      } finally {
        this.$emit('import', true)
      }
    },
    async processMessage(message) {
      if (message.type === 'import') {
        if (message.task) {
          let currentTask = this.tasks.find(r => r.id === message.task.id)

          if (typeof currentTask === 'undefined') {
            this.tasks.push(new Task(message.task))
            currentTask = this.tasks.find(r => r.id === message.task.id)

            await this.$nextTick()

            this.$refs[message.task.id][0].scrollIntoView({ behavior: 'smooth' })
          } else {
            currentTask.running = message.task.running
            currentTask.text = message.task.text
            currentTask.err = message.task.err
          }

          currentTask.running ? currentTask.start() : currentTask.stop()

          if (!currentTask.running) {
            currentTask.err ? currentTask.error() : currentTask.success()
          }
        }
      }
    }
  }
}
</script>

<style>
.wrapper-import-data {
  display: grid;
  min-height: 370px;
  max-height: 370px;
  min-width: 600px;
  position: relative;
  grid-template-rows: 1fr;
}
</style>
