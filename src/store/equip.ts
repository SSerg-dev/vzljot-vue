
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
  equipSettingHeight: number | null
  equipSettingTable: EquipSettingTable | null
  equipSettingTableArray: EquipSettingTable[] | null
  hasNotSave: boolean | null
  validateTypes: ValidateTypes | null 
  hasSetDataColdWater: boolean | null
  timeZonesType: number | null
   
}

export interface EquipSettingTable {
  id: number | null
  equipId: number | null
  equipSettingId?: number | null
  timeStart?: Date | null
  properties: number | null
  index: number | null
}

const equipSettingTable: EquipSettingTable = {
  id: null,
  equipId: null,
  equipSettingId: null,
  timeStart: null,
  properties: null,
  index: -1
}

interface ValidateTypes {
  date: string | null
}

const validateTypes: ValidateTypes = { 
  date: 'nodate'
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
  equipSettingHeight: 0,
  equipSettingTable: null,
  equipSettingTableArray: null,
  hasNotSave: false,
  validateTypes: validateTypes || null,
  hasSetDataColdWater: null, 
  timeZonesType: null
}
