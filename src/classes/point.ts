import BaseObject from './base/baseObject'
import { CustomPropertyTypeEnum } from './enum/CustomPropertyTypeEnum'

export class PointError {
  name?: string
  timeStart?: string
  timeEnd?: string
  schemaId?: string

  constructor({
    name = '',
    timeStart = '',
    timeEnd = '',
    schemaId = ''
  }: {
    name?: string
    timeStart?: string
    timeEnd?: string
    schemaId?: string
  }) {
    if (name) this.name = name
    if (timeStart) this.timeStart = timeStart
    if (timeEnd) this.timeEnd = timeEnd
    if (schemaId) this.schemaId = schemaId
  }
}

type ArchiveType = {
  archiveType: number
  name: string
  pollDataType: number
}

type Channel = {
  channelType: string
  number: number
  isExclude: boolean
}

type CustomProp = {
  id: number
  name: string
  type: number
  value: any | null
  error?: string
}

type System = {
  number: number | null
  name: string
}

type Equip = {
  id: number
  name: string
  systemType: number
  systems: Array<System>
}

type Equips = {
  [key: string]: Equip
}

type MeasureChannel = {
  value: number | null
  text: string
  types: Array<number>
}

type MeasureChannelGroup = {
  id: number
  text: string
  allowDifferentChannels: boolean
  channels: Array<MeasureChannel>
}

type Groups = {
  [key: string]: MeasureChannelGroup
}

type ChannelInfo = {
  id: number
  number: number
  name: string
  type: number
  rows: Array<Param>
  equipChannelValues: Array<any>
}

type Scope = {
  systemType: number
  channel?: Channel
}

type SchemaEvent = {
  guid: string
  commonEventType: string
  name: string
  scope: Scope
  measures: Array<number>
}

interface ParamInfo {
  value: string | number | null
  text: string
}

type Param = {
  type: number
  name: string
  archive?: {
    value: ParamInfo
    values: Array<ParamInfo>
  }
  current?: {
    value: ParamInfo
    values: Array<ParamInfo>
  }
  sensor?: {
    value: ParamInfo
    values: Array<ParamInfo>
  }
}

type PointType = {
  uuid?: string
  id?: number
  nodeId?: number
  name?: string
  note?: string
  timeStart?: Date
  timeEnd?: Date
  schemaId?: number
  system?: number
  equipId?: number
  emptyNodeEquip?: boolean
  reportTypes?: Array<number>
  archiveTypes?: Array<ArchiveType>
  analyzeTypes?: Array<number>
  schemaEvents?: Array<SchemaEvent>
  schemaEvent?: string
  pollDataType?: number
  equips?: Equips
  groups?: Groups
  channels?: Array<ChannelInfo>
  params?: Array<Param>
  customProps?: Array<CustomProp>
}

export class Point extends BaseObject {
  editable = Point.store.state.user?.userRights.measureSchemeEdit

  id?: number
  nodeId?: number
  name: string
  note: string
  timeStart?: Date
  timeEnd?: Date
  schemaId?: number
  system?: number
  equipId?: number
  emptyNodeEquip: boolean
  reportTypes: Array<number>
  archiveTypes: Array<ArchiveType>
  analyzeTypes: Array<number>
  schemaEvents: Array<SchemaEvent>
  schemaEvent: string
  pollDataType: number
  equips: Equips
  groups: Groups
  channels: Array<ChannelInfo>
  params: Array<Param>
  customProps: Array<CustomProp>

  constructor({
    uuid = undefined,
    id = undefined,
    nodeId = undefined,
    name = '',
    note = '',
    timeStart = new Date(),
    timeEnd = undefined,
    schemaId = undefined,
    system = undefined,
    equipId = undefined,
    emptyNodeEquip = false,
    reportTypes = [],
    archiveTypes = [],
    analyzeTypes = [],
    schemaEvents = [],
    schemaEvent = '',
    pollDataType = 0,
    equips = {},
    groups = {},
    channels = [],
    params = [],
    customProps = []
  }: PointType) {
    super(uuid)

    this.id = id
    this.nodeId = nodeId
    this.name = name
    this.note = note
    this.timeStart = new Date(timeStart)
    this.timeEnd = timeEnd
    this.schemaId = schemaId
    this.system = system
    this.equipId = equipId
    this.emptyNodeEquip = emptyNodeEquip
    this.reportTypes = reportTypes
    this.archiveTypes = archiveTypes
    this.analyzeTypes = analyzeTypes
    this.schemaEvents = schemaEvents
    this.schemaEvent = schemaEvent
    this.pollDataType = pollDataType
    this.equips = equips
    this.groups = groups
    this.channels = channels
    this.params = params
    this.customProps = customProps
  }

  async init(id: number) {
    const { data } = await this.http.get<Point>('point/edit', { params: { id } })

    this.id = data.id
    this.nodeId = data.nodeId
    this.name = data.name
    this.note = data.note
    this.timeStart = data.timeStart
    this.timeEnd = data.timeEnd
    this.schemaId = data.schemaId
    this.system = data.system
    this.equipId = data.equipId
    this.emptyNodeEquip = data.emptyNodeEquip
    this.reportTypes = data.reportTypes
    this.archiveTypes = data.archiveTypes
    this.analyzeTypes = data.analyzeTypes
    this.schemaEvents = data.schemaEvents
    this.schemaEvent = data.schemaEvent
    this.pollDataType = data.pollDataType
    this.equips = data.equips
    this.groups = data.groups
    this.channels = data.channels
    this.params = data.params
    this.customProps = data.customProps
  }

  async save() {
    const channelParams = [].concat(
      ...this.channels.map((channel: any) =>
        channel.rows.map((r: any) => ({
          channel: channel.id,
          type: r.type,
          current: r.current?.value?.value,
          archive: r.archive?.value?.value
        }))
      )
    )

    const params = this.params.map(r => ({
      type: r.type,
      current: r.current?.value?.value,
      archive: r.archive?.value?.value
    }))

    const point = {
      id: this.id,
      nodeId: this.nodeId,
      name: this.name,
      note: this.note,
      timeStart: this.timeStart,
      timeEnd: this.timeEnd,
      schemaId: this.schemaId,
      system: this.system,
      equipId: this.equipId,
      emptyNodeEquip: this.emptyNodeEquip,
      reportTypes: this.reportTypes,
      archiveTypes: this.archiveTypes,
      analyzeTypes: this.analyzeTypes,
      schemaEvents: this.schemaEvents,
      schemaEvent: this.schemaEvent,
      pollDataType: this.pollDataType,
      equips: this.equips,
      groups: this.groups,
      channels: this.channels,
      params: [...channelParams, ...params].filter(r => r.archive || r.current),
      customProps: this.customProps.map(prop => {
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

    return await this.http.post('point/point', point)
  }

  async getParams(schemaId: number) {
    const { data } = await this.http.get('point/params', { params: { id: this.id, equipId: this.equipId, system: this.system, schemaId } })

    return data
  }
}
