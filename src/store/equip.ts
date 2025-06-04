export interface Equip {
  equipId: number | null
  equipTypeId: number | null
  id: number | null
  uuid: string | null
  name: string | null
  serialNumber: string | null
  equipTypeName: string | null
  equipSetting: any[] | null
  equipSettingSave: any[] | null
  equipSettingIndex: number | null
  equipSettingTable: EquipSettingTable | null
  equipSettingTableArray: EquipSettingTable[] | null
  hasSaved: boolean | null
  validateTypes: ValidateTypes | null
  hasSetDataColdWater: boolean | null
  hasTimeSync: boolean | null
  timeZonesType: number | null
  timeZonesTypeSystem: number | null
  hasEquipSettingEdit: boolean
  hasVegaEquip: boolean
  hasVegaEquipArray: any[]
  groupType: number | null
  connectionGroup: object | null
  groupConnectionType: number | null
  loRaAdapter: number | null
  versionParamKeys: object | null
  equipEvent: EquipEvent | null
  equipTopNav: EquipTopNav | null
  systemNodeType: string | null
  serverSystemNodesSelected: any[]
  equipChildren: any[]
  devEUI: number | null
  notificationServers: any[]
  notificationAddresses: any[]
  notificationIndex: number | null
  userId: number | null
  equipError: any 
}

export interface EquipSettingTable {
  id: number | null
  equipId: number | null
  equipSettingId?: number | null
  timeStart?: Date | null
  properties: number | null
  index: number | null
  action: string | null
}

export interface EquipEvent {
  hasCloseNotSave: boolean
  hasChangeNotSave: boolean
  hasChangeSave: boolean
  hasConfirmSave: boolean
  hasExistDateSet: boolean
  hasEmptyDateSet: boolean
  hasModificationDateSet: boolean
  hasChangeSystemNode: boolean
}

export interface EquipModalEvent {
  hasOkVisible: boolean
  hasCancelVisible: boolean
}

export interface EquipTopNav {
  hasParam: boolean
  hasSetting: boolean
  hasReport: boolean
  hasArchive: boolean
  hasData: boolean
  hasForm: boolean
  hasScheme: boolean
  hasReadyReport: boolean
  hasFile: boolean
  hasState: boolean
  hasNotify: boolean
  hasLog: boolean
}

interface ValidateTypes {
  date: string | null
}

const validateTypes: ValidateTypes = {
  date: 'nodate',
}

export const equip: Equip = {
  equipId: null,
  equipTypeId: null,
  id: null,
  uuid: null,
  name: null,
  serialNumber: null,
  equipTypeName: null,
  equipSetting: null,
  equipSettingSave: null,
  equipSettingIndex: -1,
  equipSettingTable: null,
  equipSettingTableArray: null,
  hasSaved: false,
  validateTypes: validateTypes || null,
  hasSetDataColdWater: null,
  hasTimeSync: null,
  timeZonesType: null,
  timeZonesTypeSystem: null,
  hasEquipSettingEdit: false,
  hasVegaEquip: false,
  hasVegaEquipArray: [null],
  groupType: null,
  connectionGroup: {},
  groupConnectionType: -1,
  loRaAdapter: -1,
  versionParamKeys: {},
  equipEvent: {
    hasCloseNotSave: false,
    hasChangeNotSave: false,
    hasChangeSave: false,
    hasConfirmSave: false,
    hasExistDateSet: false,
    hasEmptyDateSet: false,
    hasModificationDateSet: false,
    hasChangeSystemNode: false,
  },
  equipTopNav: {
    hasParam: false,
    hasSetting: false,
    hasReport: false,
    hasArchive: false,
    hasData: false,
    hasForm: false,
    hasScheme: false,
    hasReadyReport: false,
    hasFile: false,
    hasState: false,
    hasNotify: false,
    hasLog: false,
  },
  systemNodeType: null,
  serverSystemNodesSelected: [],
  equipChildren: [],
  devEUI: null,
  notificationServers: [],
  notificationAddresses: [],
  notificationIndex: null,
  userId: -1,
  equipError: null,
}
