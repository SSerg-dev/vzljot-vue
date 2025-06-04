<template>
  <div class="component-detail">
    <preserver-component
      v-bind="{ saving, disabled: !hasChanges || loading, loading }"
      @saveClick="onSaveClick()"
    >
      <tabs @click="onTabClick($event)">
        <tab text="Параметры">
          <user-props
            ref="userProps"
            v-bind="{ user: value, maps }"
            @change="onChangeEvent"
            @fullNameChange="onFullNameChange"
          />
        </tab>
        <tab
          v-if="
            $store.state.user && $store.state.user?.userRights.allowCryptSign
          "
          text="Сертификат"
          :name="'certificate'"
        >
          <div class="cert-grid" style="width: fit-content">
            <button
              v-if="certRunned && cert === null"
              @click="onCreateCertClick()"
            >
              Создать
            </button>
            <button
              v-if="certRunned && cert !== null"
              @click="onTrustCertClick()"
            >
              Добавить к надежным
            </button>
            <div v-if="cert" class="cert-grid two">
              <label>Имя субъекта:</label>
              <div>{{ cert.subject }}</div>
              <label>Имя издателя:</label>
              <div>{{ cert.issuer }}</div>
              <label>Срок действия:</label>
              <div>{{ new Date(cert.validTo).toLocaleString() }}</div>
            </div>
          </div>
          <wizard
            v-if="wizardCert"
            v-bind="wizardCert"
            @cancel="cancelWizardCert"
            @end="onWizardCertEnd"
          />
          <spinner :show="waitCert" text="Ожидание..." />
        </tab>
        <tab text="Подписки">
          <tool-bar>
            <div
              :class="['button', 'fas', 'fa-plus-circle']"
              title="Добавить..."
              @click="onAddSubscriptionClick()"
            />
            <div
              :class="[
                'button',
                'fas',
                'fa-times-circle',
                { disabled: !subscriptions.some((r) => r.checked) },
              ]"
              title="Удалить"
              @click="onRemoveSubscriptionClick()"
            />
          </tool-bar>
          <div
            class="table-grid"
            style="grid-template-columns: repeat(4, max-content)"
          >
            <header class="header" />
            <header class="header">
              <input
                type="checkbox"
                v-model="allSubscriptions"
                @change="changeAllSubscriptions"
              />
            </header>
            <header class="header">Наименование</header>
            <header class="header">Приоритет</header>
            <div
              v-for="(r, i) in localSubscriptions"
              :key="i"
              class="table-row"
            >
              <span class="cell icon">
                <div
                  :class="`${getImage(r)} clickable-icon`"
                  @click="viewSubscriptionClick(r, i)"
                  title="Просмотр..."
                />
              </span>
              <span class="cell">
                <input type="checkbox" v-model="r.checked" />
              </span>
              <span class="cell">{{ r.name }}</span>
              <span class="cell">{{
                $store.state.env.notificationPriorityEnum[r.priority]
              }}</span>
            </div>
          </div>
          <pager v-bind="subscriptionPageInfo" @go="onChangeSubscriptionPage" />
          <transition-group>
            <wizard
              v-if="wizardSubscription"
              v-bind="wizardSubscription"
              @cancel="cancelWizardSubscription"
              @end="onWizardSubscriptionEnd"
            />
            <props
              v-if="subscriptionEdit"
              :text="`Подписка: ${subscriptionComponentText}`"
              @close="subscriptionClose"
            >
              <user-subscription
                v-bind="subscriptionData"
                @saved="onSaveSubscriptionClick"
              />
            </props>
          </transition-group>
        </tab>
        <tab v-if="isTabVisible" text="Права пользователя">
          <user-rights
            v-bind="{
              userRights: getUserRights(),
              groupsRights: getGroupRights(),
              objectsRights: getObjectRights(),
            }"
            @changeAllow="onChangeAllow"
            @changeDeny="onChangeDeny"
          />
        </tab>
        <tab v-if="isTabVisible" text="Доступ к приборам">
          <div style="display: flex; padding: 10px">
            <check-box v-model="value.limitEquips"
              >Ограничить доступ к приборам</check-box
            >
            <check-box
              style="padding: 0 20px"
              v-model="value.includeRelatedPoints"
              :disabled="!value.limitEquips"
              >Предоставить доступ от связанных точек учета</check-box
            >
          </div>
          <tool-bar>
            <div
              :class="[
                'button',
                'fas',
                'fa-plus-circle',
                { disabled: !value.limitEquips },
              ]"
              title="Добавить..."
              @click="onAddEquipClick"
            />
            <div
              :class="[
                'button',
                'fas',
                'fa-times-circle',
                { disabled: !hasSelectedEquips || !value.limitEquips },
              ]"
              title="Удалить"
              @click="onRemoveEquipClick"
            />
          </tool-bar>
          <div
            class="table-grid"
            style="grid-template-columns: repeat(3, max-content)"
          >
            <header class="header">
              <input
                type="checkbox"
                v-model="allEquips"
                @change="changeAllEquips()"
                :disabled="!value.limitEquips"
              />
            </header>
            <header class="header"></header>
            <header class="header">Наименование</header>
            <div v-for="(r, i) in localEquips" :key="i" class="table-row">
              <span class="cell">
                <input
                  type="checkbox"
                  v-model="r.checked"
                  :disabled="!value.limitEquips"
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
        <tab v-if="isTabVisible" text="Доступ к точкам учета">
          <div style="display: flex; padding: 10px">
            <check-box v-model="value.limitPoints"
              >Ограничить доступ к точкам учета</check-box
            >
            <check-box
              style="padding: 0 20px"
              v-model="value.includeRelatedEquips"
              :disabled="!value.limitPoints"
              >Предоставить доступ от связанных приборов</check-box
            >
          </div>
          <tool-bar>
            <div
              :class="[
                'button',
                'fas',
                'fa-plus-circle',
                { disabled: !value.limitPoints },
              ]"
              title="Добавить..."
              @click="onAddPointClick"
            />
            <div
              :class="[
                'button',
                'fas',
                'fa-times-circle',
                { disabled: !hasSelectedPoints || !value.limitPoints },
              ]"
              title="Удалить"
              @click="onRemovePointClick"
            />
          </tool-bar>
          <div
            class="table-grid"
            style="grid-template-columns: repeat(3, max-content)"
          >
            <header class="header">
              <input
                type="checkbox"
                v-model="allPoints"
                @change="changeAllPoints()"
                :disabled="!value.limitPoints"
              />
            </header>
            <header class="header"></header>
            <header class="header">Наименование</header>
            <div v-for="(r, i) in localPoints" :key="i" class="table-row">
              <span class="cell">
                <input
                  type="checkbox"
                  v-model="r.checked"
                  :disabled="!value.limitPoints"
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
        <tab v-if="isTabVisible" text="Доступ к отчетам">
          <div style="display: flex; padding: 10px">
            <check-box v-model="value.limitReports"
              >Ограничить доступ к отчетам</check-box
            >
          </div>
          <tool-bar>
            <div
              :class="[
                'button',
                'fas',
                'fa-plus-circle',
                { disabled: !value.limitReports },
              ]"
              title="Добавить..."
              @click="onAddReportClick"
            />
            <div
              :class="[
                'button',
                'fas',
                'fa-times-circle',
                { disabled: !hasSelectedReports || !value.limitReports },
              ]"
              title="Удалить"
              @click="onRemoveReportClick"
            />
          </tool-bar>
          <div
            class="table-grid"
            style="grid-template-columns: repeat(5, max-content)"
          >
            <header class="header">
              <input
                type="checkbox"
                v-model="allReports"
                @change="changeAllReports()"
                :disabled="!value.limitReports"
              />
            </header>
            <header class="header"></header>
            <header class="header">Наименование</header>
            <header class="header">Тип объекта</header>
            <header class="header">Тип отчета</header>
            <div v-for="(r, i) in localReports" :key="i" class="table-row">
              <span class="cell">
                <input
                  type="checkbox"
                  v-model="r.checked"
                  :disabled="!value.limitReports"
                />
              </span>
              <span class="cell icon">
                <div :class="`${getImage(r)} table-icon`" />
              </span>
              <span class="cell">{{ r.name }}</span>
              <span class="cell">{{ r.objType }}</span>
              <span class="cell">{{ r.reportType }}</span>
            </div>
          </div>
          <pager v-bind="reportPageInfo" @go="onChangeReportPage" />
          <transition>
            <wizard
              v-if="wizardReport"
              v-bind="wizardReport"
              @cancel="cancelWizardReport"
              @end="onWizardReportEnd"
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
let localAddresses = []
let localServers = []

