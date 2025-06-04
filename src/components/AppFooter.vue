<template>
  <div class="footer-wrapper">
    <span class="cell" style="flex: 1;">© АО «Взлет», 2025. Все права защищены.</span>
    <span v-if="weather !== null" class="cell">{{ weather }}°C;</span>
    <span class="cell">{{ agent }}</span>
    <span :class="['cell', 'fas', 'fa-server', 'icon']" :style="{ color: vspColor }" :title="vspTitle" />
    <span :class="['cell', 'fas', connectionIcon, 'icon']" :style="{ color: connectionColor }" :title="connectionTitle" />
  </div>
</template>

<script>
import Bowser from 'bowser'

const browser = Bowser.getParser(window.navigator.userAgent)

let stateConversion = {
  connecting: {
    text: 'подключение',
    color: 'orangered',
    icon: 'fa-link'
  },
  connected: {
    text: 'подключено',
    color: 'mediumseagreen',
    icon: 'fa-link'
  },
  reconnecting: {
    text: 'переподключение',
    color: 'orange',
    icon: 'fa-link'
  },
  disconnected: {
    text: 'нет подключения',
    color: 'orangered',
    icon: 'fa-unlink'
  }
}

export default {
  computed: {
    connection() {
      let obj = {
        protocol: '',
        host: '',
        state: 'disconnected'
      }
      if (this.$store.state.connection) {
        const url = new URL(this.$store.state.connection.baseUrl)

        obj.protocol = url.protocol
        obj.host = url.host
        obj.state = this.$store.state.connection.state.toLowerCase()
      }
      return obj
    },
    vspTitle() {
      return `Сервер: ${this.$store.state.vsp.server ? this.$store.state.vsp.server : ''}
Порт: ${this.$store.state.vsp.port ? this.$store.state.vsp.port : ''}
Состояние: ${this.$store.state.vsp.isOpened ? '' : 'не'}доступно${
        this.$store.state.vsp.reason
          ? `
Причина: ` + this.$store.state.vsp.reason
          : ``
      }`
    },
    vspColor() {
      return this.$store.state.vsp.isOpened ? 'mediumseagreen' : 'orangered'
    },
    connectionTitle() {
      return `Протокол: ${this.connection.protocol},
Хост: ${this.connection.host}
Состояние: ${stateConversion[this.connection.state].text}`
    },
    connectionIcon() {
      return stateConversion[this.connection.state].icon
    },
    connectionColor() {
      return stateConversion[this.connection.state].color
    },
    agent() {
      return this.$store.state.user ? `Клиент: ${browser.getBrowserName()} v.${browser.getBrowserVersion()};` : null
    },
    weather() {
      var temperature = null
      if (this.$store.state.weather) {
        switch (this.$store.state.weather.provider) {
          case 'openweathermap':
            if (this.$store.state.weather.cod === 200) {
              temperature = parseFloat(Math.round(this.$store.state.weather.main.temp * 10) / 10)
            }
            break
          case 'darksky':
            temperature = parseFloat(Math.round(this.$store.state.weather.currently.temperature * 10) / 10)
            break
        }
      }
      return temperature
    }
  }
}
</script>

<style>
.footer-wrapper {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding: 5px;
  background-color: #f6f8fb;
}

.footer-wrapper .cell {
  padding: 0 4px;
  user-select: none;
  cursor: default;
}
</style>
