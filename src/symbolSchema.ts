import { createApp } from 'vue'
import App from './AppSymbolSchema.vue'
import { axios } from './plugins/axios'
import { store } from '@/store/store'
import mitt from 'mitt'

// __webpack_public_path__ = window.props.baseUrl + 'js/sp/dist/'

const app = createApp(App, (<Window>window).props)

app.config.globalProperties.$http = axios
app.config.globalProperties.$emitter = mitt()

app.use(store)

import Focus from './directives/focus'

app.directive('focus', Focus)

import SpinnerComponent from './components/SpinnerComponent.vue'
import VButton from './components/Inputs/VButton.vue'

app
  .component('VButton', VButton)
  .component('Spinner', SpinnerComponent)

app.mount('#app')