const FULL_ADDRESS_TYPE = 17
const FULL_ADDRESS_NAME = 'Полный адрес объекта'

const sortByName = (a, b) => {
  if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
  if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
}

const wizardReportAdd = (http, reports) => {
  return {
    name: 'add',
    component: {
      text: 'Выбор отчетов:',
      component: 'selector',
      event: 'selectionChanged',
      data: {
        loader: async () => {
          let { data } = await http.get('user/reports')
          return data.filter((r) => !reports.includes(r.id)).sort(sortByName)
        },
        searchColumn: 'name',
        columns: [
          {
            prop: 'name',
            text: 'Наименование',
          },
          {
            prop: 'objType',
            text: 'Тип объекта',
          },
          {
            prop: 'reportType',
            text: 'Тип отчета',
          },
        ],
      },
    },
  }
}

const wizardEquipAdd = (
  http,
  equips,
  equipLists,
  serverSystemNodesSelectedList
) => {
  const getType = (type) =>
    Object.values(store.state.env.itemTypes).find((r) => r.type === type)

  const getTypeText = (data) => {
    let result
    if (data === 'equip') {
      result = 'прибора'
    } else if (data === 'equipList') {
      result = 'списка приборов'
    } else if (data === 'systemNode') {
      result = 'сервера'
    }

    return result
  }

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
          text: `Выбор ${getTypeText(data)}:`,
          component: 'selector',
          event: 'selectionChanged',
          data: {
            loader: async () => {
              store.state.equip.systemNodeType = data

              if (data === 'equip') {
                let { data } = await http.get('user/equipsFiltered', {
                  params: {
                    userId: store.state.equip.userId,
                  },
                })
                return data
                  .filter((r) => !equips.includes(r.id))
                  .sort(sortByName)
              } else if (data === 'equipList') {
                let { data } = await http.get('user/equipLists')
                return data
                  .filter((r) => !equipLists.includes(r.id))
                  .sort(sortByName)
              } else if (data === 'systemNode') {
                let { data } = await http.get('user/systemNodeList')

                store.state.equip.equipEvent.hasChangeSystemNode = true
                return data
                  .filter((r) => !serverSystemNodesSelectedList.includes(r.id))
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

const wizardPointAdd = (
  http,
  points,
  pointLists,
  pointGroups,
  balanceGroups,
  nodes,
  addresses
) => {
  const getType = (type) =>
    Object.values(store.state.env.itemTypes).find((r) => r.type === type)
  const types = [
    'point',
    'pointList',
    'pointGroup',
    'balanceGroup',
    'node',
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
              : data === 'address'
              ? 'адреса'
              : 'объекта учета'
          }:`,
          component: 'selector',
          event: 'selectionChanged',
          data: {
            loader: async () => {
              if (data === 'point') {
                let { data } = await http.get('point/points')
                return data
                  .filter((r) => !points.includes(r.id))
                  .sort(sortByName)
              } else if (data === 'pointList') {
                let { data } = await http.get('pointList/pointLists')
                return data
                  .filter((r) => !pointLists.includes(r.id))
                  .sort(sortByName)
              } else if (data === 'pointGroup') {
                let { data } = await http.get('user/pointGroups')
                return data
                  .filter((r) => !pointGroups.includes(r.id))
                  .sort(sortByName)
              } else if (data === 'balanceGroup') {
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
                      name: r.name + ' (Потребители)',
                      groups: 2,
                      state: r.state,
                    })
                  }
                })
                return bgs.sort(sortByName)
              } else if (data === 'node') {
                let { data } = await http.get('node/nodes')
                return data
                  .filter((r) => !nodes.includes(r.id))
                  .sort(sortByName)
              } else if (data === 'address') {
                localAddresses = localAddresses.map((item) => ({
                  ...item,
                  type: FULL_ADDRESS_TYPE,
                  state: -1,
                  checked: false,
                }))

                return localAddresses
                  .filter((r) => !addresses.includes(r.id))
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

const wizardReportRemove = () => {
  return {
    name: 'remove',
    component: {
      text: 'Удаление отчетов:',
      component: 'message',
      data: {
        text: 'Вы действительно хотите удалить выбранные отчеты?',
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

const wizardCert = (name) => {
  return {
    name: name,
    component: {
      text: 'Ввод пароля:',
      component: 'certPassword',
      event: 'changed',
    },
  }
}

const wizardSubscriptionAdd = (value) => {
  return {
    name: 'add',
    component: {
      text: 'Создание подписки:',
      component: 'user-subscription-props',
      event: 'changed',
      data: value,
    },
  }
}

const wizardSubscriptionRemove = () => {
  return {
    name: 'remove',
    component: {
      text: 'Удаление подписок:',
      component: 'message',
      data: {
        text: 'Вы действительно хотите удалить выбранные подписки?',
      },
    },
  }
}

import { store } from '@/store/store'

const abortController = new AbortController()

import { getImage } from '../../plugins/api.js'
import Subscription from './subscription.js'
import User from '../../classes/user'

import BaseComponent from '../Base/BaseComponent.vue'
import PreserverComponent from '../PreserverComponent.vue'
import Props from '../PropsComponent.vue'
import Pager from '../PagerComponent.vue'
import ToolBar from '../ToolBar.vue'
import UserProps from './UserProps.vue'
import Tabs from '../Tabs/Tabs.vue'
import Tab from '../Tabs/Tabx.vue'
import CheckBox from '../Inputs/CheckBox.vue'
import Wizard from '../Wizard.vue'
import UserRights from './UserRights.vue'
import UserSubscription from './UserSubscription.vue'

// eslint-disable-next-line no-unused-vars
import { safeStringify } from '@/utils/common.functions.js'

export default {
  components: {
    ToolBar,
    Pager,
    UserProps,
    UserRights,
    Tabs,
    Tab,
    CheckBox,
    Wizard,
    PreserverComponent,
    Props,
    UserSubscription,
  },
  extends: BaseComponent,
  data() {
    return {
      cert: null,
      certRunned: false,
      value: new User(),
      equipTypes: [],
      userRights: {},
      groupsRights: {},
      maps: {},
      subscriptions: [],
      equipPageInfo: JSON.parse(JSON.stringify(this.$store.getters.pageInfo)),
      pointPageInfo: JSON.parse(JSON.stringify(this.$store.getters.pageInfo)),
      reportPageInfo: JSON.parse(JSON.stringify(this.$store.getters.pageInfo)),
      subscriptionPageInfo: JSON.parse(
        JSON.stringify(this.$store.getters.pageInfo)
      ),
      allEquips: false,
      allPoints: false,
      allReports: false,
      allSubscriptions: false,
      wizardEquip: null,
      wizardPoint: null,
      wizardReport: null,
      wizardCert: null,
      wizardSubscription: null,
      waitCert: false,
      subscriptionData: null,
      subscriptionComponentText: null,
      subscriptionEdit: false,
    }
  },
  computed: {
    itemTypes() {
      return this.matchType(this.$store.state.env.itemTypes)
    },
    hasSelectedEquips() {
      return (
        this.value.equips.some((r) => r.checked) ||
        this.value.equipLists.some((r) => r.checked) ||
        this.value.serverSystemNodesSelectedList.some((r) => r.checked)
      )
    },
    hasSelectedPoints() {
      return (
        this.value.points.some((r) => r.checked) ||
        this.value.pointGroups.some((r) => r.checked) ||
        this.value.pointLists.some((r) => r.checked) ||
        this.value.nodes.some((r) => r.checked) ||
        this.value.balanceGroups.some((r) => r.checked) ||
        this.value.addresses.some((r) => r.checked)
      )
    },
    hasSelectedReports() {
      return this.value.reports.some((r) => r.checked)
    },
    localReports() {
      let rows = this.value.reports.slice(0).sort(sortByName)

      const firstIndex =
        (this.reportPageInfo.Page - 1) * this.reportPageInfo.Size
      const lastIndex =
        this.reportPageInfo.Page * this.reportPageInfo.Size > rows.length
          ? rows.length
          : this.reportPageInfo.Page * this.reportPageInfo.Size

      return rows.slice(firstIndex, lastIndex)
    },
    localPoints() {
      let rows = this.value.points
        .concat(
          this.value.pointGroups,
          this.value.pointLists,
          this.value.balanceGroups,
          this.value.nodes,
          this.value.addresses
        )
        .sort(sortByName)

      const firstIndex = (this.pointPageInfo.Page - 1) * this.pointPageInfo.Size
      const lastIndex =
        this.pointPageInfo.Page * this.pointPageInfo.Size > rows.length
          ? rows.length
          : this.pointPageInfo.Page * this.pointPageInfo.Size

      return rows.slice(firstIndex, lastIndex)
    },
    localEquips() {
      let rows = this.value.equips
        .concat(this.value.equipLists)
        .concat(this.value.serverSystemNodesSelectedList)
        .sort(sortByName)

      const firstIndex = (this.equipPageInfo.Page - 1) * this.equipPageInfo.Size
      const lastIndex =
        this.equipPageInfo.Page * this.equipPageInfo.Size > rows.length
          ? rows.length
          : this.equipPageInfo.Page * this.equipPageInfo.Size

      return rows.slice(firstIndex, lastIndex)
    },
    localSubscriptions() {
      let rows = this.subscriptions.slice(0).sort(sortByName)

      const firstIndex =
        (this.subscriptionPageInfo.Page - 1) * this.subscriptionPageInfo.Size
      const lastIndex =
        this.subscriptionPageInfo.Page * this.subscriptionPageInfo.Size >
        rows.length
          ? rows.length
          : this.subscriptionPageInfo.Page * this.subscriptionPageInfo.Size

      return rows.slice(firstIndex, lastIndex)
    },
    isModerator() {
      const groups = this.value.userGroups.map(
        (id) => this.value.groups.find((r) => id === r.id).typeCode
      )
      return groups.includes('admin') || groups.includes('moderator')
    },
    isTabVisible() {
      return (
        this.value.id !== null &&
        !this.isModerator &&
        this.$store.state.user?.userRights.isModerator
      )
    },
    localEquipTypes() {
      let arr = this.equipTypes

      if (this.value.limitEquips) {
        const set = new Set()
        this.value.equipLists.forEach((list) =>
          list.equipTypes.forEach((equipType) => set.add(equipType))
        )
        this.value.equips.forEach((equip) => set.add(equip.equipType))
        arr = [...set]
      }

      return arr.filter(
        (r) =>
          this.$store.state.env.systemMessageTypeEnum.equipEvent.templates[r]
      )
    },
  },
  created() {
    this.$watch(
      () => this.value.reports?.length,
      () => (this.reportPageInfo.Items = this.value.reports?.length)
    )

    this.reportPageInfo.Items = this.value.reports.length

    this.$watch(
      () =>
        this.value.points.concat(
          this.value.pointGroups,
          this.value.pointLists,
          this.value.balanceGroups,
          this.value.nodes,
          this.value.addresses
        ).length,
      (value) => (this.pointPageInfo.Items = value)
    )

    this.pointPageInfo.Items = this.value.points.concat(
      this.value.pointGroups,
      this.value.pointLists,
      this.value.balanceGroups,
      this.value.nodes,
      this.value.addresses
    ).length

    this.$watch(
      () =>
        this.value.equips
          .concat(this.value.equipLists)
          .concat(this.value.serverSystemNodesSelectedList).length,
      (value) => (this.equipPageInfo.Items = value)
    )

    this.equipPageInfo.Items = this.value.equips
      .concat(this.value.equipLists)
      .concat(this.value.serverSystemNodesSelectedList).length

    this.$watch(
      () => this.subscriptions.length,
      (value) => (this.subscriptionPageInfo.Items = value)
    )

    this.subscriptionPageInfo.Items = this.subscriptions.length
  },
  mounted() {
    this.$emit('mounted')
    this.edit(this.id)
    this.getEquipTree()
  },
  beforeUnmount() {
    abortController.abort()
    this.$store.state.equip.equipChildren = []
  },
  watch: {
    localEquipTypes(value) {
      if (this.subscriptionData) {
        this.subscriptionData.equipTypes = value
      }
    },
    'value.limitEquips': function (value) {
      if (this.subscriptionData) {
        this.subscriptionData.limitEquips = value
      }
    },
    'value.limitPoints': function (value) {
      if (this.subscriptionData) {
        this.subscriptionData.limitPoints = value
      }
    },
    'value.equips': function (value) {
      if (this.subscriptionData) {
        this.subscriptionData.allowedEquips = JSON.parse(JSON.stringify(value))
      }
    },
    'value.equipLists': function (value) {
      if (this.subscriptionData) {
        this.subscriptionData.allowedEquipLists = JSON.parse(
          JSON.stringify(value)
        )
      }
    },
    'value.notificationServers': function (value) {
      if (this.subscriptionData) {
        this.subscriptionData.notificationServers = JSON.parse(
          JSON.stringify(value)
        )
      }
    },
    'value.notificationAddresses': function (value) {
      if (this.subscriptionData) {
        this.subscriptionData.notificationAddresses = JSON.parse(
          JSON.stringify(value)
        )
      }
    },
    'value.points': function (value) {
      if (this.subscriptionData) {
        this.subscriptionData.allowedPoints = JSON.parse(JSON.stringify(value))
      }
    },
    'value.addresses': function (value) {
      if (this.subscriptionData) {
        this.subscriptionData.allowedPoints = JSON.parse(JSON.stringify(value))
      }
    },
    'value.serverSystemNodesSelectedList': function (value) {
      if (this.subscriptionData) {
        this.subscriptionData.allowedEquips = JSON.parse(JSON.stringify(value))
      }
    },
    'value.pointLists': function (value) {
      if (this.subscriptionData) {
        this.subscriptionData.allowedPointLists = JSON.parse(
          JSON.stringify(value)
        )
      }
    },
    'value.pointGroups': function (value) {
      if (this.subscriptionData) {
        this.subscriptionData.allowedPointGroups = JSON.parse(
          JSON.stringify(value)
        )
      }
    },
    'value.nodes': function (value) {
      if (this.subscriptionData) {
        this.subscriptionData.allowedNodes = JSON.parse(JSON.stringify(value))
      }
    },
    'value.balanceGroups': function (value) {
      if (this.subscriptionData) {
        this.subscriptionData.allowedBalanceGroups = JSON.parse(
          JSON.stringify(value)
        )
      }
    },
  },
  methods: {
    onFullNameChange(value) {
      this.$emit('fullNameChange', value)
    },
    getImage(item) {
      return getImage.call(this, item)
    },
    changeAllEquips() {
      this.value.equips.forEach((r) => (r.checked = this.allEquips))
      this.value.equipLists.forEach((r) => (r.checked = this.allEquips))
      this.value.serverSystemNodesSelectedList.forEach(
        (r) => (r.checked = this.allEquips)
      )
    },
    changeAllPoints() {
      this.value.points.forEach((r) => (r.checked = this.allPoints))
      this.value.pointLists.forEach((r) => (r.checked = this.allPoints))
      this.value.pointGroups.forEach((r) => (r.checked = this.allPoints))
      this.value.nodes.forEach((r) => (r.checked = this.allPoints))
      this.value.balanceGroups.forEach((r) => (r.checked = this.allPoints))
      this.value.addresses.forEach((r) => (r.checked = this.allPoints))
    },
    changeAllSubscriptions() {
      this.subscriptions.forEach((r) => (r.checked = this.allSubscriptions))
    },
    changeAllReports() {
      this.value.reports.forEach((r) => (r.checked = this.allReports))
    },
    onChangeReportPage(page, size) {
      this.reportPageInfo.Size = size
      this.reportPageInfo.Page = page
    },
    onChangePointPage(page, size) {
      this.pointPageInfo.Size = size
      this.pointPageInfo.Page = page
    },
    onChangeEquipPage(page, size) {
      this.equipPageInfo.Size = size
      this.equipPageInfo.Page = page
    },
    onChangeSubscriptionPage(page, size) {
      this.subscriptionPageInfo.Size = size
      this.subscriptionPageInfo.Page = page
    },
    onAddSubscriptionClick() {
      this.wizardSubscription = wizardSubscriptionAdd({
        id: null,
        name: null,
        priority: 'normal',
        includeRelatedEquips: false,
        includeRelatedMeasureSchemes: false,
        subscriptions: this.subscriptions,
      })
    },
    onRemoveSubscriptionClick() {
      this.wizardSubscription = wizardSubscriptionRemove()
    },
    cancelWizardSubscription() {
      this.wizardSubscription = null
    },
    onWizardSubscriptionEnd(data, name) {
      this.wizardSubscription = null
      if (name === 'add') {
        let sub = new Subscription(data)
        sub.type = this.itemTypes.notification
        sub.checked = false
        this.subscriptions.push(sub)
      } else if (name === 'remove') {
        this.subscriptions = this.subscriptions.filter((r) => !r.checked)
      } else if (name === 'edit') {
        let subscription = this.subscriptions.find((r) => r.id === data.id)
        if (subscription) {
          Object.entries(data).forEach(([key, value]) => {
            if (Object.prototype.hasOwnProperty.call(subscription, key)) {
              subscription[key] = value
            }
          })
        }
      }

      this.hasChanges = true
    },
    onAddReportClick() {
      this.wizardReport = wizardReportAdd(
        this.$http,
        this.value.reports.map((r) => r.id)
      )
    },
    onRemoveReportClick() {
      this.wizardReport = wizardReportRemove()
    },
    onWizardReportEnd(data, name) {
      this.wizardReport = null

      if (name === 'remove') {
        this.value.reports = this.value.reports.filter((r) => !r.checked)
      } else if (name === 'add') {
        data.forEach((r) => (r.checked = false))
        this.value.reports = this.value.reports.concat(data)
      }

      this.hasChanges = true
    },
    cancelWizardReport() {
      this.wizardReport = null
    },
    onAddPointClick() {
      this.wizardPoint = wizardPointAdd(
        this.$http,
        this.value.points.map((r) => r.id),
        this.value.pointLists.map((r) => r.id),
        this.value.pointGroups.map((r) => r.id),
        this.value.balanceGroups,
        this.value.nodes.map((r) => r.id),
        this.value.addresses.map((r) => r.id)
      )
    },
    onRemovePointClick() {
      this.wizardPoint = wizardPointRemove()
    },
    onWizardPointEnd(data, name) {
      this.wizardPoint = null

      if (name === 'remove') {
        // eslint-disable-next-line no-extra-semi
        ;[
          'points',
          'pointLists',
          'pointGroups',
          'balanceGroups',
          'nodes',
          'addresses',
        ].forEach(
          (key) => (this.value[key] = this.value[key].filter((r) => !r.checked))
        )
      } else if (name === 'add') {
        data.forEach((r) => (r.checked = false))

        this.value.points = this.value.points.concat(
          data.filter((r) => this.itemTypes.point === r.type)
        )
        this.value.addresses = this.value.addresses.concat(
          data.filter((r) => {
            r.type = FULL_ADDRESS_TYPE
            return this.itemTypes.address === r.type
          })
        )
        this.value.pointLists = this.value.pointLists.concat(
          data.filter(
            (r) => this.$store.state.env.itemTypes[r.type].type === 'pointList'
          )
        )
        this.value.pointGroups = this.value.pointGroups.concat(
          data.filter(
            (r) => this.$store.state.env.itemTypes[r.type].type === 'pointGroup'
          )
        )
        this.value.balanceGroups = this.value.balanceGroups.concat(
          data.filter(
            (r) =>
              this.$store.state.env.itemTypes[r.type].type === 'balanceGroup'
          )
        )
        this.value.nodes = this.value.nodes.concat(
          data.filter(
            (r) => this.$store.state.env.itemTypes[r.type].type === 'node'
          )
        )
      }

      this.hasChanges = true
    },
    cancelWizardPoint() {
      this.wizardPoint = null
    },
    onAddEquipClick() {
      this.wizardEquip = wizardEquipAdd(
        this.$http,
        this.value.equips.map((r) => r.id),
        this.value.equipLists.map((r) => r.id),
        this.value.serverSystemNodesSelectedList.map((r) => r.id)
      )
    },
    onRemoveEquipClick() {
      this.wizardEquip = wizardEquipRemove()
    },
    onWizardEquipEnd(data, name) {
      this.wizardEquip = null

      if (name === 'remove') {
        // eslint-disable-next-line no-extra-semi
        ;['equips', 'equipLists', 'serverSystemNodesSelectedList'].forEach(
          (key) => (this.value[key] = this.value[key].filter((r) => !r.checked))
        )
      } else if (name === 'add') {
        data.forEach((r) => (r.checked = false))

        this.value.equips = this.value.equips.concat(
          data.filter(
            (r) => this.$store.state.env.itemTypes[r.type].type === 'equip'
          )
        )
        this.value.equipLists = this.value.equipLists.concat(
          data.filter(
            (r) => this.$store.state.env.itemTypes[r.type].type === 'equipList'
          )
        )
        this.value.serverSystemNodesSelectedList =
          this.value.serverSystemNodesSelectedList.concat(
            data.filter(
              (r) =>
                this.$store.state.env.itemTypes[r.type].type === 'systemNode'
            )
          )
      }

      this.hasChanges = true
    },
    cancelWizardEquip() {
      this.wizardEquip = null
    },
    onChangeEvent(prop, value) {
      let obj = this.value
      let arr = prop.split('.')
      let lastProp = null

      for (let i = 0; i < arr.length; i++) {
        lastProp = arr[i]
        if (i !== arr.length - 1) {
          obj = obj[lastProp]
        }
      }

      obj[lastProp] = value

      this.hasChanges = true
    },
    onChangeAllow(key, value) {
      if (value === true) {
        if (this.userRights[key].parent) {
          if (!this.userRights[this.userRights[key].parent].allow) {
            this.onChangeAllow(this.userRights[key].parent, true)
          }
        }

        this.userRights[key].deny = false
      }
      this.userRights[key].allow = value

      this.hasChanges = true
    },
    onChangeDeny(key, value) {
      if (value === false) {
        if (this.userRights[key].parent) {
          if (this.userRights[this.userRights[key].parent].deny) {
            this.onChangeDeny(this.userRights[key].parent, false)
          }
        }
      } else {
        this.userRights[key].allow = false
        Object.values(this.userRights)
          .filter((r) => r.parent === key)
          .forEach((r) => {
            r.deny = true
            r.allow = false
          })
      }
      this.userRights[key].deny = value

      this.hasChanges = true
    },
    onTabClick(name) {
      if (name === 'certificate' && this.cert === null && !this.certRunned) {
        this.getCert(this.id)
      }
    },
    onCreateCertClick() {
      this.wizardCert = wizardCert('create')
    },
    onTrustCertClick() {
      this.wizardCert = wizardCert('trust')
    },
    onWizardCertEnd(data, name) {
      this.wizardCert = null

      if (name === 'trust') {
        this.trustCert(this.id, data, this.cert.thumbprint)
      } else if (name === 'create') {
        this.createCert(this.id, data)
      }
    },
    cancelWizardCert() {
      this.wizardCert = null
    },
    getUserRights() {
      const keys = Object.keys(this.userRights).filter((r) => {
        switch (r) {
          case 'userEdit':
            return this.isModerator
          case 'dataExport':
            return this.isModerator
          case 'schemeEdit':
            return this.$store.state.user?.userRights.allowSchemes
          case 'redirectEndpointEdit':
            return this.$store.state.user?.userRights.redirectEndpointEdit
          case 'loRaServerEdit':
            return this.$store.state.user?.userRights.allowLoRa
          default:
            return true
        }
      })

      return Object.assign(
        {},
        ...keys.map((r) => ({ [r]: this.userRights[r] }))
      )
    },
    getGroupRights() {
      let summary = {}
      this.value.userGroups.forEach((id) => {
        const groupRights =
          this.groupsRights[this.value.groups.find((r) => id === r.id).typeCode]

        if (groupRights) {
          Object.entries(groupRights).forEach(([k, v]) => {
            if (Object.prototype.hasOwnProperty.call(summary, k)) {
              summary[k] = summary[k] && v
            } else {
              summary[k] = v
            }
          })
        }
      })

      return summary
    },
    getObjectRights() {
      let summary = {}

      if (this.value.limitEquips) {
        summary['equipEditFull'] = false
        summary['dataImportDefines'] = false
      }

      if (this.value.limitPoints) {
        summary['measureSchemeEditFull'] = false
        summary['dataImportDefines'] = false
      }

      if (this.value.limitReports) {
        summary['reportEdit'] = false
      }

      return summary
    },
    subscriptionClose() {
      this.subscriptionEdit = false
    },

    async viewSubscriptionClick(r, index) {
      r.equipTypes = this.localEquipTypes
      r.limitEquips = this.value.limitEquips
      r.limitPoints = this.value.limitPoints
      r.allowedEquips = JSON.parse(JSON.stringify(this.value.equips))
      r.allowedEquipLists = JSON.parse(JSON.stringify(this.value.equipLists))
      r.allowedPoints = JSON.parse(JSON.stringify(this.value.points))
      r.allowedPointLists = JSON.parse(JSON.stringify(this.value.pointLists))
      r.allowedPointGroups = JSON.parse(JSON.stringify(this.value.pointGroups))
      r.allowedNodes = JSON.parse(JSON.stringify(this.value.nodes))
      r.allowedBalanceGroups = JSON.parse(
        JSON.stringify(this.value.balanceGroups)
      )
      r.subscriptions = this.subscriptions
      r.type = this.matchType(this.$store.state.env.itemTypes).notification
      r.notificationServers = await this.value.notificationServers
      r.notificationAddresses = await this.value.notificationAddresses

      this.subscriptionData = r
      this.subscriptionComponentText = r.name
      this.subscriptionEdit = true
      this.subscriptionData.servers = localServers

      this.$store.state.equip.notificationIndex = index
    },
    onSaveSubscriptionClick(data) {
      Object.keys(data).forEach((k) => (this.subscriptionData[k] = data[k]))
      this.hasChanges = true
      this.subscriptionEdit = false
      this.value.notificationServers = this.subscriptionData.notificationServers
      this.value.notificationAddresses =
        this.subscriptionData.notificationAddresses
    },

    getState(id) {
      const result = this.$store.state.equip.equipChildren.find(
        (r) => r.id === id
      )
      return result ? result.state : 0
    },
    async getEquipTree() {
      try {
        let { data } = await this.$http.get('tree/getEquipTree')

        if (
          data[1]?.text === 'Приборы' &&
          Array.isArray(data[1].children) &&
          data[1]?.children.length > 0
        ) {
          this.$store.state.equip.equipChildren = data[1].children
        }
      } catch (error) {
        this.$store.commit('error', error)
      }
    },
    getSystemNode(serverSystemNodesSelected) {
      const result = serverSystemNodesSelected.map((data) => ({
        id: data.id,
        type: 18,
        equipType: '',
        name: data.name,
        connectionGroupType: 8,
        state: this.getState(data.id),
        checked: false,
      }))

      return result
    },

    async edit(id) {
      try {
        const {
          data: {
            data: { user, maps },
          },
        } = await this.$http.get('user/user', { params: { id } })

        if (this.$store.state.user?.userRights.isModerator) {
          let { data } = await this.$http.get('address/addresses')
          localAddresses = data
        }

        if (user.serverSystemNodesSelectedList) {
          user.serverSystemNodesSelectedList = this.getSystemNode(
            user.serverSystemNodesSelectedList
          )
        }

        if (user.addresses) {
          user.addresses = user.addresses.map((id) => ({
            id,
            type: FULL_ADDRESS_TYPE,
            systemType: 2,
            state: -1, //  color violet: 2 green: 0
            name: localAddresses
              ? localAddresses.find((r) => r.id === id)?.name
              : FULL_ADDRESS_NAME,
            checked: false,
          }))
        }
        if (user.servers) {
          localServers = user.servers
        }
        if (user.equips) user.equips.forEach((r) => (r.checked = false))
        if (user.equipLists) user.equipLists.forEach((r) => (r.checked = false))
        if (user.notificationServers)
          user.notificationServers.forEach((r) => (r.checked = false))
        if (user.notificationAddresses)
          user.notificationAddresses.forEach((r) => (r.checked = false))

        if (user.reports) user.reports.forEach((r) => (r.checked = false))
        if (user.points) user.points.forEach((r) => (r.checked = false))
        if (user.pointGroups)
          user.pointGroups.forEach((r) => (r.checked = false))
        if (user.pointLists) user.pointLists.forEach((r) => (r.checked = false))
        if (user.nodes) user.nodes.forEach((r) => (r.checked = false))

        user.subscriptions.forEach((r) => (r.checked = false))
        this.subscriptions = user.subscriptions

        if (user.equipTypes) this.equipTypes = user.equipTypes
        if (user.groupsRights) this.groupsRights = user.groupsRights
        if (user.userRights) this.userRights = user.userRights

        this.value = new User(user)

        Object.values(maps).forEach((r) => r.connections.sort())
        this.maps = maps
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.loading = false
      }
    },
    async save() {
      try {
        this.saving = true

        await this.$refs.userProps.save(this.userRights, this.subscriptions)
        this.hasChanges = false
      } catch (error) {
        if (error.response?.status === 551) {
          this.error = error.response.data
        } else {
          this.$store.commit('error', error)
        }
      } finally {
        this.saving = false
      }
    },
    async getCert(id) {
      this.waitCert = true

      try {
        const { data } = await this.$http.get(
          'asHelper/certificate',
          { params: { id } },
          { signal: abortController.signal }
        )

        this.cert = data.data
        this.certRunned = true
      } catch (error) {
        if (!abortController.signal.aborted) {
          this.$store.commit('error', error)
        }
      } finally {
        this.waitCert = false
      }
    },
    async createCert(id, password) {
      this.waitCert = true

      try {
        const { data } = await this.$http.post(
          'asHelper/certificate',
          { id, password },
          { signal: abortController.signal }
        )

        this.cert = data.data
      } catch (error) {
        if (!abortController.signal.aborted) {
          this.$store.commit('error', error)
        }
      } finally {
        this.waitCert = false
      }
    },
    async trustCert(id, password, thumbprint) {
      this.waitCert = true

      try {
        await this.$http.post(
          'asHelper/trustCertificate',
          { id, password, thumbprint },
          { signal: abortController.signal }
        )
      } catch (error) {
        if (!abortController.signal.aborted) {
          this.$store.commit('error', error)
        }
      } finally {
        this.waitCert = false
      }
    },
  },
}
</script>

<style scoped>
.cert-grid {
  display: grid;
  gap: 5px 3px;
  align-items: center;
}

.cert-grid.two {
  grid-template-columns: max-content max-content;
}

.cert-grid label {
  text-align: right;
}

.cert-grid div {
  padding: 2px 4px;
}

.cert-grid button {
  width: min-content;
}

.system-props-points-container {
  padding: 0 auto;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  gap: 0 100px;
}
.system-props-points-item {
  max-width: 50%;
  /* justify-content: stretch; */
}

.footer {
  display: grid;
  gap: 5px 3px;
  grid-template-columns: min-content min-content;
  justify-content: end;
  padding: 5px;
  width: 100%;
  background-color: #f6f8fb;
}
</style>
