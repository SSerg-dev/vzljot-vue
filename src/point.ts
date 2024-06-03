import { createApp } from 'vue'
import App from './AppPoint.vue'
import { axios } from './plugins/axios'
import { store } from '@/store/store'
import mitt, { Emitter } from 'mitt'
import { Events } from '@/events'

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $http: typeof axios
    $emitter: Emitter<Events>
    $store: typeof store
  }
}

const app = createApp(App, (<Window>window).props)

app.config.globalProperties.$http = axios

const emitter = mitt<Events>()

app.provide('emitter', emitter)

app.config.globalProperties.$emitter = emitter

app.use(store)

import Focus from './directives/focus'

app.directive('focus', Focus)

import SpinnerComponent from './components/SpinnerComponent.vue'
import VButton from './components/Inputs/VButton.vue'

app.component('VButton', VButton).component('Spinner', SpinnerComponent)

app.mount('#app')
