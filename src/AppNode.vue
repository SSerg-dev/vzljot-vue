<template>
  <div class="detail-container">
    <h1 class="heading">{{ caption }}</h1>
    <node v-if="$store.state.user" v-bind="{ uuid, id }" @loaded="onLoaded" />
    <error />
    <spinner :show="!$store.state.user" :text="'Инициализация'" />
  </div>
</template>

<script>
import './assets/font.css'
import './assets/main.css'
import './assets/table.css'

import { v4 as uuidv4 } from 'uuid'

import Node from './components/Node/NodeComponent.vue'
import Error from './components/Error.vue'

export default {
  name: 'app',
  components: {
    Node,
    Error,
  },
  props: {
    baseUrl: String,
    colors: Object,
    id: Number,
  },
  data() {
    return {
      uuid: uuidv4(),
      connection: new signalR.HubConnectionBuilder()
        .withUrl(`${this.baseUrl}serviceHub`)
        .configureLogging(signalR.LogLevel.Information)
        .withAutomaticReconnect([0, 0, 5000])
        .build(),
      node: null,
    }
  },
  created() {
    this.$store.commit('setColors', this.colors)

    this.connection.on('login', (r) => {
      let obj = JSON.parse(r)
      this.$store.commit('env', obj.data.env)
      this.$store.commit('user', obj.data.user)
      this.showLoader = false
    })

    this.connection.on('onNotAuthentificated', (user) => {
      if (this.$store.state.user && this.$store.state.user.name === user) {
        window.close()
      }
    })

    this.connection.on('onLogout', (user) => {
      if (this.$store.state.user && this.$store.state.user.name === user) {
        window.close()
      }
    })
  },
  async mounted() {
    await this.connection.start()
  },
  computed: {
    caption() {
      return this.node ? `Объект учета: ${this.node.name}` : null
    },
    styleColors() {
      return this.$store.getters.styleColors
    },
  },
  methods: {
    onLoaded(node) {
      this.node = node
    },
  },
}
</script>
