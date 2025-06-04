import { createStore } from 'vuex'

import Mu from '@/plugins/model/mu.js'
import { matchType } from '@/plugins/api'

import { Card, card } from '@/store/card'
import { Equip, equip } from '@/store/equip'
import { Balance, balance } from './balance'

type EnumType = {
  [key: string]: any
}

type UnitGroupType = {
  [key: string]: {
    default: number
    text: string
    type: string
    units: Array<number>
    value: number
  }
}

interface Env {
  pointTypes: any
  statuses: any
  archiveTypes: any
  connectionGroupTypes: any
  equipTypeCodes: any
  exportFileFormats: EnumType
  itemTypes: EnumType
  mUnitGroups: UnitGroupType
  pollDataTypes: any
  reportDataSource: any
  reportObjectTypes: any
  reportPeriodTypes: EnumType
  reportTaskRunPeriod: EnumType
  reportTaskRunTypes: EnumType
  reportTaskSourceEquip: EnumType
  reportTaskSourcePoint: EnumType
  reportTypes: EnumType
  resultTypes: any
  seasonTypes: any
  setTypes: EnumType
  timeZones: any[]
  timeZonesSystem: any[]
}

const env: Env = {
  pointTypes: {},
  statuses: {},
  archiveTypes: {},
  connectionGroupTypes: {},
  equipTypeCodes: {},
  exportFileFormats: {},
  itemTypes: {},
  mUnitGroups: {},
  pollDataTypes: {},
  reportDataSource: {},
  reportObjectTypes: {},
  reportPeriodTypes: {},
  reportTaskRunPeriod: {},
  reportTaskRunTypes: {},
  reportTaskSourceEquip: {},
  reportTaskSourcePoint: {},
  reportTypes: {},
  resultTypes: {
    '0': { type: 'success', text: 'Success' },
    '1': { type: 'error', text: 'Error' },
  },
  seasonTypes: {},
  setTypes: {},
  timeZones: [],
  timeZonesSystem: [],
}

interface State {
  collator: any
  colors: any | null
  connection: any | null
  dateFormat: any
  env: Env
  error: any | null
  notification: any | null
  pageInfo: any
  user: any
  vsp: any
  weather: any | null
  card: Card
  equip: Equip
  balance: Balance
  displayIn?: number
}

