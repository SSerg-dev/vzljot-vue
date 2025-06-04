<template>
  <div class="wrapper">
    <div class="app-wrapper">
      <header>
        <nav>
          <v-menus v-bind="header">
            <v-menu
              v-for="[k, v] in Object.entries(menus)"
              :key="k"
              v-bind="v"
              @clicked="menuClicked($event)"
              :style="currentMenu === v.name ? selectedColors : null"
            />
            <template #right>
              <v-menu
                v-if="notificationsCount"
                v-bind="{
                  name: 'notifications',
                  image: 'fas fa-envelope',
                  count: notificationsCount,
                }"
                @clicked="menuClicked($event)"
              />
              <v-menu
                v-if="$store.state.user"
                v-bind="{
                  name: 'user',
                  text: $store.state.user.name,
                  cursor: $store.state.user?.userRights.himselfUserEdit
                    ? 'pointer'
                    : 'default',
                }"
                @clicked="menuClicked($event)"
              />
              <v-menu
                v-if="$store.state.user"
                v-bind="{
                  name: 'logout',
                  image: 'fas fa-sign-out-alt',
                  text: 'Выход',
                }"
                @clicked="menuClicked($event)"
              />
            </template>
          </v-menus>
        </nav>
      </header>

      <main class="content-wrapper">
        <transition mode="out-in">
          <keep-alive v-if="$store.state.user">
            <component
              :is="component.name"
              v-bind="component.data"
              :key="component.key"
            />
          </keep-alive>
        </transition>
        <template v-if="!$store.state.user">
          <carousel :slides="slides" />
        </template>
        <template v-if="!state.authentificated">
          <login v-bind="{ connection }" @login="onLogin" />
        </template>
        <notification-panel />
      </main>
      <transition>
        <props-component
          v-if="popupData"
          :text="popupData.text"
          @close="onPopupClose()"
        >
          <component
            :is="popupData.component"
            v-bind="popupData.data"
            @fullNameChange="onUserEvent"
          />
        </props-component>
      </transition>
      <error />
      <spinner :show="showLoader" :text="loaderText" />
    </div>
    <app-footer />
  </div>
</template>
<script>
// import { inject } from 'vue'

import './assets/font.css'
import './assets/main.css'
import './assets/table.css'

import { asyncImport } from './plugins/api'

import Idle from './plugins/idle.js'

import Carousel from './components/AppCarousel.vue'
import AppFooter from './components/AppFooter.vue'
import Error from './components/Error.vue'
import Info from './components/AppInfo.vue'
import Login from './components/LoginItem.vue'
import NotificationPanel from './components/NotificationPanel.vue'
import VMenu from './components/Menu/VMenu.vue'
import VMenus from './components/Menu/VMenus.vue'

