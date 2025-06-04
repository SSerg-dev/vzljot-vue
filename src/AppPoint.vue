<template>
  <div class="detail-container">
    <h1 class="heading">{{ caption }}</h1>
    <point v-if="$store.state.user" v-bind="{ uuid,  id, systemType }" @loaded="onLoaded" />
    <error />
    <notification-panel />
    <spinner :show="!$store.state.user" :text="'Инициализация'" />
  </div>
</template>

<script>
import './assets/font.css'
import './assets/main.css'
import './assets/table.css'

import { v4 as uuidv4 } from 'uuid'

import Point from './components/Point/PointComponent.vue'
import Error from './components/Error.vue'
import NotificationPanel from './components/NotificationPanel.vue'

export default {
  name: 'app',
  components: {
    Point,
    Error,
    NotificationPanel
  },
  props: {
    baseUrl: String,
    colors: Object,
    id: Number,
    systemType: Number
  },
  data() {
    return {
      uuid: uuidv4(),
      connection: new signalR.HubConnectionBuilder().withUrl(`${this.baseUrl}serviceHub`).configureLogging(signalR.LogLevel.Information).withAutomaticReconnect([0, 0, 5000]).build(),
      point: null
    }
  },
  created() {
    this.$store.commit('setColors', this.colors)

    this.connection.on('login', r => {
      let obj = JSON.parse(r)
      this.$store.commit('env', obj.data.env)
      this.$store.commit('user', obj.data.user)
      this.showLoader = false
    })

    this.connection.on('onNotAuthentificated', user => {
      if (this.$store.state.user && this.$store.state.user.name === user) {
        window.close()
      }
    })

    this.connection.on('onLogout', user => {
      if (this.$store.state.user && this.$store.state.user.name === user) {
        window.close()
      }
    })

    this.connection.on('updateObject', r => this.$emitter.emit('updateObject', JSON.parse(r)))
    this.connection.on('deleteObject', r => this.$emitter.emit('deleteObject', JSON.parse(r)))
  },
  async mounted() {
    await this.connection.start()
  },
  computed: {
    caption() {
      return this.point ? `Точка учета: ${this.point.name}` : null
    },
    styleColors() {
      return this.$store.getters.styleColors
    }
  },
  methods: {
    onLoaded(point) {
      this.point = point
    }
  }
}
</script>
