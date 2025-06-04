<template>
  <div class="layout" :style="layoutStyle">
    <section class="tree" v-show="show">
      <search-component
        v-if="searchData"
        v-bind="searchData"
        @changed="search"
      />
      <tree-component
        :data="treeData"
        @nodeSelect="nodeSelect"
        ref="tree"
        @create="onCreateClick"
        @delete="onDeleteClick"
      />
      <div
        v-show="show"
        @click="showButtonClick"
        class="hide-button fas fa-chevron-left not-selectable"
      />
    </section>
    <div class="splitter" v-show="show" @mousedown="mousedown" />
    <section class="content">
      <h1 class="heading">
        <span class="heading-icon-wrapper">
          <div
            v-if="currentNode"
            :class="`heading-icon ${getImage(currentNode)} ${
              currentNode.hasOwnProperty('state')
                ? $store.state.env.statuses[currentNode.state].class
                : ''
            }`"
          />
        </span>
        <transition name="heading-fade" mode="out-in">
          <div v-if="currentNode">
            <span :key="`t${currentNode.type}`">{{
              currentCaption === ''
                ? currentTypeText
                : currentTypeText === ''
                ? ''
                : currentTypeText + ': '
            }}</span>
            <span :key="`c${currentCaption}`">{{ currentCaption }}</span>
          </div>
        </transition>
      </h1>
      <component
        v-if="component"
        :is="component.name"
        v-bind="component.data"
        :key="component.key"
      />
      <div
        v-show="!show"
        @click="showButtonClick"
        class="show-button fas fa-chevron-right not-selectable"
      />
    </section>
    <transition>
      <wizard
        v-if="wizard"
        v-bind="wizard"
        @cancel="cancelWizard"
        @end="onWizardEnd"
      />
    </transition>
  </div>
</template>

<script>
import { store } from '@/store/store'
import { asyncImport, matchType, getImage } from '../../plugins/api.js'

import { Equip } from '@/classes/equip'
import { GroupConnection } from '@/classes/groupConnection'
import { Point } from '../../classes/point'

import TabsComponent from '../TabsComponent.vue'
import TreeComponent from '../Tree/TreeComponent.vue'
import SearchComponent from '../SearchComponent.vue'

// import { safeStringify } from '@/utils/common.functions.js'

function getCaption(node) {
  const type = store.state.env.itemTypes[node.type].type

  if (type === 'address') {
    return getAddress(node)
  } else if (
    [
      'balanceGroups',
      'pointGroups',
      'equipLists',
      'pointLists',
      'equips',
      'points',
    ].includes(type)
  ) {
    return null
  }

  return node.text
}

function getAddress(node) {
  if (!node) return ''
  if (store.state.env.itemTypes[node.type].type === 'address') {
    var parent = getAddress(node.parent)
    if (parent === '') return node.text
    else return parent + ', ' + node.text
  }
  return ''
}

const wizardDelete = (node) => {
  return {
    name: 'remove',
    component: {
      text: 'Удаление:',
      component: 'message',
      data: {
        text: `Вы действительно хотите удалить объект: ${store.state.env.itemTypes[
          node.type
        ].text.toLowerCase()} '${getCaption(node)}'?`,
      },
    },
  }
}

const wizardCreate = async (http, node) => {
  const itemType = store.state.env.itemTypes[node.type].type
  try {
    if (itemType === 'equip' || itemType === 'groupConnection') {
      return {
        name: 'create',
        component: {
          name: 'equip',
          text: 'Создание прибора:',
          component: 'equipDetail',
          data: { equip: new Equip({ parentId: node.id, type: node.type }) },
        },
      }
    } else if (itemType === 'systemNode') {
      const getType = (type) =>
        Object.values(store.state.env.itemTypes).find((r) => r.type === type)
      const types = ['equip', 'groupConnection'].map((r) => getType(r))

      return {
        name: 'create',
        component: {
          text: 'Выберите тип объекта:',
          component: 'selector-option',
          event: 'selectionChanged',
          data: {
            options: types,
            defaultOption: types[0],
          },
          next(data) {
            return {
              name: 'create',
              text: `Создание ${data === 'equip' ? 'прибора' : 'группы'}:`,
              component:
                data === 'equip' ? 'equipDetail' : 'groupConnectionDetail',
              data:
                data === 'equip'
                  ? { equip: new Equip({ parentId: node.id, type: node.type }) }
                  : { group: new GroupConnection({ systemNode: node.id }) },
              event: 'changed',
            }
          },
        },
      }
    } else if (itemType === 'node') {
      const { data } = await http.get('point/equips', {
        params: { nodeId: node.id },
      })

      return {
        name: 'create',
        component: {
          name: 'point',
          text: 'Создание точки учета:',
          component: 'point-props',
          event: 'changed',
          data: {
            point: new Point({ nodeId: node.id, equips: data }),
          },
        },
      }
    } else if (itemType === 'points' || itemType === 'address') {
      const values = {
        city: 'address-props',
        district: 'address-props',
        street: 'address-props',
        house: 'address-house-props',
        group: 'address-props',
        node: 'node-detail',
      }

      const addressTypes = matchType(store.state.env.addressTypes)
      const getType = (type) =>
        Object.values(store.state.env.addressTypes).find((r) => r.type === type)

      let types = ['city', 'district', 'street', 'house', 'group'].map((r) =>
        getType(r)
      )

      if (node.addressType === addressTypes.house) {
        types = ['group'].map((r) => getType(r))
      } else if (node.addressType === addressTypes.street) {
        types = ['house', 'group'].map((r) => getType(r))
      }

      if (
        store.state.user.userRights &&
        store.state.user.userRights.measureSchemeEdit
      ) {
        types.push(
          store.state.env.itemTypes[store.getters.reversedItemTypes['node']]
        )
      }

      return {
        name: 'create',
        component: {
          text: 'Выберите тип объекта:',
          component: 'selector-option',
          event: 'selectionChanged',
          data: {
            options: types,
            defaultOption: types[0],
          },
          next(data) {
            const obj = {
              addressId:
                store.state.env.itemTypes[node.type].type === 'points'
                  ? null
                  : node.id,
            }
            return {
              name: 'address',
              text: 'Создание:',
              component: values[data],
              event: 'change',
              data:
                data === 'node'
                  ? obj
                  : Object.assign(obj, { type: addressTypes[data] }),
            }
          },
        },
      }
    } else if (itemType === 'pointLists') {
      return {
        name: 'create',
        component: {
          text: 'Создание списка точек учета:',
          component: 'point-list-props',
          event: 'change',
        },
      }
    } else if (itemType === 'equipLists') {
      return {
        name: 'create',
        component: {
          text: 'Создание списка приборов:',
          component: 'equip-list-props',
          event: 'changed',
        },
      }
    } else if (itemType === 'balanceGroups') {
      return {
        name: 'create',
        component: {
          name: 'balanceGroup',
          text: 'Создание балансовой группы:',
          component: 'balance-group-detail',
          event: 'change',
          data: {
            mode: 'create',
          },
        },
      }
    } else if (itemType === 'pointGroups') {
      return {
        name: 'create',
        component: {
          name: 'pointGroup',
          text: 'Создание группы точек учета:',
          component: 'point-group-detail',
          event: 'change',
          data: {
            mode: 'create',
          },
        },
      }
    }
  } catch (error) {
    store.commit('error', error)
  }
}

export default {
  name: 'tree-layout',
  components: {
    SearchComponent,
    TabsComponent,
    TreeComponent,
    AddressComponent: asyncImport(() =>
      import('../Address/AddressComponent.vue')
    ),
    BalanceGroup: asyncImport(() => import('../BalanceGroup/BalanceGroup.vue')),
    EquipComponent: asyncImport(() => import('../Equip/EquipComponent.vue')),
    EquipsComponent: asyncImport(() => import('../Equip/EquipsComponent.vue')),
    Group: asyncImport(() => import('../GroupConnection/GroupConnection.vue')),
    Node: asyncImport(() => import('../Node/NodeComponent.vue')),
    PointComponent: asyncImport(() => import('../Point/PointComponent.vue')),
    PointsComponent: asyncImport(() => import('../Point/PointsComponent.vue')),
    PointGroup: asyncImport(() => import('../PointGroup/PointGroup.vue')),
    PointList: asyncImport(() => import('../PointList/PointList.vue')),
    SystemNode: asyncImport(() => import('../SystemNode/SystemNode.vue')),
    EquipList: asyncImport(() => import('../EquipList/EquipList.vue')),
    Wizard: asyncImport(() => import('../Wizard.vue')),
  },
  props: {
    searchData: {
      type: Object,
    },
    treeData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      show: true,
      currentNode: null,
      component: null,
      dragging: false,
      minWidth: 10,
      percent: 25,
      avatar: null,
      nodeToDelete: null,
      wizard: null,
      delay: 4000,
      isMessage: true,
    }
  },
  computed: {
    layoutStyle() {
      return this.show
        ? {
            'grid-template-columns': `${this.percent}% max-content 1fr`,
          }
        : null
    },
    itemTypes() {
      return this.$store.state.env.itemTypes
    },
    currentTypeText() {
      return !this.currentNode
        ? ''
        : this.itemTypes
        ? this.itemTypes[this.currentNode.type].text
        : ''
    },
    currentCaption() {
      return !this.currentNode ? '' : getCaption(this.currentNode)
    },
  },
  watch: {
    show: {
      handler() {
        this.$emitter.emit('resize')
      },
    },
  },
  mounted() {},
  methods: {
    cancelWizard() {
      this.wizard = null
    },
    onWizardEnd(value, name) { 
      this.wizard = null
      if (name === 'remove') {
        this.remove(this.nodeToDelete)
      }
    },
    onDeleteClick(node) {
      this.wizard = wizardDelete(node)
      this.nodeToDelete = node
    },
    nodeSelect(node) {
      let component = null
      if (node && this.$store.state.env) {
        const type = this.itemTypes[node.type].type
        if (type === 'points') {
          component = { name: 'points-component' }
        } else if (type === 'pointList') {
          component = {
            name: 'point-list',
            data: { uuid: node.uuid, id: node.id },
          }
        } else if (type === 'equipList') {
          component = {
            name: 'equip-list',
            data: { uuid: node.uuid, id: node.id },
          }
        } else if (type === 'address') {
          component = {
            name: 'address-component',
            data: {
              uuid: node.uuid,
              id: node.id,
              addressType: node.addressType,
            },
          }
        } else if (type === 'systemNode') {
          component = {
            name: 'system-node',
            data: { uuid: node.uuid, id: node.id },
          }
        } else if (type === 'node') {
          component = { name: 'node', data: { uuid: node.uuid, id: node.id } }
        } else if (type === 'point') {
          component = {
            name: 'point-component',
            data: { uuid: node.uuid, id: node.id, systemType: node.systemType },
          }
        } else if (type === 'pointGroup') {
          component = {
            name: 'point-group',
            data: { uuid: node.uuid, id: node.id },
          }
        } else if (type === 'balanceGroup') {
          component = {
            name: 'balance-group',
            data: { uuid: node.uuid, id: node.id },
          }
        } else if (type === 'groupConnection') {
          component = { name: 'group', data: { uuid: node.uuid, id: node.id } }
        } else if (type === 'equip') {
          component = {
            name: 'equip-component',
            data: {
              uuid: node.uuid,
              id: node.id,
              hasSet: node.hasSet,
              hasEquipEvents: node.hasEquipEvents,
              hasSetDataColdWater: node.hasSetDataColdWater,
              hasColdWater: node.hasColdWater,
              hasTimeSync: node.hasTimeSync,
              reportTypes: node.reportTypes,
            },
          }
        } else if (type === 'equips') {
          component = { name: 'equips-component' }
        } else {
          component = {}
        }

        component.key = `${node.type}_${node.id}`
      }
      this.component = component
      this.currentNode = node
    },

    hasVegaEquip(id) {
      if (this.$store.state.equip.hasVegaEquipArray.length === 0) {
        return false
      }
      const item = this.$store.state.equip.hasVegaEquipArray.find(
        (entry) => entry?.id === id
      )
      if (typeof item?.isPermit === 'boolean') {
        return item.isPermit === true ? item.isPermit : false
      }
      return false
    },
    async onCreateClick(node) {
      this.$emitter.emit('tree-layout:create', node)
      const isPermit = this.hasVegaEquip(node.id)

      if (isPermit && node.children.length === 1) {
        const options = {
          title: 'Создание',
          type: 'error',
          text: 'Оборудование с таким идентификатором DevEUI уже существует.',
        }
        this.$store.commit('notification', options)
        return
      }

      this.wizard = await wizardCreate(this.$http, node)
    },
    async remove(node) {
      try {
        if (this.$store.state.equip.hasVegaEquipArray.length > 0) {
          this.$store.state.equip.hasVegaEquipArray =
            this.$store.state.equip.hasVegaEquipArray.filter(
              (item) => !item?.isPermit
            )
        }

        await this.$http.delete(
          `${this.itemTypes[node.type].type}/delete/${node.id}`
        )
        this.notify(
          'Удаление',
          0,
          `Объект: ${this.itemTypes[node.type].text.toLowerCase()} '${
            node.text
          }' успешно удален.`
        )
      } catch (error) {
        this.$store.commit('error', error)
      }
    },
    notify(title, type, text) {
      this.$store.commit('notification', {
        title,
        type: this.$store.state.env.resultTypes[type].type,
        text,
      })
    },
    mousedown(e) {
      this.dragging = true
      this.createAvatar(e)
      document.addEventListener('mousemove', this.mousemove)
      document.addEventListener('mouseup', this.mouseup)
    },
    mouseup() {
      document.removeEventListener('mousemove', this.mousemove)
      document.removeEventListener('mouseup', this.mouseup)
      if (this.avatar && this.dragging) {
        this.percent =
          Math.round(
            (parseInt(this.avatar.style.left) /
              this.avatar.parentNode.offsetWidth) *
              10000
          ) / 100
        this.avatar.parentNode.removeChild(this.avatar)
        this.avatar = null
        this.dragging = false
        this.$emitter.emit('resize')
      }
    },
    mousemove(e) {
      if (this.dragging) {
        let left =
          e.pageX -
          this.avatar.parentNode.offsetLeft -
          this.avatar.offsetWidth / 2
        let percent =
          Math.round((left / this.avatar.parentNode.offsetWidth) * 10000) / 100
        if (percent > this.minWidth && percent < 100 - this.minWidth) {
          this.avatar.style.left = left + 'px'
        }
      }
    },
    createAvatar(e) {
      this.avatar = this.$el.appendChild(document.createElement('div'))
      this.avatar.classList.add('avatar')
      this.avatar.style.left =
        e.pageX -
        this.avatar.parentNode.offsetLeft -
        this.avatar.offsetWidth / 2 +
        'px'
    },
    search(item) {
      this.$refs.tree.search(item)
    },
    showButtonClick() {
      this.show = !this.show
    },
    getImage(node) {
      return getImage.call(this, node)
    },
  },
}
</script>

<style scoped>
.layout,
.tree,
.content {
  display: grid;
  overflow: auto;
  position: relative;
}

.tree {
  gap: 4px;
  grid-template-rows: max-content 1fr;
}

.content {
  grid-template-rows: min-content 1fr;
}

.splitter {
  background-color: #f6f8fb;
  width: 7px;
  user-select: none;
  transition: all 0.3s;
}

.splitter:hover {
  background-color: lightslategrey;
  cursor: col-resize;
}

.avatar {
  width: 7px;
  position: absolute;
  background-color: lightslategrey;
  cursor: col-resize;
  top: 0;
  bottom: 0;
  z-index: 12000;
}

.hide-button {
  right: 0;
  border-radius: 20px 0 0 20px;
  padding: 0.625em 5px;
}

.show-button {
  left: 0;
  border-radius: 0 20px 20px 0;
  padding: 0.625em 1px;
}

.hide-button,
.show-button {
  position: absolute;
  top: 50%;
  width: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease-in;
  opacity: 0.5;
  line-height: 1.25em;
  margin-top: -1.25em;
  z-index: 9999;
  background-color: lightslategrey;
  color: white;
}

.hide-button:hover,
.show-button:hover {
  width: 25px;
  opacity: 1;
}
</style>
