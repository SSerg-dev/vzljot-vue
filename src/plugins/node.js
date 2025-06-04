import { v4 as uuidv4 } from 'uuid'
import { store } from '@/store/store'

import { getImage } from './api.js'

export class Node {
  constructor(obj, parent = null, el = null) {
    this.uuid = uuidv4()

    this.id = obj.id
    this.type = obj.type
    this.text = obj.text
    this.state = obj.state
    this.isFolder = obj.isFolder
    this.children = []
    this.expanded = obj.children && obj.children.length > 0
    this.childrenLoaded = obj.children && obj.children.length > 0
    this.selected = false
    this.parent = parent
    this.$el = el

    if (obj.children && obj.children.length > 0) {
      this.children = obj.children.map((child) => new Node(child, this, el))
    }

    updateNodeProps(this, obj)
  }
}

Node.prototype.updateState = function (state) {
  if (state !== this.state) {
    let domBody = this.domBody()
    let firstNode = domBody.childNodes[0]
    if (store.state.env.itemTypes[this.type].type === 'point') {
      firstNode.classList.remove(firstNode.classList[0])
      firstNode.classList.add(store.state.env.statuses[state].image)
    } else {
      if (
        firstNode.classList.contains(store.state.env.statuses[this.state].class)
      ) {
        firstNode.classList.remove(store.state.env.statuses[this.state].class)
        firstNode.classList.add(store.state.env.statuses[state].class)
      }
    }
    this.state = state
  }
}

Node.prototype.update = function (obj) {
  let state = this.state
  this.text = obj.text
  this.isFolder = obj.isFolder

  let domBody = this.domBody()
  if (state !== obj.state) {
    this.state = obj.state
    let firstNode = domBody.childNodes[0]
    if (store.state.env.itemTypes[this.type].type === 'point') {
      firstNode.classList.remove(firstNode.classList[0])
      firstNode.classList.add(store.state.env.statuses[this.state].image)
    } else {
      if (firstNode.classList.contains(store.state.env.statuses[state].class)) {
        firstNode.classList.remove(store.state.env.statuses[state].class)
        firstNode.classList.add(store.state.env.statuses[this.state].class)
      }
    }
  }

  if (store.state.env.itemTypes[this.type].type === 'node') {
    let firstNode = domBody.childNodes[0]
    if (
      firstNode.classList.contains(
        store.state.env.nodeTypes[this.nodeType].image
      )
    ) {
      firstNode.classList.remove(store.state.env.nodeTypes[this.nodeType].image)
      firstNode.classList.add(store.state.env.nodeTypes[obj.nodeType].image)
    }
  }

  for (let i = 0; i < domBody.childNodes.length; i++) {
    if (domBody.childNodes[i].nodeType === 3) {
      domBody.childNodes[i].nodeValue = this.text
    }
  }

  updateNodeProps(this, obj)
}

Node.prototype.getId = function () {
  return `${this.type}_${this.id}`
}

Node.prototype.domToggle = function () {
  return this.$el.querySelector(`.node[id="${this.getId()}"] > .toggle`)
}

Node.prototype.domBody = function () {
  return this.$el.querySelector(`.node[id="${this.getId()}"] > .body`)
}

Node.prototype.domChildren = function () {
  return this.$el.querySelectorAll(`.node[id="${this.getId()}"] > .node`)
}

Node.prototype.domNode = function () {
  let element = this.$el.querySelector(`.node[id="${this.getId()}"]`)
  return element === null ? this.$el : element
}

Node.prototype.select = function (value) {
  let body = this.domBody()
  if (body) {
    value ? body.classList.add('selected') : body.classList.remove('selected')
  }
  this.selected = value
}

Node.prototype.toggle = function (value) {
  let toggle = this.domToggle()
  if (toggle) {
    value ? toggle.classList.add('opened') : toggle.classList.remove('opened')
  }
  let children = this.domChildren()
  for (let i = 0; i < children.length; i++) {
    value
      ? children[i].classList.remove('hidden')
      : children[i].classList.add('hidden')
  }
  this.expanded = value
}

Node.prototype.clear = function () {
  this.children = []
  this.toggle(false)

  let children = this.domChildren()
  for (let i = 0; i < children.length; i++) {
    children[i].parentNode.removeChild(children[i])
  }
  this.expanded = false
  this.childrenLoaded = false
}

Node.prototype.delete = function () {
  let domNode = this.domNode()
  domNode.parentNode.removeChild(domNode)

  this.parent.children.splice(this.parent.children.indexOf(this), 1)
  // console.log('delete', this, this.parent, this.parent.children.length)
  if (this.parent.children.length === 0) {
    this.parent.setFolder(false)
  }
}

Node.prototype.setFolder = function (value) {
  let toggle = this.domToggle()
  let domBody = this.domBody()
  if (value) {
    if (!toggle) {
      domBody.insertAdjacentHTML(
        'beforebegin',
        `<div class="toggle fas ${this.expanded ? 'opened' : ''}"></div>`
      )
      domBody.classList.remove('nofolder')
    }
  } else {
    domBody.classList.add('nofolder')
    if (toggle) toggle.parentNode.removeChild(toggle)
    if (this.expanded && this.children.length === 0) {
      this.expanded = false
      this.toggle(false)
    }
    this.childrenLoaded = false
    // console.log('setFolder', this.childrenLoaded)
  }

  this.isFolder = value
}

