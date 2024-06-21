import BaseObject from './base/baseObject'
import { CustomPropertyTypeEnum } from './enum/CustomPropertyTypeEnum'
import { store } from '@/store/store'
import { EquipSettingTable } from '@/store/equip'

export class EquipError {
  name?: string
  equipType?: string
  serialNumber?: string
  networkId?: string
  busAddress?: string
  pollDataType?: string
  periodArchive?: string
  periodSetParams?: string
  periodEquipEvents?: string
  periodEquipCustomizing?: string
  periodSetDataColdWater?: string
  periodColdWater?: string
  periodEquipDatabaseParams?: string
  periodTimeSync?: string
  set?: string
  margin?: string
  source?: string
  password?: string
  group?: object

  constructor({
    name = '',
    equipType = '',
    serialNumber = '',
    networkId = '',
    pollDataType = '',
    periodArchive = '',
    periodSetParams = '',
    periodEquipEvents = '',
    periodEquipCustomizing = '',
    periodSetDataColdWater = '',
    periodColdWater = '',
    periodEquipDatabaseParams = '',
    periodTimeSync = '',
    set = '',
    margin = '',
    source = '',
    password = '',
    group = undefined,
  }: {
    name?: string
    equipType?: string
    serialNumber?: string
    networkId?: string
    pollDataType?: string
    periodArchive?: string
    periodSetParams?: string
    periodEquipEvents?: string
    periodEquipCustomizing?: string
    periodSetDataColdWater?: string
    periodColdWater?: string
    periodEquipDatabaseParams?: string
    periodTimeSync?: string
    set?: string
    margin?: string
    source?: string
    password?: string
    group?: object
  }) {
    if (name) this.name = name
    if (equipType) this.equipType = equipType
    if (serialNumber) this.serialNumber = serialNumber
    if (networkId) this.networkId = networkId
    if (pollDataType) this.pollDataType = pollDataType
    if (periodArchive) this.periodArchive = periodArchive
    if (periodSetParams) this.periodSetParams = periodSetParams
    if (periodEquipEvents) this.periodEquipEvents = periodEquipEvents
    if (periodEquipCustomizing)
      this.periodEquipCustomizing = periodEquipCustomizing
    if (periodSetDataColdWater)
      this.periodSetDataColdWater = periodSetDataColdWater
    if (periodColdWater) this.periodColdWater = periodColdWater
    if (periodEquipDatabaseParams)
      this.periodEquipDatabaseParams = periodEquipDatabaseParams
    if (periodTimeSync) this.periodTimeSync = periodTimeSync
    if (set) this.set = set
    if (margin) this.margin = margin
    if (source) this.source = source
    if (password) this.password = password
    if (group) this.group = group
  }
}

type EquipType = {
  name: string
  code: number
  defaultBusAddress: number
  password?: string
  protocols?: object
}

interface IEquip {
  uuid?: string
  id?: number
  parentId?: number
  type?: number | null
  name?: string
  note?: string
  equipType?: number
  busAddress?: number
  networkId?: string
  serialNumber?: string
  password?: string
  stopBit?: number | null
  parity?: number | null
  retry?: number | null
  protocol?: number
  groupType?: number
  showGroup?: boolean
  equipTypes?: Array<EquipType>
  connectionTypes?: Array<any>
  pollData?: any
  analyze?: any
  coldWater?: ColdWater
  customProps?: Array<any>
  timeLastChecking?: number | null
  timeNextChecking?: number | null
  equipTypeModificationId?: number | null
  equipSettings?: Array<EquipSetting> | null
  equipSettingTable?: EquipSettingTable | null
  timeZones?: Array<any>
  timeZonesType?: number
}

interface ColdWater {
  checkedTemperature: boolean
  checkedPressure: boolean
  source: {
    id: number | null
    name: string
  }
}

interface EquipSetting {
  id: number
  caption: string | null
  name: string | null
  value: string | null
}

export class Equip extends BaseObject {
  editable = Equip.store.state.user?.userRights.equipEdit

  id?: number
  parentId?: number
  type: number | null
  name: string
  note: string
  equipType: number
  serialNumber: string
  busAddress: number
  networkId: string
  password: string
  stopBit: number | null
  parity: number | null
  retry: number | null
  protocol: number
  groupType: number
  showGroup: boolean
  equipTypes: Array<EquipType>
  connectionTypes: Array<any>
  pollData: any
  analyze: any
  coldWater: ColdWater
  customProps: Array<any>
  timeLastChecking?: number | null
  timeNextChecking?: number | null
  equipTypeModificationId?: number | null
  equipSettings?: Array<EquipSetting> | null
  equipSettingTable?: EquipSettingTable | null
  timeZones: Array<any>
  timeZonesType: number

