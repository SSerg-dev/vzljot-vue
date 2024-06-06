import { h, render } from 'vue'
import ToastContainer from '@/plugins/toast/ToastContainer.vue'

export const ToastPlugin = {
  install(app, options = {}) {
    const container = document.createElement('date-toast')
    container.style.display = 'none'

    document.body.appendChild(container)

    const vnode = h(ToastContainer, options)
    render(vnode, container)

    const instance = vnode.component.proxy

    if (instance && instance.addToast) {
      app.config.globalProperties.$toast = {
        show(message, duration = 3000) {
          instance.addToast(message, duration)
        },
      }
    } else {
      console.error('addToast method is not available')
    }

    if (app.config.globalProperties.$emitter) {
      app.config.globalProperties.$emitter.on(
        'preserver-component:display',
        (display) => {
          container.style.display = display
        }
      )
    } else {
      console.error('$emitter is not available')
    }
  },
}
