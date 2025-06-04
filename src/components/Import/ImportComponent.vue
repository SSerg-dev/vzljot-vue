<template>
  <div class="component-detail">
    <transition>
      <wizard v-if="wizard" v-bind="wizard" @cancel="cancelWizard" @end="onWizardEnd" />
    </transition>
  </div>
</template>

<script>
import Wizard from '../Wizard.vue'

export default {
  components: {
    Wizard
  },
  data() {
    return {
      waitText: null,
      error: {
        name: null
      },
      wizard: null
    }
  },
  mounted() {
    this.wizard = this.importWizard()
  },
  methods: {
    importWizard() {
      return {
        name: 'import',
        component: {
          text: 'Выбор файла:',
          cancellable: false,
          component: 'import-file-selector',
          event: 'fileChanged',
          async next(file) {
            if (file) {
              const { guid, systemNode, systemNodes, items } = await new Promise((resolve, reject) => {
                const fileWorker = new Worker(new URL('../../plugins/workers/import.worker.js', import.meta.url))
                fileWorker.onmessage = r => {
                  if (r.data.message === 'progress') {
                    this.waitText = `Загрузка '${file.name}' - ${r.data.percent}%`
                  } else if (r.data.message === 'end') {
                    resolve(r.data)
                  } else if (r.data.message === 'error') {
                    reject(r.data.error)
                  }
                }
                fileWorker.postMessage({ file, baseUrl: location.pathname + (location.pathname.endsWith('/') ? '' : '/') })
              })

              return {
                text: `Выбор объектов:`,
                component: 'import-data-selector',
                event: 'dataChange',
                data: {
                  guid,
                  systemNode,
                  systemNodes,
                  items
                },
                async next(data) {
                  if (data) {
                    return {
                      text: `Импорт:`,
                      component: 'import-data',
                      event: 'import',
                      data
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    cancelWizard() {
      this.wizard = this.importWizard()
    },
    onWizardEnd(data, name) {
      this.wizard = null

      if (name === 'import') {
        this.wizard = this.importWizard()
      }
    }
  }
}
</script>

<style></style>
