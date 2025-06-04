import BaseObject from './base/baseObject'
import { CustomPropertyTypeEnum } from './enum/CustomPropertyTypeEnum'
import { store } from '@/store/store'
import { EquipSettingTable } from '@/store/equip'
import { log } from './utils/common.functions'
import axios, { AxiosError } from 'axios'

export class EquipError {
  name?: string
  equipType?: string
  serialNumber?: string
  devEUI?: string
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
    devEUI = '',
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
    devEUI?: string
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
    if (devEUI) this.devEUI = devEUI
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
  devEUI?: string
  password?: string
  stopBit?: number | null
  parity?: number | null
  retry?: number | null
  protocol?: number
  groupType?: number
  loRaConnectType?: number
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
  timeZones?: Array<any>
  timeZonesType?: number
  timeZonesSystem?: Array<any>
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
  caption: string
  name: string
  value: string
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
  devEUI: string
  busAddress: number
  networkId: string
  password: string
  stopBit: number | null
  parity: number | null
  retry: number | null
  protocol: number
  groupType: number
  loRaConnectType: number
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
  timeZones: Array<any>
  timeZonesType: number
  timeZonesSystem: Array<any>

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
    devEUI = '',
    password = '',
    stopBit = null,
    parity = null,
    retry = null,
    protocol = 0,
    groupType = Object.freeze(10),
    loRaConnectType = Object.freeze(25),
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
    timeZones = [],
    timeZonesType = -1,
    timeZonesSystem = [],
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
    this.devEUI = devEUI
    this.password = password
    this.stopBit = stopBit
    this.parity = parity
    this.retry = retry
    this.protocol = protocol
    this.groupType = groupType
    this.loRaConnectType = loRaConnectType
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
    this.timeZones = Equip.store.state.env.timeZones
    this.timeZonesType = timeZonesType
    this.timeZonesSystem = Equip.store.state.env.timeZonesSystem
  }

  isBusAddressVisible(type: number) {
    if (type !== null) {
      const types: any = Equip.matchType(Equip.store.state.env.equipTypeCodes)

      return ![
        types.VzljotASDT,
        types.Multical601,
        types.Multical602,
        types.Multical66CDE,
        types.MulticalIII,
        types.EK270_LIS200,
        types.SKU_01,
        types.TSSh_1M_02,
        types.ELDIS_EL_1203,
        types.vegaSI11,
        types.vegaSI12,
        types.vegaTP11,
        types.vegaSI11_rev2,
        types.Vzljot_ASSV2,
      ].includes(type)
    }
    return false
  }

  isVega(type: number) {
    let result
    if (type !== null) {
      const types: any = Equip.matchType(Equip.store.state.env.equipTypeCodes)

      result = [
        types.vegaSI11,
        types.vegaSI12,
        types.vegaTP11,
        types.vegaSI11_rev2,
      ].includes(type)
    } else {
      result = false
    }

    return result
  }

  isEquipTypeVisible(type: number) {
    if (type !== null) {
      const types: any = Equip.matchType(Equip.store.state.env.equipTypeCodes)

      return [
        types.APS79,

        types.SPT961,
        types.SPT961M,
        types.SPT961_1_2,
        types.SPT961_1_2M,
        types.SPT962,
        types.SPT963,

        types.SPG761,
        types.SPG763,
        // types.SPE542,
        types.SPG762,
        types.SPG761_1_2,
        types.SPG762_1_2,
        types.SPG763_1_2,
      ].includes(type)
    }
    return false
  }

  isGroupType(type: string) {
    if (this.groupType) {
      let result =
        Equip.store.state.env.connectionGroupTypes[this.groupType].type === type

      if (type === 'comPort' && this.groupType === 10) {
        result = true
      }
      return result
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
      isNodeCreate: true,
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

      const dateOnly = new Date(Date.UTC(year, month, date, 0, 0, 0, 0))

      return dateOnly.getTime()
    }
    return 0
  }

  async init(id: number): Promise<void> {
    const { data, status } = await this.http.get('equip/equip', {
      params: { id },
    })

    this.id = data.id
    this.name = data.name
    this.note = data.note
    this.serialNumber = data.serialNumber
    this.devEUI = data.devEUI
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
    Equip.store.state.equip.timeZonesType = data.timeZone.id
    Equip.store.state.equip.groupType = data.groupType
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
      devEUI: string
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
      devEUI: this.devEUI,
      password: this.password,
      protocol: this.protocol,
      groupType: this.groupType,
      analyze: this.analyze,
      coldWater: this.coldWater,
      timeZonesType: this.timeZonesType,
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

    if (this.parity) {
      props.parity = this.parity
    }
    if (this.stopBit) {
      props.stopBit = this.stopBit
    }
    if (this.retry) {
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

    if (
      typeof this.timeNextChecking === 'number' &&
      typeof this.timeLastChecking === 'number'
    ) {
      if (
        this.getDateOnlyTimestamp(this.timeNextChecking!) >
        this.getDateOnlyTimestamp(this.timeLastChecking!)
      ) {
        props.timeNextChecking = this.timeNextChecking
      } else if (
        typeof Equip.store.state.card.startTimeNextChecking === 'number' &&
        this.timeLastChecking < Equip.store.state.card.startTimeNextChecking &&
        this.timeLastChecking < this.timeNextChecking
      ) {
        props.timeNextChecking = Equip.store.state.card.startTimeNextChecking
      }
    }

    if (
      this.timeLastChecking === null &&
      typeof this.timeNextChecking === 'number' &&
      this.timeNextChecking > 0
    ) {
      props.timeNextChecking = this.timeNextChecking
    }

    if (
      typeof this.timeLastChecking === 'number' &&
      typeof this.timeNextChecking === 'number' &&
      this.getDateOnlyTimestamp(this.timeLastChecking!) >=
        this.getDateOnlyTimestamp(this.timeNextChecking!)
    ) {
      props.timeNextChecking = 0
    }

    if (this.equipTypeModificationId !== null) {
      props.equipTypeModificationId = this.equipTypeModificationId
    }

    try {
      if (
        Array.isArray(this.connectionTypes) &&
        this.connectionTypes.length > 0
      ) {
        const index = this.connectionTypes.findIndex(
          (r: any) => r.type === this.groupType
        )
        if (index !== -1) {
          props.group = JSON.parse(
            JSON.stringify(this.connectionTypes[index].data.group)
          )
          const adapter = this.connectionTypes[index].data.group.adapter
          const isVega = this.isVega(this.equipType)

          if (adapter && isVega) {
            props.serialNumber = adapter
            props.devEUI = props.serialNumber
          }
          if (
            Equip.store.state.equip.groupConnectionType ===
              this.loRaConnectType &&
            Equip.store.state.equip.loRaAdapter !== -1
          ) {
            props.serialNumber = String(Equip.store.state.equip.loRaAdapter)
          }
        }
      }
    } catch (error) {
      console.error(error)
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
    await this.http.post('equip/equip', props)

    Equip.store.state.equip.groupConnectionType = -1
    Equip.store.state.equip.loRaAdapter = -1
  }
}