  constructor({
    uuid = undefined,
    id = undefined,
    parentId = undefined,
    type = null,
    name = '',
    note = '',
    equipType = 0,
    busAddress = 1,
    networkId = '',
    serialNumber = '',
    password = '',
    stopBit = null,
    parity = null,
    retry = null,
    protocol = 0,
    groupType = 10,
    showGroup = false,
    equipTypes = [],
    connectionTypes = [],
    pollData = {},
    analyze = {
      checked: false,
      standard: {
        id: null,
        name: null,
      },
      project: {
        id: null,
        name: null,
      },
      margin: 0.1,
    },
    coldWater = {
      checkedTemperature: false,
      checkedPressure: false,
      source: {
        id: null,
        name: '',
      },
    },
    customProps = [],
    timeLastChecking = null,
    timeNextChecking = null,
    equipTypeModificationId = null,
    equipSettings = [],
    equipSettingTable = null,
    timeZones = [],
    timeZonesType = -1
  }: IEquip) {
    super(uuid)

    this.id = id
    this.parentId = parentId
    this.type = type
    this.name = name
    this.note = note
    this.equipType = equipType
    this.busAddress = busAddress
    this.networkId = networkId
    this.serialNumber = serialNumber
    this.password = password
    this.stopBit = stopBit
    this.parity = parity
    this.retry = retry
    this.protocol = protocol
    this.groupType = groupType
    this.showGroup = showGroup
    this.equipTypes = equipTypes
    this.connectionTypes = connectionTypes
    this.pollData = pollData
    this.analyze = analyze
    this.coldWater = coldWater
    this.customProps = customProps
    this.timeLastChecking = this.getDateOnlyTimestamp(timeLastChecking)
    this.timeNextChecking = this.getDateOnlyTimestamp(timeNextChecking)
    this.equipTypeModificationId = equipTypeModificationId
    this.equipSettings = equipSettings
    this.equipSettingTable = equipSettingTable
    this.timeZones = Equip.store.state.env.timeZones
    this.timeZonesType = timeZonesType
  }

  isBusAddressVisible(type: number) {
    if (type !== null) {
      const types: any = Equip.matchType(Equip.store.state.env.equipTypeCodes)

      return ![
        types.vzljotASDT,
        types.multical601,
        types.multical602,
        types.multical66CDE,
        types.multicalIII,
        types.EK270_LIS200,
        types.SKU_01,
        types.vzljot_ASSV2,
      ].includes(type)
    }
    return false
  }

  isGroupType(type: string) {
    if (this.groupType) {
      return (
        Equip.store.state.env.connectionGroupTypes[this.groupType].type === type
      )
    }
    return false
  }

  getEquipTypeInfo(value: number) {
    const index = this.equipTypes.findIndex((r: any) => r.code === value)
    return index !== -1 ? this.equipTypes[index] : null
  }

  async create() {
    const { data } = await this.http.get('equip/create', {
      params: { parentId: this.parentId, type: this.type },
    })

    this.showGroup = data.showGroupConnection
    this.equipTypes = data.equipTypes
    this.equipType = data.equipType

    const options = {
      nodeCreate: data,
    }
    store.commit('setCard', options)

    if (this.equipTypes.length > 0) {
      const index = this.equipTypes.findIndex(
        (r: any) => r.code === this.equipType
      )

      if (index !== -1) {
        this.name = this.equipTypes[index].name
      }
    }

    this.groupType = data.groupType

    if (data.connectionTypes) {
      this.connectionTypes = data.connectionTypes
    }
  }

  getDateOnlyTimestamp(timestamp: number | null): number {
    if (timestamp) {
      const originalDate = new Date(timestamp)

      const year = originalDate.getUTCFullYear()
      const month = originalDate.getUTCMonth()
      const date = originalDate.getUTCDate()

      const dateOnly = new Date(Date.UTC(year, month, date))

      return dateOnly.getTime()
    }
    return 0
  }

  async init(id: number): Promise<void> {
    const { data } = await this.http.get('equip/equip', { params: { id } })

    this.id = data.id
    this.name = data.name
    this.note = data.note
    this.serialNumber = data.serialNumber
    this.busAddress = data.busAddress
    this.equipType = data.equipType
    this.protocol = data.protocol
    this.password = data.password
    this.networkId = data.networkId
    this.stopBit = data.stopBit
    this.parity = data.parity
    this.retry = data.retry
    this.showGroup = data.showGroup
    this.equipTypes = data.equipTypes
    this.groupType = data.groupType
    this.connectionTypes = data.connectionTypes
    this.pollData = data.pollData
    this.analyze = data.analyze
    this.coldWater = data.coldWater
    this.customProps = data.customProps
    this.timeLastChecking = data.timeLastChecking
    this.timeNextChecking = data.timeNextChecking
    this.equipTypeModificationId = data.equipTypeModificationId
    this.timeZonesType = data.timeZone.id
  }

