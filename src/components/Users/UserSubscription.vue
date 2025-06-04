<template>
  <div class="component-detail">
    <preserver-component
      v-bind="{ saving, disabled: !hasChanges || loading, loading }"
      @saveClick="onSaveClick()"
    >
      <tabs>
        <tab text="Параметры">
          <user-subscription-props
            ref="props"
            v-bind="{
              id,
              name: localName,
              priority: localPriority,
              subscriptions,
            }"
            @changed="onSubscriptionPropsChange"
          />
        </tab>
        <tab text="События">
          <div class="header-grid">
            <select v-model="eventType">
              <option
                v-for="[k, v] in Object.entries(
                  $store.state.env.systemMessageTypeEnum
                )"
                :key="k"
                :value="k"
              >
                {{ v.name }}
              </option>
            </select>
            Разрешить уведомления:
            <radio
              :label="'none'"
              v-model="localEvents[eventType].source"
              @update:modelValue="eventTypeChange"
              >Нет</radio
            >
            <radio
              :label="'all'"
              v-model="localEvents[eventType].source"
              @update:modelValue="eventTypeChange"
              >Ко всем</radio
            >
            <radio
              :label="'selected'"
              v-model="localEvents[eventType].source"
              @update:modelValue="eventTypeChange"
              >Из списка</radio
            >
          </div>
          <ul class="recursive-node" style="overflow: auto">
            <recursive-node
              v-for="node in templates[eventType]"
              :node="node"
              :key="node.key"
              @checkChange="onCheckEventChange"
              :disabled="localEvents[eventType].source !== 'selected'"
            />
          </ul>
        </tab>
        <tab text="Приборы">
          <div class="header-grid">
            Разрешить уведомления:
            <radio :label="'none'" v-model="localSourceEquip">Нет</radio>
            <radio :label="'all'" v-model="localSourceEquip">Ко всем</radio>
            <radio :label="'selected'" v-model="localSourceEquip"
              >Из списка</radio
            >
            <check-box v-model="localIncludeRelatedEquips"
              >от связанных точек учета</check-box
            >
          </div>
          <tool-bar>
            <div
              :class="[
                'button',
                'fas',
                'fa-plus-circle',
                { disabled: localSourceEquip !== 'selected' },
              ]"
              title="Добавить..."
              @click="onAddEquipClick"
            />
            <div
              :class="[
                'button',
                'fas',
                'fa-times-circle',
                {
                  disabled:
                    !hasSelectedEquips || localSourceEquip !== 'selected',
                },
              ]"
              title="Удалить"
              @click="onRemoveEquipClick"
            />
          </tool-bar>
          <div
            class="table-grid"
            :style="`grid-template-columns: repeat(3, max-content)`"
          >
            <header class="header">
              <input
                type="checkbox"
                v-model="allEquips"
                @change="changeAllEquips()"
                :style="{
                  cursor:
                    localSourceEquip === 'selected' ? 'pointer' : 'default',
                }"
                :disabled="localSourceEquip !== 'selected'"
              />
            </header>
            <header class="header"></header>
            <header class="header">Наименование</header>
            <div
              v-for="(r, index) in computedEquips"
              :key="index"
              class="table-row"
            >
              <span class="cell">
                <input
                  type="checkbox"
                  v-model="r.checked"
                  :disabled="localSourceEquip !== 'selected'"
                />
              </span>
              <span class="cell icon">
                <div
                  :class="`${getImage(r)} ${
                    r.hasOwnProperty('state')
                      ? $store.state.env.statuses[r.state].class
                      : ''
                  } table-icon`"
                />
              </span>
              <span class="cell">{{ r.name }}</span>
            </div>
          </div>
          <pager v-bind="equipPageInfo" @go="onChangeEquipPage" />
          <transition>
            <wizard
              v-if="wizardEquip"
              v-bind="wizardEquip"
              @cancel="cancelWizardEquip"
              @end="onWizardEquipEnd"
            />
          </transition>
        </tab>
        <tab text="Точки учета">
          <div class="header-grid">
            Разрешить уведомления:
            <radio :label="'none'" v-model="localSourceMeasureScheme"
              >Нет</radio
            >
            <radio :label="'all'" v-model="localSourceMeasureScheme"
              >Ко всем</radio
            >
            <radio :label="'selected'" v-model="localSourceMeasureScheme"
              >Из списка</radio
            >
            <check-box v-model="localIncludeRelatedMeasureSchemes"
              >от связанных приборов</check-box
            >
          </div>
          <tool-bar>
            <div
              :class="[
                'button',
                'fas',
                'fa-plus-circle',
                { disabled: localSourceMeasureScheme !== 'selected' },
              ]"
              title="Добавить..."
              @click="onAddPointClick"
            />
            <div
              :class="[
                'button',
                'fas',
                'fa-times-circle',
                {
                  disabled:
                    !hasSelectedPoints ||
                    localSourceMeasureScheme !== 'selected',
                },
              ]"
              title="Удалить"
              @click="onRemovePointClick"
            />
          </tool-bar>
          <div
            class="table-grid"
            :style="`grid-template-columns: repeat(3, max-content)`"
          >
            <header class="header">
              <input
                type="checkbox"
                v-model="allPoints"
                :style="{
                  cursor:
                    localSourceMeasureScheme === 'selected'
                      ? 'pointer'
                      : 'default',
                }"
                @change="changeAllPoints()"
                :disabled="localSourceMeasureScheme !== 'selected'"
              />
            </header>
            <header class="header"></header>
            <header class="header">Наименование</header>
            <div
              v-for="(r, index) in computedPoints"
              :key="index"
              class="table-row"
            >
              <span class="cell">
                <input
                  :style="{
                    cursor:
                      localSourceMeasureScheme === 'selected'
                        ? 'pointer'
                        : 'default',
                  }"
                  type="checkbox"
                  v-model="r.checked"
                  :disabled="localSourceMeasureScheme !== 'selected'"
                />
              </span>
              <span class="cell icon">
                <div
                  :class="`${getImage(r)} ${
                    r.hasOwnProperty('state')
                      ? $store.state.env.statuses[r.state].class
                      : ''
                  } table-icon`"
                />
              </span>
              <span class="cell">{{ r.name }}</span>
            </div>
          </div>
          <pager v-bind="pointPageInfo" @go="onChangePointPage" />
          <transition>
            <wizard
              v-if="wizardPoint"
              v-bind="wizardPoint"
              @cancel="cancelWizardPoint"
              @end="onWizardPointEnd"
            />
          </transition>
        </tab>
      </tabs>
    </preserver-component>
    <transition-group>
      <wizard
        v-if="wizard"
        v-bind="wizard"
        @cancel="cancelWizard"
        @end="onWizardEnd"
        key="0"
      />
      <spinner :show="loading" :text="'Загрузка...'" key="1" />
    </transition-group>
  </div>
</template>

<script>
import { store } from '@/store/store'

import { getImage } from '../../plugins/api.js'

import BaseComponent from '../Base/BaseComponent.vue'
import CheckBox from '../Inputs/CheckBox.vue'
import RecursiveNode from '../Tree/RecursiveNode.vue'
import Pager from '../PagerComponent.vue'
import PreserverComponent from '../PreserverComponent.vue'
import Radio from '../Inputs/Radio.vue'
import Tabs from '../Tabs/Tabs.vue'
import Tab from '../Tabs/Tabx.vue'
import ToolBar from '../ToolBar.vue'
import UserSubscriptionProps from './UserSubscriptionProps.vue'
import Wizard from '../Wizard.vue'

// eslint-disable-next-line no-unused-vars
import { safeStringify } from '@/utils/common.functions.js'
import { sortByName } from '@/utils/common.functions.js'
const FULL_ADDRESS_TYPE = 17

const sortBy = (a, b, prop) => {
  if (a[prop].toLowerCase() < b[prop].toLowerCase()) return -1
  if (a[prop].toLowerCase() > b[prop].toLowerCase()) return 1
}

const getEventValues = (node) => {
  let arr = []
  if (node.checked) {
    arr = [node.key]
  }

  if (Object.prototype.hasOwnProperty.call(node, 'children')) {
    arr = arr.concat(...node.children.map((r) => getEventValues(r)))
  }

  return arr
}

const wizardEquipAdd = (
  http,
  limitEquips,
  allowedEquips,
  allowedEquipLists,
  equips,
  equipLists,
  notificationServers
) => {
  const getType = (type) =>
    Object.values(store.state.env.itemTypes).find((r) => r.type === type)
  const types = ['equip', 'equipList', 'systemNode'].map((r) => getType(r))

  return {
    name: 'add',
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
          name: 'add',
          text: `Выбор ${
            data === 'equip'
              ? 'прибора'
              : data === 'equipList'
              ? 'списка приборов'
              : data === 'systemNode' 
              ? 'сервера'
              : 'объекта'
          }:`,
          component: 'selector',
          event: 'selectionChanged',
          data: {
            loader: async () => {
              if (data === 'equip') {
                if (limitEquips) {
                  return allowedEquips.filter((r) => !equips.includes(r.id))
                } else {
                  let { data } = await http.get('user/equips')
                  return data.filter((r) => !equips.includes(r.id))
                }
              } else if (data === 'equipList') {
                if (limitEquips) {
                  return allowedEquipLists.filter(
                    (r) => !equipLists.includes(r.id)
                  )
                } else {
                  let { data } = await http.get('user/equipLists')
                  return data.filter((r) => !equipLists.includes(r.id))
                }
              } else if (data === 'systemNode') {
                let { data } = await http.get('user/systemNodeList')
                return data
                  .filter((r) => !notificationServers.includes(r.id))
                  .sort(sortByName)
              }
            },
            searchColumn: 'name',
            columns: [
              {
                prop: 'name',
                text: 'Наименование',
              },
            ],
          },
        }
      },
    },
  }
}

const wizardEquipRemove = () => {
  return {
    name: 'remove',
    component: {
      text: 'Удаление приборов:',
      component: 'message',
      data: {
        text: 'Вы действительно хотите удалить выбранные объекты?',
      },
    },
  }
}

const wizardPointAdd = (
  http,
  limitPoints,
  allowedPoints,
  allowedPointLists,
  allowedPointGroups,
  allowedNodes,
  allowedBalanceGroups,
  points,
  pointLists,
  pointGroups,
  balanceGroups,
  nodes,
  notificationAddresses
) => {
  const getType = (type) =>
    Object.values(store.state.env.itemTypes).find((r) => r.type === type)
  const types = [
    'point',
    'pointList',
    'pointGroup',
    'balanceGroup',
    'node',
    'systemNode',
    'address',
  ].map((r) => getType(r))

  return {
    name: 'add',
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
          name: 'add',
          text: `Выбор ${
            data === 'point'
              ? 'точки учета'
              : data === 'pointList'
              ? 'списка точек учета'
              : data === 'pointGroup'
              ? 'группы точек учета'
              : data === 'balanceGroup'
              ? 'балансовой группы'
              : data === 'systemNode'
              ? 'сервера'
              : data === 'address'
              ? 'адреса'
              : 'объекта учета'
          }:`,
          component: 'selector',
          event: 'selectionChanged',
          data: {
            loader: async () => {
              if (data === 'point') {
                if (limitPoints) {
                  return allowedPoints.filter((r) => !points.includes(r.id))
                } else {
                  let { data } = await http.get('point/points')
                  return data
                    .filter((r) => !points.includes(r.id))
                    .sort((a, b) => sortBy(a, b, 'name'))
                }
              } else if (data === 'pointList') {
                if (limitPoints) {
                  return allowedPointLists.filter(
                    (r) => !pointLists.includes(r.id)
                  )
                } else {
                  let { data } = await http.get('pointList/pointLists')
                  return data
                    .filter((r) => !pointLists.includes(r.id))
                    .sort((a, b) => sortBy(a, b, 'name'))
                }
              } else if (data === 'pointGroup') {
                if (limitPoints) {
                  return allowedPointGroups.filter(
                    (r) => !pointGroups.includes(r.id)
                  )
                } else {
                  let { data } = await http.get('user/pointGroups')
                  return data
                    .filter((r) => !pointGroups.includes(r.id))
                    .sort((a, b) => sortBy(a, b, 'name'))
                }
              } else if (data === 'balanceGroup') {
                if (limitPoints) {
                  return allowedBalanceGroups.filter(
                    (r) =>
                      !balanceGroups.some(
                        (x) => x.id === r.id && x.groups === r.groups
                      )
                  )
                } else {
                  let { data } = await http.get('balanceGroup/balanceGroups')

                  let bgs = []
                  data.forEach((r) => {
                    if (
                      !balanceGroups.some(
                        (group) => group.id === r.id && group.groups === 1
                      )
                    ) {
                      bgs.push({
                        id: r.id,
                        type: r.type,
                        originName: r.name,
                        name: r.name + ' (Источники)',
                        groups: 1,
                        state: r.state,
                      })
                    }
                    if (
                      !balanceGroups.some(
                        (group) => group.id === r.id && group.groups === 2
                      )
                    ) {
                      bgs.push({
                        id: r.id,
                        type: r.type,
                        originName: r.name,
                        name: r.name + ' (Потребители)',
                        groups: 2,
                        state: r.state,
                      })
                    }
                  })
                  return bgs.sort((a, b) => sortBy(a, b, 'name'))
                }
              } else if (data === 'node') {
                if (limitPoints) {
                  return allowedNodes.filter((r) => !nodes.includes(r.id))
                } else {
                  let { data } = await http.get('node/nodes')
                  return data
                    .filter((r) => !nodes.includes(r.id))
                    .sort((a, b) => sortBy(a, b, 'name'))
                }
              } else if (data === 'address') {
                let { data } = await http.get('address/addresses')
                data = data.map((r) => ({
                  ...r,
                  type: FULL_ADDRESS_TYPE,
                  systemType: 2,
                  state: -1,
                }))

                return data
                  .filter((r) => !notificationAddresses.includes(r.id))
                  .sort(sortByName)
              }
            },
            searchColumn: 'name',
            columns: [
              {
                prop: 'name',
                text: 'Наименование',
              },
            ],
          },
        }
      },
    },
  }
}

const wizardPointRemove = () => {
  return {
    name: 'remove',
    component: {
      text: 'Удаление точек учета:',
      component: 'message',
      data: {
        text: 'Вы действительно хотите удалить выбранные объекты?',
      },
    },
  }
}

export default {
  components: {
    CheckBox,
    Pager,
    PreserverComponent,
    RecursiveNode,
    Radio,
    Tabs,
    Tab,
    ToolBar,
    UserSubscriptionProps,
    Wizard,
  },
  extends: BaseComponent,
  props: {
    name: String,
    priority: String,
    sourceEquip: String,
    includeRelatedEquips: Boolean,
    sourceMeasureScheme: String,
    includeRelatedMeasureSchemes: Boolean,
    equips: {
      type: Array,
      default: () => [],
    },
    equipLists: {
      type: Array,
      default: () => [],
    },
    notificationServers: {
      type: Array,
      default: () => [],
    },
    notificationAddresses: {
      type: Array,
      default: () => [],
    },
    points: {
      type: Array,
      default: () => [],
    },
    pointGroups: {
      type: Array,
      default: () => [],
    },
    pointLists: {
      type: Array,
      default: () => [],
    },
    nodes: {
      type: Array,
      default: () => [],
    },
    balanceGroups: {
      type: Array,
      default: () => [],
    },
    subscriptions: {
      type: Array,
      default: () => [],
    },
    events: {
      type: Object,
      default: () => {},
    },
    equipTypes: {
      type: Array,
      default: () => [],
    },
    servers: {
      type: Array,
      default: () => [],
    },
    limitEquips: {
      type: Boolean,
      default: false,
    },
    limitPoints: {
      type: Boolean,
      default: false,
    },
    allowedEquips: {
      type: Array,
      default: () => [],
    },
    allowedEquipLists: {
      type: Array,
      default: () => [],
    },
    allowedPoints: {
      type: Array,
      default: () => [],
    },
    allowedPointLists: {
      type: Array,
      default: () => [],
    },
    allowedPointGroups: {
      type: Array,
      default: () => [],
    },
    allowedNodes: {
      type: Array,
      default: () => [],
    },
    allowedBalanceGroups: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      localName: this.name,
      localPriority: this.priority,
      localSourceEquip: this.sourceEquip,
      localSourceMeasureScheme: this.sourceMeasureScheme,
      localEquips: JSON.parse(JSON.stringify(this.equips)),
      localEquipLists: JSON.parse(JSON.stringify(this.equipLists)),
      localNotificationServers: JSON.parse(
        JSON.stringify(this.notificationServers)
      ),
      localNotificationAddresses: JSON.parse(
        JSON.stringify(this.notificationAddresses)
      ),
      localPoints: JSON.parse(JSON.stringify(this.points)),
      localPointGroups: JSON.parse(JSON.stringify(this.pointGroups)),
      localPointLists: JSON.parse(JSON.stringify(this.pointLists)),
      localNodes: JSON.parse(JSON.stringify(this.nodes)),
      localBalanceGroups: this.balanceGroups
        .filter((r) => r.groups & 3)
        .map((r) => {
          let bg = {
            id: r.id,
            type: r.type,
            originName: r.name,
            state: r.state,
            checked: false,
          }
          if (r.groups === 1 || r.groups === 3) {
            bg.name = r.name + ' (Источники)'
            bg.groups = 1
          }
          if (r.groups === 2 || r.groups === 3) {
            bg.name = r.name + ' (Потребители)'
            bg.groups = 2
          }
          return bg
        }),
      localEvents: JSON.parse(JSON.stringify(this.events)),
      equipPageInfo: this.$store.getters.pageInfo,
      equipPage: 1,
      allEquips: false,
      pointPageInfo: this.$store.getters.pageInfo,
      pointPage: 1,
      allPoints: false,
      wizardEquip: null,
      wizardPoint: null,
      localIncludeRelatedEquips: this.includeRelatedEquips,
      localIncludeRelatedMeasureSchemes: this.includeRelatedMeasureSchemes,
      eventType: 'equipEvent',
      templates: Object.entries(
        this.$store.state.env.systemMessageTypeEnum
      ).reduce(
        (acc, [k, v]) => ({
          ...acc,
          [k]:
            k === 'equipEvent'
              ? this.getEquipEventTree(this.equipTypes, this.events[k].selected)
              : this.getEventTree(
                  Object.entries(v.templates),
                  this.events[k].selected
                ),
        }),
        {}
      ),
    }
  },
  created() {
    this.$watch(
      () => this.localSourceEquip,
      () => (this.hasChanges = true)
    )

    this.$watch(
      () => this.localIncludeRelatedEquips,
      () => (this.hasChanges = true)
    )

    this.$watch(
      () => this.localSourceMeasureScheme,
      () => (this.hasChanges = true)
    )

    this.$watch(
      () => this.localIncludeRelatedMeasureSchemes,
      () => (this.hasChanges = true)
    )

    this.$watch(
      () =>
        this.localEquips.length +
        this.localEquipLists.length +
        this.localNotificationServers.length,
      (value) => (this.equipPageInfo.Items = value)
    )
    this.equipPageInfo.Items =
      this.localEquips.length +
      this.localEquipLists.length +
      this.localNotificationServers.length

    this.$watch(
      () =>
        this.localPoints.length +
        this.localPointLists.length +
        this.localPointGroups.length +
        this.localBalanceGroups.length +
        this.localNodes.length +
        this.localNotificationAddresses.length,
      (value) => (this.pointPageInfo.Items = value)
    )
    this.pointPageInfo.Items =
      this.localPoints.length +
      this.localPointLists.length +
      this.localPointGroups.length +
      this.localBalanceGroups.length +
      this.localNodes.length +
      this.localNotificationAddresses.length

    this.$watch(
      () => this.computedEquips,
      () => (this.hasChanges = true),
      { deep: true }
    )

    this.$watch(
      () => this.computedPoints,
      () => (this.hasChanges = true),
      { deep: true }
    )

    this.loading = false
  },
  beforeUnmount() {},
  computed: {
    computedEquips() {
      let rows = this.localEquips
        .concat(this.localEquipLists)
        .concat(this.localNotificationServers)
        .sort((a, b) => sortBy(a, b, 'name'))

      let firstIndex = (this.equipPage - 1) * this.equipPageInfo.Size
      let lastIndex =
        this.equipPage * this.equipPageInfo.Size > rows.length
          ? rows.length
          : this.equipPage * this.equipPageInfo.Size

      return rows.slice(firstIndex, lastIndex)
    },
    hasSelectedEquips() {
      return (
        this.localEquips.some((r) => r.checked) ||
        this.localEquipLists.some((r) => r.checked) ||
        this.localNotificationServers.some((r) => r.checked)
      )
    },
    hasSelectedPoints() {
      return (
        this.localPoints.some((r) => r.checked) ||
        this.localPointGroups.some((r) => r.checked) ||
        this.localPointLists.some((r) => r.checked) ||
        this.localNodes.some((r) => r.checked) ||
        this.localBalanceGroups.some((r) => r.checked) ||
        this.localNotificationAddresses.some((r) => r.checked)
      )
    },
    computedPoints() {
      let rows = this.localPoints
        .concat(
          this.localPointGroups,
          this.localPointLists,
          this.localBalanceGroups,
          this.localNodes,
          this.localNotificationAddresses
        )
        .sort((a, b) => sortBy(a, b, 'name'))

      let firstIndex = (this.pointPage - 1) * this.pointPageInfo.Size
      let lastIndex =
        this.pointPage * this.pointPageInfo.Size > rows.length
          ? rows.length
          : this.pointPage * this.pointPageInfo.Size

      return rows.slice(firstIndex, lastIndex)
    },
  },
  watch: {
    equipTypes(value) {
      this.templates.equipEvent = this.getEquipEventTree(
        value,
        this.localEvents.equipEvent.selected
      )
    },
    allowedEquips(value) {
      this.localEquips = this.localEquips.filter((r) =>
        value.map((r) => r.id).includes(r.id)
      )
    },
    limitEquips(value) {
      if (value) {
        this.localEquips = this.localEquips.filter((r) =>
          this.allowedEquips.map((r) => r.id).includes(r.id)
        )
        this.localEquipLists = this.localEquipLists.filter((r) =>
          this.allowedEquipLists.map((r) => r.id).includes(r.id)
        )
      }
    },
    allowedEquipLists(value) {
      this.localEquipLists = this.localEquipLists.filter((r) =>
        value.map((r) => r.id).includes(r.id)
      )
    },
    limitPoints(value) {
      if (value) {
        this.localPoints = this.localPoints.filter((r) =>
          this.allowedPoints.map((r) => r.id).includes(r.id)
        )
        this.localPointLists = this.localPointLists.filter((r) =>
          this.allowedPointLists.map((r) => r.id).includes(r.id)
        )
        this.localPointGroups = this.localPointGroups.filter((r) =>
          this.allowedPointGroups.map((r) => r.id).includes(r.id)
        )
        this.localNodes = this.localNodes.filter((r) =>
          this.allowedNodes.map((r) => r.id).includes(r.id)
        )
        this.localBalanceGroups = this.localBalanceGroups.filter((r) =>
          this.allowedBalanceGroups.map((r) => r.id).includes(r.id)
        )
      }
    },
    allowedPoints(value) {
      this.localPoints = this.localPoints.filter((r) =>
        value.map((r) => r.id).includes(r.id)
      )
    },
    allowedPointLists(value) {
      this.localPointLists = this.localPointLists.filter((r) =>
        value.map((r) => r.id).includes(r.id)
      )
    },
    allowedPointGroups(value) {
      this.localPointGroups = this.localPointGroups.filter((r) =>
        value.map((r) => r.id).includes(r.id)
      )
    },
    allowedNodes(value) {
      this.localNodes = this.localNodes.filter((r) =>
        value.map((r) => r.id).includes(r.id)
      )
    },
    allowedBalanceGroups(value) {
      this.localBalanceGroups = this.localBalanceGroups.filter((r) =>
        value.some((x) => x.id === r.id && x.groups === r.groups)
      )
    },
  },
  methods: {
    eventTypeChange() {
      this.hasChanges = true
    },
    getEventTree(templates, events) {
      return templates
        .map(([key, value]) => this.getEventNode(key, value, null, events))
        .sort(
          (a, b) =>
            Object.prototype.hasOwnProperty.call(b, 'children') -
              Object.prototype.hasOwnProperty.call(a, 'children') ||
            a.name.localeCompare(b.name)
        )
    },
    getEventNode(key, value, parent, events = []) {
      let event = {
        key: parseInt(key),
        name: value.name,
        checked: events.includes(parseInt(key)),
        isOpen: false,
        indeterminate: false,
      }

      if (parent) {
        event.parent = parent
      }

      if (Object.prototype.hasOwnProperty.call(value, 'events')) {
        event.children = Object.entries(value.events).map(([k, v]) =>
          this.getEventNode(k, v, event, events)
        )
        event.indeterminate =
          event.children.length !==
            event.children.filter((r) => r.checked).length &&
          event.children.length !==
            event.children.filter((r) => !r.checked).length
      }

      return event
    },
    getEquipEventTree(equipTypes, events) {
      const types = equipTypes.reduce(
        (acc, r) => ({
          ...acc,
          [r]: this.$store.state.env.systemMessageTypeEnum.equipEvent.templates[
            r
          ],
        }),
        {}
      )

      return Object.entries(types)
        .map(([equipTypeKey, equipTypeValue]) => {
          let equipType = {
            key: equipTypeKey,
            name: equipTypeValue.name,
            checked: false,
            isOpen: false,
            indeterminate: false,
          }

          equipType.children = Object.entries(equipTypeValue.groups).map(
            ([groupKey, groupValue]) => {
              let group = {
                key: groupKey,
                name: groupKey,
                checked: false,
                isOpen: false,
                parent: equipType,
                indeterminate: false,
              }

              group.children = Object.entries(groupValue).map(
                ([eventGroupKey, eventGroupValue]) => {
                  let value = false
                  if (
                    Object.prototype.hasOwnProperty.call(events, equipTypeKey)
                  ) {
                    if (events[equipTypeKey]) {
                      if (
                        Object.prototype.hasOwnProperty.call(
                          events[equipTypeKey],
                          groupKey
                        )
                      ) {
                        if (events[equipTypeKey][groupKey] === null) {
                          group.checked = value = true
                        } else {
                          value = events[equipTypeKey][groupKey].includes(
                            parseInt(eventGroupKey)
                          )
                        }
                      }
                    } else {
                      equipType.checked = group.checked = value = true
                    }
                  }

                  let eventGroup = {
                    key: eventGroupKey,
                    name: eventGroupValue,
                    checked: value,
                    isOpen: false,
                    parent: group,
                    indeterminate: false,
                  }

                  return eventGroup
                }
              )

              if (group.children && group.children.length > 0) {
                group.indeterminate = !group.children.every(
                  (r, i, arr) => r.checked === arr[0].checked
                )
              }

              return group
            }
          )

          if (equipType.children && equipType.children.length > 0) {
            equipType.indeterminate =
              equipType.children.some((r) => r.indeterminate === true) ||
              !equipType.children.every(
                (r, i, arr) => r.checked === arr[0].checked
              )
          }

          return equipType
        })
        .sort((a, b) => sortBy(a, b, 'name'))
    },
    onSubscriptionPropsChange(prop, value) {
      this[prop] = value

      this.hasChanges = true
    },
    getImage(item) {
      return getImage.call(this, item)
    },
    onAddEquipClick() {
      this.wizardEquip = wizardEquipAdd(
        this.$http,
        this.limitEquips,
        this.allowedEquips,
        this.allowedEquipLists,
        this.localEquips.map((r) => r.id),
        this.localEquipLists.map((r) => r.id),
        this.notificationServers.map((r) => r.id)
      )
    },
    onRemoveEquipClick() {
      this.wizardEquip = wizardEquipRemove()
    },
    onWizardEquipEnd(data, name) {
      this.wizardEquip = null
      if (name === 'remove') {
        // eslint-disable-next-line no-extra-semi
        ;['localEquips', 'localEquipLists', 'localNotificationServers'].forEach(
          (k) => (this[k] = this[k].filter((r) => !r.checked))
        )
      } else if (name === 'add') {
        data.forEach((r) => (r.checked = false))

        this.localEquips = this.localEquips.concat(
          data.filter(
            (r) => this.$store.state.env.itemTypes[r.type].type === 'equip'
          )
        )
        this.localEquipLists = this.localEquipLists.concat(
          data.filter(
            (r) => this.$store.state.env.itemTypes[r.type].type === 'equipList'
          )
        )
        this.localNotificationServers = this.localNotificationServers.concat(
          data.filter(
            (r) => this.$store.state.env.itemTypes[r.type].type === 'systemNode'
          )
        )
      }
    },
    cancelWizardEquip() {
      this.wizardEquip = null
    },
    onChangeEquipPage(page, size) {
      this.equipPageInfo.Size = size
      this.equipPageInfo.Page = page
      this.equipPage = page
    },
    changeAllEquips() {
      this.localEquips.forEach((r) => (r.checked = this.allEquips))
      this.localEquipLists.forEach((r) => (r.checked = this.allEquips))
      this.localNotificationServers.forEach((r) => (r.checked = this.allEquips))
    },
    onAddPointClick() {
      let args = [
        this.$http,
        this.limitPoints,
        this.allowedPoints,
        this.allowedPointLists,
        this.allowedPointGroups,
        this.allowedNodes,
        this.allowedBalanceGroups,
        this.localPoints.map((r) => r.id),
        this.localPointLists.map((r) => r.id),
        this.localPointGroups.map((r) => r.id),
        this.localBalanceGroups,
        this.localNodes.map((r) => r.id),
        this.notificationAddresses.map((r) => r.id),
      ]
      this.wizardPoint = wizardPointAdd(...args)
    },
    onRemovePointClick() {
      this.wizardPoint = wizardPointRemove()
    },
    onWizardPointEnd(data, name) {
      this.wizardPoint = null

      if (name === 'remove') {
        // eslint-disable-next-line no-extra-semi
        ;[
          'localPoints',
          'localPointLists',
          'localPointGroups',
          'localBalanceGroups',
          'localNodes',
          'localNotificationAddresses',
        ].forEach((k) => (this[k] = this[k].filter((r) => !r.checked)))
      } else if (name === 'add') {
        data.forEach((r) => (r.checked = false))

        this.localPoints = this.localPoints.concat(
          data.filter(
            (r) => this.$store.state.env.itemTypes[r.type].type === 'point'
          )
        )
        this.localPointLists = this.localPointLists.concat(
          data.filter(
            (r) => this.$store.state.env.itemTypes[r.type].type === 'pointList'
          )
        )
        this.localPointGroups = this.localPointGroups.concat(
          data.filter(
            (r) => this.$store.state.env.itemTypes[r.type].type === 'pointGroup'
          )
        )
        this.localBalanceGroups = this.localBalanceGroups.concat(
          data.filter(
            (r) =>
              this.$store.state.env.itemTypes[r.type].type === 'balanceGroup'
          )
        )
        this.localNodes = this.localNodes.concat(
          data.filter(
            (r) => this.$store.state.env.itemTypes[r.type].type === 'node'
          )
        )
        this.localNotificationAddresses =
          this.localNotificationAddresses.concat(
            data.filter(
              (r) => this.$store.state.env.itemTypes[r.type].type === 'address'
            )
          )
      }
    },
    cancelWizardPoint() {
      this.wizardPoint = null
    },
    onChangePointPage(page, size) {
      this.pointPageInfo.Size = size
      this.pointPageInfo.Page = page
      this.pointPage = page
    },
    changeAllPoints() {
      this.localPoints.forEach((r) => (r.checked = this.allPoints))
      this.localPointLists.forEach((r) => (r.checked = this.allPoints))
      this.localPointGroups.forEach((r) => (r.checked = this.allPoints))
      this.localNodes.forEach((r) => (r.checked = this.allPoints))
      this.localBalanceGroups.forEach((r) => (r.checked = this.allPoints))
      this.localNotificationAddresses.forEach(
        (r) => (r.checked = this.allPoints)
      )
    },
    onCheckEventChange(node, value) {
      if (node.checked !== value) {
        node.checked = value
        node.indeterminate = false
        this.updateChildren(node.checked, node.children)
        if (Object.prototype.hasOwnProperty.call(node, 'parent')) {
          this.updateParent(node.parent)
        }

        this.hasChanges = true
      }
    },
    updateChildren(checked, nodes) {
      if (nodes && nodes.length > 0) {
        nodes.forEach((r) => {
          r.checked = checked
          r.indeterminate = false
          this.updateChildren(checked, r.children)
        })
      }
    },
    updateParent(node) {
      if (node.children && node.children.length > 0) {
        const allEqual = node.children.every(
          (r, i, a) => r.checked === a[0].checked
        )
        const hasIndeterminate = node.children.some((r) => r.indeterminate)

        node.indeterminate = hasIndeterminate || !allEqual
        if (allEqual) {
          node.checked = node.children[0].checked
        }
      }

      if (Object.prototype.hasOwnProperty.call(node, 'parent')) {
        this.updateParent(node.parent)
      }
    },
    save() {
      if (this.$refs.props.validateData()) {
        this.localEvents.equipEvent.selected = this.templates.equipEvent.reduce(
          (accEquipType, equipType) => {
            const equipTypeChildren = equipType.children.reduce(
              (accGroup, group) => {
                const events = group.children.filter((r) => r.checked)
                if (events.length > 0) {
                  return {
                    ...accGroup,
                    [group.key]:
                      Object.keys(
                        this.$store.state.env.systemMessageTypeEnum.equipEvent
                          .templates[equipType.key].groups[group.key]
                      ).length === events.length
                        ? null
                        : events.map((r) => parseInt(r.key)),
                  }
                }
                return accGroup
              },
              {}
            )

            const values = Object.values(equipTypeChildren)
            if (values.length > 0) {
              if (
                values.filter((r) => r === null).length ===
                Object.keys(
                  this.$store.state.env.systemMessageTypeEnum.equipEvent
                    .templates[equipType.key].groups
                ).length
              ) {
                return { ...accEquipType, [equipType.key]: null }
              }
              return { ...accEquipType, [equipType.key]: equipTypeChildren }
            }
            return accEquipType
          },
          {}
        )

        Object.keys(this.$store.state.env.systemMessageTypeEnum).forEach(
          (key) => {
            if (key !== 'equipEvent') {
              this.localEvents[key].selected = [].concat(
                ...this.templates[key].map((r) => getEventValues(r))
              )
            }
          }
        )
        this.hasChanges = false

        this.$store.state.equip.notificationServers =
          this.localNotificationServers

        this.$store.state.equip.notificationAddresses =
          this.localNotificationAddresses

        this.$emit('saved', {
          id: this.id,
          name: this.localName,
          priority: this.localPriority,
          sourceEquip: this.localSourceEquip,
          sourceMeasureScheme: this.localSourceMeasureScheme,
          includeRelatedEquips: this.localIncludeRelatedEquips,
          includeRelatedMeasureSchemes: this.localIncludeRelatedMeasureSchemes,
          equips: this.localEquips,
          equipLists: this.localEquipLists,
          notificationServers: this.localNotificationServers,
          notificationAddresses: this.localNotificationAddresses,
          points: this.localPoints,
          pointLists: this.localPointLists,
          pointGroups: this.localPointGroups,
          nodes: this.localNodes,
          balanceGroups: this.localBalanceGroups.map((r) => ({
            id: r.id,
            type: r.type,
            name: r.originName,
            state: r.state,
            groups: r.groups,
          })),
          events: this.localEvents,
        })
      }
    },
  }, // end methods
}
</script>

<style scoped>
.grid {
  display: grid;
  gap: 5px 3px;
  align-items: center;
}

.grid.two {
  grid-template-columns: max-content max-content;
}

.grid label {
  text-align: right;
}

.grid[disabled='true'] {
  opacity: 0.5;
}

.grid input[type='checkbox'] {
  cursor: pointer;
}

.grid,
.grid[disabled='true'] input[type='checkbox'] {
  cursor: default;
}

.name {
  padding: 2px 4px;
  border: thin solid darkgray;
  border-radius: 3px;
  height: 100%;
  width: 200px;
}

.header-grid {
  display: grid;
  padding: 10px 0px;
  gap: 10px 15px;
  grid-template-columns: repeat(5, max-content);
}
</style>
