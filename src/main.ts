import { createApp } from 'vue'
import App from './App.vue'
import { axios } from './plugins/axios'
import { store } from './plugins/store'
import mitt, { Emitter } from 'mitt'

// __webpack_public_path__ = window.props.baseUrl + 'js/sp/dist/'

type AppProps = {
  baseUrl: string
  timeout?: number
}

type Events = {
  updateObject: void
  deleteObject: void
}

declare global {
  interface Window {
    props: AppProps
  }
}

// declare module 'vue' {
//   interface ComponentCustomProperties {
//     $http: typeof axios
//     $emitter: Emitter<Events>
//     $store: typeof store
//   }
// }

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

import PropsComponent from './components/PropsComponent.vue'
import RecursiveNode from './components/Tree/RecursiveNode.vue'
import Spinner from './components/SpinnerComponent.vue'
import TransitionExpand from './components/Tree/TransitionExpand.vue'
import VButton from './components/Inputs/VButton.vue'

app.component('RecursiveNode', RecursiveNode).component('PropsComponent', PropsComponent).component('Spinner', Spinner).component('TransitionExpand', TransitionExpand).component('VButton', VButton)

app.mount('#app')