export const store = createStore<State>({
  state: {
    collator: new Intl.Collator(['en-US', 'ru-RU']),
    colors: null,
    connection: null,
    dateFormat: {
      hour: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
      },
      day: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      },
      month: {
        year: 'numeric',
        month: 'long',
      },
    },
    env,
    error: null,
    notification: null,
    pageInfo: {
      Page: 1,
      Size: 50,
      Items: 0,
    },
    user: null,
    vsp: {
      isOpened: false,
    },
    weather: null,
    card,
    equip,
    balance,
  },
  mutations: {
    notification(state, payload) {
      if (payload.error) {
        console.log('Ошибка:', payload.error)
      }
      state.notification = payload
    },
    error(state, payload) {
      state.error = payload
    },
    setColors(state, payload) {
      state.colors = payload
    },
    connection(state, payload) {
      state.connection = payload
    },
    env(state, payload) {
      Object.keys(payload.mUnits).forEach((r) => {
        payload.mUnits[r] = new Mu(payload.mUnits[r])
      })
      state.env = payload
    },
    user(state, payload) {
      state.user = payload
    },
    vsp(state, payload) {
      state.vsp = payload
    },
    weather(state, payload) {
      state.weather = payload
    },

    setCard(state, payload) {
      if (typeof payload.isCardSelected === 'boolean')
        state.card.isCardSelected = payload.isCardSelected
      if (typeof payload.isInfoChanged === 'boolean')
        state.card.isInfoChanged = payload.isInfoChanged
      if (payload.viewData) state.card.viewData = payload.viewData
      if (payload.selectedNodeId)
        state.card.selectedNodeId = payload.selectedNodeId
      if (payload.selectedLastNodeId)
        state.card.selectedLastNodeId = payload.selectedLastNodeId
      if (payload.modifications)
        state.card.modifications = payload.modifications
      if (payload.interval) state.card.interval = payload.interval
      if (payload.equipTypeModificationId)
        state.card.equipTypeModificationId = payload.equipTypeModificationId
      if (payload.timeLastChecking)
        state.card.timeLastChecking = payload.timeLastChecking
      if (payload.timeNextChecking)
        state.card.timeNextChecking = payload.timeNextChecking
      if (payload.nodeChange) state.card.nodeChange = payload.nodeChange
      if (payload.nodeCreate) state.card.nodeCreate = payload.nodeCreate
      if (typeof payload.isNodeCreate === 'boolean')
        state.card.isNodeCreate = payload.isNodeCreate
    },

    setEquip: (state, payload) => {
      if (payload.equipId) state.equip.equipId = payload.equipId
      if (payload.equipTypeId) state.equip.equipTypeId = payload.equipTypeId
      if (payload.id) state.equip.id = payload.id
      if (payload.uuid) state.equip.uuid = payload.uuid
      if (payload.name) state.equip.name = payload.name
      if (payload.serialNumber) state.equip.serialNumber = payload.serialNumber
      if (payload.equipTypeName)
        state.equip.equipTypeName = payload.equipTypeName
      if (payload.equipSetting) state.equip.equipSetting = payload.equipSetting

      if (payload.equipSettingSave) {
        if (state.equip.equipSettingSave !== null) {
          const index = state.equip.equipSettingSave.findIndex(
            (item) => item.name === payload.equipSettingSave.name
          )
          if (index !== -1) {
            state.equip.equipSettingSave.splice(
              index,
              1,
              payload.equipSettingSave
            )
          } else {
            state.equip.equipSettingSave.push(payload.equipSettingSave)
          }
        } else {
          state.equip.equipSettingSave = [payload.equipSettingSave]
        }
      }

      if (payload.equipSettingTable)
        state.equip.equipSettingTable = payload.equipSettingTable

      if (payload.equipSettingIndex > -1)
        state.equip.equipSettingIndex = payload.equipSettingIndex
      if (payload.hasSaved) state.equip.hasSaved = payload.hasSaved
      if (typeof payload.hasEquipSettingEdit === 'boolean') {
        state.equip.hasEquipSettingEdit = payload.hasEquipSettingEdit
      }
      if (typeof payload.hasVegaEquip === 'boolean') {
        state.equip.hasVegaEquip = payload.hasVegaEquip
      }
      if (payload.groupType) state.equip.groupType = payload.groupType
      if (payload.connectionGroup)
        state.equip.connectionGroup = payload.connectionGroup
      if (payload.devEUI) {
        state.equip.devEUI = payload.devEUI
      }
    },
  },
  getters: {
    styleColors: (state) => {
      return {
        color: state.colors.text,
        backgroundColor: state.colors.fill,
      }
    },
    getCard: (state) => {
      return {
        isCardSelected: state.card.isCardSelected,
        isInfoChanged: state.card.isInfoChanged,
        viewData: state.card.viewData,
        selectedNodeId: state.card.selectedNodeId,
        selectedLastNodeId: state.card.selectedLastNodeId,
        modifications: state.card.modifications,
        interval: state.card.interval,
        equipTypeModificationId: state.card.equipTypeModificationId,
        timeLastChecking: state.card.timeLastChecking,
        timeNextChecking: state.card.timeNextChecking,
        nodeChange: state.card.nodeChange,
        nodeCreate: state.card.nodeCreate,
        isNodeCreate: state.card.isNodeCreate,
      }
    },
    getEquip: (state) => {
      return {
        equipId: state.equip.equipId,
        equipTypeId: state.equip.equipTypeId,
        id: state.equip.id,
        uuid: state.equip.uuid,
        name: state.equip.name,
        serialNumber: state.equip.serialNumber,
        equipTypeName: state.equip.equipTypeName,
        equipSetting: state.equip.equipSetting,
        equipSettingSave: state.equip.equipSettingSave,
        equipSettingIndex: state.equip.equipSettingIndex,
        hasSaved: state.equip.hasSaved,
        hasEquipSettingEdit: state.equip.hasEquipSettingEdit,
        hasVegaEquip: state.equip.hasVegaEquip,
        groupType: state.equip.groupType,
        connectionGroup: state.equip.connectionGroup,
      }
    },

    reversedArchiveTypes: (state) => matchType(state.env.archiveTypes),
    reversedItemTypes: (state) => matchType(state.env.itemTypes),
    reversedReportDataSource: (state) => matchType(state.env.reportDataSource),
    reversedSeasonTypes: (state) => matchType(state.env.seasonTypes),
    pageInfo: (state) => Object.assign({}, state.pageInfo),
    pollDataTypes: (state) => matchType(state.env.pollDataTypes),
    dateFormat: (state) => JSON.parse(JSON.stringify(state.dateFormat)),
  },
  actions: {},
})
