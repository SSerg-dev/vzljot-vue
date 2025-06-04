<template>
  <transition>
    <div v-show="error" class="error-wrapper" @click="backgroundClick">
      <div class="container" @click="containerClick($event)">
        <div class="header">
          <span>{{ caption }}:</span>
        </div>
        <div class="content" readonly v-html="message" />
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  data() {
    return {
      caption: null,
      message: null
    }
  },
  computed: {
    error() {
      return this.$store.state.error
    }
  },
  watch: {
    error(val) {
      if (val) {
        this.onError(val)
      }
    }
  },
  methods: {
    backgroundClick() {
      this.$store.commit('error', null)
    },
    containerClick(e) {
      e.stopPropagation()
    },
    async onError(error) {
      this.caption = 'Ошибка'
      if (error.response) {
        const { response, config } = error

        if (response.status >= 400 && response.status < 500) {
          this.caption += ' клиента'
          this.message = `Код ошибки: ${response.status},<br>Текст ошибки: ${response.statusText},<br>Путь: "${config.url}",<br>Метод: ${config.method},<br>Параметры: ${config.data}`
        } else {
          console.log('vue err', error.response.data)

          let errorText = JSON.stringify(response.data)

          if (response.data instanceof Blob) {
            errorText = await response.data.text()
          }

          this.caption += ' сервера'
          this.message = `Код ошибки: ${response.status},<br>Текст ошибки: ${response.statusText},<br>Путь: "${config.url}",<br>Метод: ${config.method},<br>Параметры: ${config.data},<br>${errorText}`
        }
      } else if (error.request) {
        console.log('Request:', error.request)
      } else if (error.message) {
        this.message = error.message
      } else {
        this.message = error
      }
    }
  }
}
</script>

<style scoped>
.error-wrapper {
  position: absolute;
  display: flex;
  background-color: rgba(169, 175, 183, 0.7);
  position: absolute;
  z-index: 30000;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  overflow: auto;
}

.error-wrapper .container {
  background: white;
  width: 500px;
}

.error-wrapper .content {
  padding: 10px;
  overflow: auto;
  height: 250px;
  overflow-wrap: break-word;
}

.error-wrapper .header {
  background-color: crimson;
  color: white;
  font-size: 14px;
  padding: 10px;
}
</style>
