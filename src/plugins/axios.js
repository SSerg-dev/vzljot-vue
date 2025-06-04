import Axios from 'axios'

export const axios = Axios.create({
  headers: {
    'X-Requested-With': 'axios'
  }
})

axios.interceptors.request.use(
  config => {
    config.url = `${window.props.baseUrl}${config.url}`
    config.ts = performance.now()

    const method = config.method.toLowerCase()
    if (method === 'delete' || method === 'get') {
      config.paramsSerializer = params => serialize(params)
    }

    const date = new Date()
    console.log(`Старт: ${date.toLocaleString()} ${date.getMilliseconds()}, url: ${config.url}`)

    return config
  },
  error => {
    // console.log('error request', error)
    return Promise.reject(error)
  }
)

axios.interceptors.response.use(
  response => {
    const date = new Date()
    console.log(`Финиш: ${date.toLocaleString()} ${date.getMilliseconds()}, url: ${response.config.url}, время выполнения: ${Math.round(Number(performance.now() - response.config.ts)) / 1000}с.`)
    return response
  },
  error => {
    // console.log('error response', error.response)
    return Promise.reject(error)
  }
)

const serialize = obj => {
  return Object.entries(obj).reduce((acc, [k, v], index) => {
    if (Array.isArray(v)) {
      return `${acc}${index === 0 ? '' : `&`}${v.map(r => `${k}=${r}`).join('&')}`
    } else {
      return `${acc}${index === 0 ? '' : `&`}${k}=${v}`
    }
  }, '')
}