Node.prototype.createChild = function (child) {
  let arr = []
  this.children.push(child)
  createHtml([child], arr, this)
  let index = sortedChildren(this.children).indexOf(child)
  if (index >= 0) {
    let children = this.domChildren()
    if (index < children.length) {
      children.item(index).insertAdjacentHTML('beforebegin', arr.join(''))
    } else {
      this.domNode().insertAdjacentHTML('beforeend', arr.join(''))
    }
  }
}

Node.prototype.createChildren = function (children) { 
  // let s = window.performance.now()

  let arr = []
  this.children = children
  createHtml(children, arr, this)
  this.domNode().insertAdjacentHTML('beforeend', arr.join(''))
  this.childrenLoaded = true

  // console.log('insert html', Math.round(window.performance.now() - s) + ' ms')
}

Node.prototype.canAdd = function () {
  switch (store.state.env.itemTypes[this.type].type) {
    case 'equipLists':
      return store.state.user.userRights.equipListEdit // || store.state.user.userRights.equipList
    case 'pointGroups':
      return store.state.user.userRights.measureSchemeGroupEdit
    case 'balanceGroups':
      return store.state.user.userRights.balanceGroupEdit
    case 'pointLists':
      return store.state.user.userRights.measureSchemeListEdit // || store.state.user.userRights.measureSchemeList
    case 'systemNode':
    case 'groupConnection':
      return store.state.user.userRights.equipEditFull
    case 'equip':

      return (
        store.state.user.userRights.equipEditFull &&
        (this.parent
          ? store.state.env.itemTypes[this.parent.type].type !== 'equip'
          : true) &&
        (Object.prototype.hasOwnProperty.call(this, 'code')
          ? this.code === 'APS79' ||
            this.code === 'Vzljot_ASPD051A' ||
            this.code.indexOf('SPT96') !== -1 ||
            this.code.indexOf('SPG76') !== -1
          : false)
      )
    case 'node':
    case 'address':
    case 'points':
      return store.state.user.userRights.measureSchemeEditFull
    default:
      return false
  }
}

Node.prototype.canDelete = function () {
  switch (store.state.env.itemTypes[this.type].type) {
    case 'equipList':
      return store.state.user.userRights.equipListEdit
    case 'groupConnection':
    case 'equip':
      return store.state.user.userRights.equipEditFull
    case 'pointList':
      return store.state.user.userRights.measureSchemeListEdit
    case 'address':
    case 'node':
    case 'point':
      return store.state.user.userRights.measureSchemeEditFull
    case 'balanceGroup':
      return store.state.user.userRights.balanceGroupEdit
    case 'pointGroup':
      return store.state.user.userRights.measureSchemeGroupEdit
    default:
      return false
  }
}

export function createHtml(nodes, arr, parent) {
  sortedChildren(nodes).forEach((node) => {
    let isFolder = (node.children && node.children.length) || node.isFolder
    arr.push(
      `<div class="node${
        parent && parent.childrenLoaded && !parent.expanded ? ' hidden' : ''
      }" id="${node.getId()}">`
    )
    if (isFolder) {
      arr.push(
        `<div class="toggle fas ${node.expanded ? 'opened' : ''}"></div>`
      )
    }

    arr.push(`<div class="body ${isFolder ? '' : 'nofolder'}">`)
    if (
      store.state.env.itemTypes[node.type].type === 'point' &&
      store.state.env.statuses[node.state].image !== ''
    ) {
      arr.push(
        `<div class="${store.state.env.statuses[node.state].image}"></div>`
      )
    }
    arr.push(
      `<div class="${getImage(node)} ${
        store.state.env.statuses[node.state].class
      }"></div>${node.text}</div>`
    )
    createHtml(node.children, arr, node)
    arr.push('</div>')
  })
}

function sortedChildren(children) {
  return children.sort((a, b) => {
    if (a.type === b.type) {
      return store.state.collator.compare(a.text, b.text)
    }
    if (a.type < b.type) return -1
    if (a.type > b.type) return 1
  })
}

function updateNodeProps(node, obj) {
  if (Object.prototype.hasOwnProperty.call(obj, 'systemType'))
    node.systemType = obj.systemType
  if (Object.prototype.hasOwnProperty.call(obj, 'nodeType'))
    node.nodeType = obj.nodeType
  if (Object.prototype.hasOwnProperty.call(obj, 'code')) node.code = obj.code
  if (Object.prototype.hasOwnProperty.call(obj, 'addressType'))
    node.addressType = obj.addressType
  if (Object.prototype.hasOwnProperty.call(obj, 'hasSet'))
    node.hasSet = obj.hasSet
  if (Object.prototype.hasOwnProperty.call(obj, 'hasEquipEvents'))
    node.hasEquipEvents = obj.hasEquipEvents
  if (Object.prototype.hasOwnProperty.call(obj, 'hasSetDataColdWater'))
    node.hasSetDataColdWater = obj.hasSetDataColdWater
  if (Object.prototype.hasOwnProperty.call(obj, 'hasColdWater'))
    node.hasColdWater = obj.hasColdWater
  if (Object.prototype.hasOwnProperty.call(obj, 'hasTimeSync'))
    node.hasTimeSync = obj.hasTimeSync
  if (Object.prototype.hasOwnProperty.call(obj, 'connectionGroupType'))
    node.connectionGroupType = obj.connectionGroupType
  if (Object.prototype.hasOwnProperty.call(obj, 'reportTypes'))
    node.reportTypes = obj.reportTypes
}