  async save() {
    type Props = {
      id?: number
      parentId?: number
      type: number | null
      name: string
      note: string
      equipType: number
      busAddress?: number
      networkId?: string
      serialNumber: string
      password: string
      groupType: number
      parity?: number | null
      stopBit?: number | null
      retry?: number | null
      protocol: number
      group?: object
      pollData?: any
      analyze: any
      coldWater?: any
      customProps?: Array<any>
      timeLastChecking?: number | null
      timeNextChecking?: number | null
      equipTypeModificationId?: number | null
      equipSettings?: Array<EquipSetting> | null
      equipSettingTable?: EquipSettingTable | null
      timeZonesType: number
    }

    const props: Props = {
      id: this.id,
      parentId: this.parentId,
      type: this.type,
      name: this.name,
      note: this.note,
      equipType: this.equipType,
      serialNumber: this.serialNumber,
      password: this.password,
      protocol: this.protocol,
      groupType: this.groupType,
      analyze: this.analyze,
      coldWater: this.coldWater,
      equipSettings: this.equipSettings,
      equipSettingTable: this.equipSettingTable,
      timeZonesType: this.timeZonesType
    }
    
    props.timeZonesType = Equip.store.state.equip.timeZonesType ?? -1

    if (this.isBusAddressVisible(this.equipType)) {
      props.busAddress = this.busAddress
    }

    if (this.isGroupType('comPort')) {
      props.parity = this.parity
      props.stopBit = this.stopBit
    }

    if (this.isGroupType('IOT_Vega_Server')) {
      props.networkId = this.networkId
    }

    if (!this.isGroupType('none') && !this.isGroupType('ASDV')) {
      props.retry = this.retry
    }

    const equipTypeInfo = this.getEquipTypeInfo(this.equipType)

    if (equipTypeInfo !== null) {
      if (equipTypeInfo.hasOwnProperty('password')) {
        props.password = this.password
      }

      if (
        equipTypeInfo.protocols &&
        Object.keys(equipTypeInfo.protocols).length > 0
      ) {
        props.protocol = this.protocol
      }
    }

    if (this.timeLastChecking !== null) {
      props.timeLastChecking = this.timeLastChecking
    }
    if (this.timeNextChecking !== null) {
      props.timeNextChecking = this.timeNextChecking
    }

    if (this.equipTypeModificationId !== null) {
      props.equipTypeModificationId = this.equipTypeModificationId
    }

    if (this.connectionTypes.length > 0) {
      const index = this.connectionTypes.findIndex(
        (r: any) => r.type === this.groupType
      )

      if (index !== -1) {
        props.group = JSON.parse(
          JSON.stringify(this.connectionTypes[index].data.group)
        )
      }
    }

    if (Object.keys(this.pollData).length > 0) {
      props.pollData = JSON.parse(JSON.stringify(this.pollData))
      props.pollData.dateStart = new Date(props.pollData.dateStart).getTime()
    }

    props.analyze = {
      checked: this.analyze.checked,
      standard: this.analyze.standard.id,
      project: this.analyze.project.id,
      margin: this.analyze.margin,
    }

    try {
      props.coldWater = {
        checkedTemperature: this.coldWater.checkedTemperature || false,
        checkedPressure: this.coldWater.checkedPressure || false,
        source: this.coldWater.source.id || null,
      }
    } catch (err) {
      console.error(err)
    }

    if (this.customProps) {
      props.customProps = this.customProps.map((prop) => {
        const obj = Object.assign(
          {},
          ...Object.entries(prop).map(([k, v]) => {
            return { [k]: v }
          })
        )

        if (prop.value !== null) {
          if (prop.type === CustomPropertyTypeEnum.DateTime) {
            obj.value = new Date(obj.value).getTime()
          }
          obj.value = new String(obj.value)
        }

        return obj
      })
    }

    this.equipSettings = Equip.store.state.equip.equipSettingSave
    if (this.equipSettings) {
      props.equipSettings = this.equipSettings
    }

    this.equipSettingTable = Equip.store.state.equip.equipSettingTable
    if (this.equipSettingTable) {
      props.equipSettingTable = this.equipSettingTable
    }

    await this.http.post('equip/equip', props)
  }
}