export default {
  name: 'app',
  components: {
    AppFooter,
    Carousel,
    Error,
    ExtraLayout: asyncImport(() =>
      import('./components/Layouts/ExtraLayout.vue')
    ),
    Info,
    VueMap: asyncImport(() => import('./components/Map/Map.vue')),
    SystemMessages: asyncImport(() =>
      import('./components/SystemMessages/SystemMessages.vue')
    ),
    Login,
    NotificationPanel,
    TreeLayout: asyncImport(() =>
      import('./components/Layouts/TreeLayout.vue')
    ),
    UserComponent: asyncImport(() =>
      import('./components/Users/UserComponent.vue')
    ),
    VMenu,
    VMenus,
  },
  props: {
    header: Object,
    colors: Object,
    slides: Array,
    timeout: {
      type: Number,
      default: 0,
    },
  },
  data() {
    const baseUrl =
      window.location.pathname.slice(-1) === '/'
        ? window.location.pathname.slice(0, window.location.pathname.length - 1)
        : window.location.pathname
        
        return {
      connection: new window.signalR.HubConnectionBuilder()
        .withUrl(`${baseUrl}/serviceHub`)
        .configureLogging(window.signalR.LogLevel.Information)
        .withAutomaticReconnect([0, 0, 5000])
        .build(),
      idle:
        this.timeout === 0 ? null : new Idle(this.timeout, () => this.logout()),
      loaderText: '',
      showLoader: true,
      currentMenu: null,
      menus: [],
      popupData: null,
      logging: false,
      notificationsCount: 0,
      state: {
        authentificated: false, 
      },
      siworker: new Worker(
        new URL('./plugins/workers/si.worker', import.meta.url)
      ),
    }
  },
  created() {
    this.$store.commit('setColors', this.colors)

    this.siworker.onmessage = (r) => {
      if (r.data.event === 'notifications') {
        this.notificationsCount = r.data.count
      } else {
        this.$emitter.emit('si', r.data)
      }
    }

    this.connection.onclose(async () => {
      await this.start()
    })

    this.connection.onreconnecting(() => {
      this.wait('Подключение к веб-серверу')
      if (this.idle) {
        this.idle.stop()
      }
    })

    this.connection.onreconnected(() => {
      this.connection.invoke('reconnect')
    })

    this.connection.on('authentificated', (value) => {
      this.state.authentificated = value

      if (value) {
        this.wait('Инициализация')
        
      } else {
        this.showLoader = false
      }
    })

    this.connection.on('login', (r) => {
      if (r) {
        const data = JSON.parse(r)

        for (let prop in data.data) {
          this.$store.commit(prop, data.data[prop])
        }

        if (data.type === 1) {
          this.$store.commit('notification', data)
        } else {
          if (this.$store.state.vsp.isOpened === false) { 
            this.onVspClosed()
          } else {
            this.onConnected()
          }
        }
      }

      this.showLoader = false
    })

    this.connection.on('vspStateChange', (r) => {
      this.$store.commit('vsp', r)

      if (r.isOpened === false) {
        this.onVspClosed()
      } else {
        this.ready()
      }
    })
    this.connection.on('updateObject', (r) => {
      this.$emitter.emit('updateObject', JSON.parse(r))
    })
    this.connection.on('deleteObject', (r) =>
      this.$emitter.emit('deleteObject', JSON.parse(r))
    )
    this.connection.on('si', (r) => this.siworker.postMessage(r))
    this.connection.on('onNotAuthentificated', (user) => {
      if (this.$store.state.user && this.$store.state.user.name === user) {
        this.logout()
      }
    })

    this.connection.on('onLogout', () => this.onLogout())
    this.connection.on('reconnected', () => this.ready())
    this.connection.on('notAvailable', (r) => this.onNotAvailable(r))
    this.connection.on('updateWeather', (r) =>
      this.$store.commit('weather', JSON.parse(r))
    )
    this.connection.on('message', (r) =>
      this.$emitter.emit('message', JSON.parse(r))
    )
  },
  computed: {
    component() {
      let component = {
        name: 'carousel',
        key: 'carousel',
        data: { slides: this.slides },
      }

      if (this.currentMenu && this.$store.state.vsp.isOpened) {
        switch (this.currentMenu) {
          case 'info':
            component = {
              name: 'info',
            }
            break
          case 'points':
            component = {
              name: 'tree-layout',
              key: 'points',
              data: {
                searchData: {
                  settings: [
                    'balanceGroup',
                    'pointGroup',
                    'pointList',
                    'address',
                    'node',
                    'point',
                  ],
                  url: 'tree/findObjects',
                },
                treeData: {
                  nodeTypes: [
                    'pointLists',
                    'pointList',
                    'points',
                    'address',
                    'node',
                    'point',
                    'balanceGroups',
                    'balanceGroup',
                    'pointGroups',
                    'pointGroup',
                  ],
                  urls: {
                    init: 'tree/getPointTree',
                    load: 'tree/getChildren',
                    loadAll: 'tree/getAllChildren',
                    search: 'tree/getParents',
                  },
                },
              },
            }
            break
          case 'equips':
            component = {
              name: 'tree-layout',
              key: 'equips',
              data: {
                searchData: {
                  settings: [
                    'equipList',
                    'systemNode',
                    'groupConnection',
                    'equip',
                  ],
                  url: 'tree/findObjects',
                },
                treeData: {
                  nodeTypes: [
                    'equipLists',
                    'equipList',
                    'equips',
                    'systemNode',
                    'groupConnection',
                    'equip',
                    'set',
                    'symbolSchema',
                  ],
                  urls: {
                    init: 'tree/getEquipTree',
                    load: 'tree/getChildren',
                    loadAll: 'tree/getAllChildren',
                    search: 'tree/getParents',
                  },
                },
              },
            }
            break
          case 'extra':
            component = {
              name: 'extra-layout',
            }
            break
          case 'map':
            component = {
              name: 'vue-map',
              data: {
                userMap: this.$store.state.user.map,
              },
            }
            break
        }
      }
      return component
    },
    selectedColors() {
      return {
        color: this.$store.state.colors.fill,
        'background-color': this.$store.state.colors.text,
      }
    },
  },
  async mounted() {
    await this.start()
  },
  watch: {
    '$store.state.user.notification.notificationsCount'(value) {
      this.notificationsCount = value
    },
    notificationsCount(value, oldVal) {
      if (
        this.$store.state.user &&
        this.$store.state.user.notification.sound &&
        value > oldVal
      ) {
        const audio = document.querySelector('audio')
        audio.muted = false
        let promise = audio.play()
        if (promise !== undefined) {
          promise.catch((error) => {
            console.log('audio err', error)
          })
        }
      }
    },
  },
  methods: {
    async start() {
      try {
        this.wait('Подключение к веб-серверу')
        await this.connection.start()

        this.$store.commit('connection', this.connection)
      } catch (error) {
        console.log('start', error)
        setTimeout(this.start, 0)
      }
    },
    onLogin() {
      this.state.authentificated = true

      if (this.$store.state.vsp.isOpened === false) {
        this.onVspClosed()
      } else {
        this.onConnected()
      }
    },
    onLogout() {
      this.state.authentificated = false
      this.$store.commit('user', null)
      this.$store.state.vsp.isOpened = false
      this.popupData = null
      this.currentMenu = null
      this.notificationsCount = 0
      this.menus = []
      if (this.idle) {
        this.idle.stop()
      }
    },
    onPopupClose() {
      this.popupData = null
    },
    onUserEvent(value) {
      this.popupData.text = `Пользователь: ${value}`
    },
    menuClicked(name) {
      switch (name) {
        case 'info':
          this.onInfo(true)
          this.currentMenu = name
          break
        case 'points':
          this.onPoint(true)
          this.onEquip(false)
          this.currentMenu = name
          break
        case 'equips':
          this.onPoint(false)
          this.onEquip(true)
          this.currentMenu = name
          break
        case 'extra':
        case 'map':
          this.onInfo(false)
          this.onEquip(false)
          this.currentMenu = name
          this.$emitter.emit('preserver-component:display', 'none')
          break
        case 'notifications':
          this.popupData = {
            text: 'Уведомления:',
            component: 'systemMessages',
          }
          break
        case 'user':
          if (this.$store.state.user?.userRights.himselfUserEdit) {
            this.popupData = {
              text: `Пользователь: ${this.$store.state.user.name}`,
              component: 'userComponent',
              data: {
                id: this.$store.state.user.id,
                type: 30,
              },
            }
          }
          break
        case 'logout':
          this.logout()
          break
      }
    },
    onNotAvailable(message) {
      this.$store.commit('error', {
        message: message,
      })
      this.showLoader = false
    },
    onVspClosed() {
      this.wait('Ожидание сервера приложений')
      if (this.idle) {
        this.idle.stop()
      }
    },
    onConnected() {
      this.menus = []

      if (this.$store.state.user.menus.info)
        this.menus.push({ name: 'info', text: 'Информация' })
      if (this.$store.state.user.menus.points)
        this.menus.push({ name: 'points', text: 'Точки учета' })
      if (this.$store.state.user.menus.equips)
        this.menus.push({ name: 'equips', text: 'Приборы' })
      if (this.$store.state.user.menus.extra)
        this.menus.push({ name: 'extra', text: 'Дополнительно' })
      if (this.$store.state.user.menus.map)
        this.menus.push({ name: 'map', text: 'Карта' })

      if (this.menus.length > 0) {
        this.currentMenu = this.menus[0].name
      }

      this.ready()
    },
    ready() {
      this.$store.commit('error', null)
      this.showLoader = false
      if (this.idle) {
        this.idle.start()
      }
    },
    wait(text) {
      this.loaderText = text + '...'
      this.showLoader = true
    },
    async logout() {
      try {
        await this.$http.post('account/logout')
        this.onLogout()
      } catch (error) {
        this.$store.commit('error', error.response.data)
      }
    },
    onInfo(flag) {
      let options = {
        isInfoChanged: flag,
      }
      this.$emitter.emit('info:open', options)
    },
    onPoint(flag) {
      let options = {
        isPointChanged: flag,
      }
      this.$emitter.emit('equip:open', options)
    },
    onEquip(flag) {
      let options = {
        isEquipChanged: flag,
      }
      this.$emitter.emit('equip:open', options)
    },
  }, // end methods
}
</script>

<style scoped>
.wrapper {
  display: grid;
  grid-template-rows: 1fr max-content;
  overflow: auto;
  flex: 1;
}

.app-wrapper {
  position: relative;
  display: grid;
  grid-template-rows: max-content 1fr;
  overflow: auto;
  padding: 2px;
}

.content-wrapper {
  position: relative;
  padding: 2px 2px 0;
  display: grid;
  overflow: auto;
}
</style>
