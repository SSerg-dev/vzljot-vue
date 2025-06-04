<template>
  <div class="component-detail">
    <symbol-schema v-if="$store.state.user && initialized" v-bind="symbolSchema" />
    <error />
    <notification-panel />
  </div>
</template>

<script>
import './assets/font.css'
import './assets/main.css'
import './assets/table.css'

import SymbolSchema from './components/SymbolSchema/SymbolSchema.vue'
import NotificationPanel from './components/NotificationPanel.vue'
import Error from './components/Error.vue'

export default {
  components: {
    SymbolSchema,
    NotificationPanel,
    Error
  },
  props: {
    symbolSchema: Object,
    colors: Object
  },
  data() {
    return {
      connection: new signalR.HubConnectionBuilder()
        .withUrl(`${props.baseUrl}serviceHub`)
        .configureLogging(signalR.LogLevel.Information)
        .withAutomaticReconnect([0, 0, 5000])
        .build(),
      initialized: false
    }
  },
  created() {
    this.$store.commit('setColors', this.colors) 

    this.connection.on('message', r => this.$emitter.emit('message', JSON.parse(r)))

    this.connection.on('login', r => {
      let obj = JSON.parse(r)
      this.$store.commit('env', obj.data.env)
      this.$store.commit('user', obj.data.user)
      if (this.$store.state.user) {
        if (!this.initialized) {
          this.initialized = true
        }
      }
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
  },
  async mounted() {
    await this.connection.start()
  },
  computed: {
    styleColors() {
      return this.$store.getters.styleColors
    }
  }
}
</script>
