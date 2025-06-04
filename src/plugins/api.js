import { defineAsyncComponent, h } from 'vue'
import { store } from '@/store/store'

import { getSystemImage } from '@/classes/api/common.functions'

export const asyncImport = (importPromise) => {
  return defineAsyncComponent({
    loader: importPromise,
    loadingComponent: {
      render() {
        return h(
          'div',
          { class: 'loading-component' },
          'Ожидание компонента...'
        )
      },
    },
    errorComponent: {
      render() {
        return h(
          'div',
          { class: 'loading-component' },
          'Ошибка ожидания компонента'
        )
      },
    },
    delay: 200,
    timeout: 60000,
  })
}

export function getImage(item) { 
  switch (store.state.env.itemTypes[item.type].type) {
    case 'reportTasks':
      return 'fas fa-file-alt icon'
    case 'equipLists':
    case 'pointLists':
    case 'equips':
    case 'points':
    case 'balanceGroups':
    case 'pointGroups':
      return 'fas fa-folders icon'
    case 'pointList':
      return 'fas fa-list-alt icon'
    case 'equipList':
      return 'fas fa-list-alt icon'
    case 'systemNode':
      return 'fas fa-laptop icon'
    case 'groupConnection':
      return 'fas fa-folder icon'
    case 'equip':
      return Object.prototype.hasOwnProperty.call(item, 'connectionGroupType')
        ? store.state.env.connectionGroupTypes[item.connectionGroupType].image
        : 'fas fa-tablet-alt'
    case 'address':
      return 'fas fa-folder icon'
    case 'node':
      return `fas ${store.state.env.nodeTypes[item.nodeType].image} icon`
    case 'point':
      return !store.state.env.pointTypes[item.systemType]?.image
        ? getSystemImage(item.systemType)
        : store.state.env.pointTypes[item.systemType]?.image
    case 'reportTask':
      return 'fas fa-file-alt icon'
    case 'balanceGroup':
      return 'fas fa-sitemap icon'
    case 'set':
    case 'setEquip':
      return `fas icon center fa-tasks-alt${
        store.state.env.setTypes[item.setType].type === 'equipGroup'
          ? ' sign-group'
          : ''
      }${item.availableForAll ? ' sign-link' : ''}`
    case 'sets':
      return 'fas fa-tasks-alt icon'
    case 'symbolSchema':
      return `fas icon center fa-project-diagram  ${
        store.state.env.setTypes[item.setType].type === 'equipGroup'
          ? 'sign-group'
          : ''
      }`
    case 'symbolSchemas':
      return 'fas fa-project-diagram icon'
    case 'setParam':
      return `fas fa-cog icon set-param-${
        store.state.env.setParamProperties[item.property]
          ? store.state.env.setParamProperties[item.property].type
          : store.state.env.setParamProperties[0].type
      }`
    case 'userGroups':
      return 'fas fa-users icon'
    case 'user':
    case 'users':
      return 'fas fa-user icon'
    case 'pointGroup':
      return 'fas fa-brackets-square icon'
    case 'certificate':
      return `fas fa-certificate icon${item.isLocal ? '' : ' color-dodgerblue'}`
    case 'customProps':
    case 'customProp':
      return 'fas fa-brackets-curly icon'
    case 'report':
    case 'equipForm':
    case 'pointForm':
      return 'fas fa-file-alt icon'
    case 'systemProps':
      return 'fas fa-cog icon'
    case 'notification':
      return 'fas fa-envelope icon'
    case 'equipTypes':
    case 'equipType':
      return 'fas fa-tablet-alt icon'
    case 'import':
      return 'fas fa-file-import icon'
  }
  return 'equip-root'
}

export let matchType = (types) => {
  let obj = {}
  if (types) {
    Object.keys(types).map((key) => {
      obj[types[key].type] = parseInt(key)
    })
  }
  return obj
}

export function hexToRgb(color) {
  if (color.charAt && color.charAt(0) === '#') {
    color = color.slice(1)
  }
  let hex = parseInt(color, 16)
  return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255]
}

export function rgbToHex(r, g, b) {
  return `#${r.toString(16).padStart(2, '0')}${g
    .toString(16)
    .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function rgbToHsl(r, g, b) {
  r /= 255
  g /= 255
  b /= 255
  let max = Math.max(r, g, b)
  let min = Math.min(r, g, b)
  let middle = (max + min) / 2
  let h = middle
  let s = middle
  let l = middle

  if (max === min) {
    h = s = 0 // achromatic
  } else {
    var d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }
  return [h, s, l]
}

function hslToRgb(h, s, l) {
  let r, g, b

  function hue2rgb(p, q, t) {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  if (s === 0) {
    r = g = b = l // achromatic
  } else {
    let q = l < 0.5 ? l * (1 + s) : l + s - l * s
    let p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

export function lightenDarken(color, amount) {
  amount = amount === 0 ? 0 : amount || 10
  let [h, s, l] = rgbToHsl(...hexToRgb(color))
  l += amount / 100
  let [r, g, b] = hslToRgb(...[h, s, Math.min(Math.max(0, l), 1)])
  return `#${r.toString(16).padStart(2, '0')}${g
    .toString(16)
    .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

export const getISODateTime = (value) => {
  if (value instanceof Date) {
    return `${value.getFullYear()}-${('0' + (value.getMonth() + 1)).slice(
      -2
    )}-${('0' + value.getDate()).slice(-2)}T${('0' + value.getHours()).slice(
      -2
    )}:${('0' + value.getMinutes()).slice(-2)}:${(
      '0' + value.getSeconds()
    ).slice(-2)}`
  }
  return value
}

export function* colorGenerator() {
  let colors = [
    'ff0000',
    '7b68ee',
    'ff8c00',
    '1e90ff',
    'ffd700',
    '40e0d0',
    'ff00ff',
    '0000cd',
    'ff1493',
    '00ff7f',
    'a52a2a',
    '32cd32',
  ]
  var index = 0
  while (true) {
    if (index === colors.length) {
      index = 0
    }
    yield '#' + colors[index++]
  }
}
