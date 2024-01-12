import { createStore } from 'vuex'

import Mu from './model/mu.js'
import { matchType } from './api.js'

type EnumType = {
  [key: string]: any
};

type UnitGroupType = {
  [key: string]: {
    default: number,
    text: string,
    type: string,
    units: Array<number>,
    value: number
  }
};

interface Env {
  archiveTypes: any
  connectionGroupTypes: any,
  equipTypeCodes: any,
  exportFileFormats: EnumType,
  itemTypes: EnumType
  mUnitGroups: UnitGroupType,
  pollDataTypes: any
  reportDataSource: any
  reportObjectTypes: any
  reportPeriodTypes: EnumType,
  reportTaskRunPeriod: EnumType,
  reportTaskRunTypes: EnumType,
  reportTaskSourceEquip: EnumType,
  reportTaskSourcePoint: EnumType,
  reportTypes: EnumType,
  resultTypes: any,
  seasonTypes: any
  setTypes: EnumType
}

const env: Env = {
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
  resultTypes: {"0":{"type":"success","text":"Success"},"1":{"type":"error","text":"Error"}},
  seasonTypes: {},
  setTypes: {}
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
        hour: '2-digit'
      },
      day: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      },
      month: {
        year: 'numeric',
        month: 'long'
      }
    },
    env,
    error: null,
    notification: null,
    pageInfo: {
      Page: 1,
      Size: 50,
      Items: 0
    },
    user: null,
    vsp: {
      isOpened: false
    },
    weather: null
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
      Object.keys(payload.mUnits).forEach(r => {
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
    }
  },
  getters: {
    styleColors: state => {
      return {
        color: state.colors.text,
        backgroundColor: state.colors.fill
      }
    },
    reversedArchiveTypes: state => matchType(state.env.archiveTypes),
    reversedItemTypes: state => matchType(state.env.itemTypes),
    reversedReportDataSource: state => matchType(state.env.reportDataSource),
    reversedSeasonTypes: state => matchType(state.env.seasonTypes),
    pageInfo: state => Object.assign({}, state.pageInfo),
    pollDataTypes: state => matchType(state.env.pollDataTypes),
    dateFormat: state => JSON.parse(JSON.stringify(state.dateFormat))
  },
  actions: {}
})
