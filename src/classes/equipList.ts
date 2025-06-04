import BaseObject from './base/baseObject'
import Task from '../components/Poll/task'
import { SchemeSystemTypeEnum } from './enum/SchemeSystemTypeEnum'
import { CommonStatusEnum } from './enum/CommonStatusEnum'

export enum ColumnTypeEnum {
  ArchiveHourTime = 'archiveHourTime',
  ArchiveDayTime = 'archiveDayTime',
  ArchiveMonthTime = 'archiveMonthTime',
  PollCurrentTime = 'pollCurrentTime',
  TimeCreate = 'timeCreate',
  TimeLastEdit = 'timeLastEdit',
}

export type PollMessage = {
  data: {
    action: string
    equip?: {
      id: number
      archiveHourTime?: Date
      archiveDayTime?: Date
      archiveMonthTime?: Date
      pollCurrentTime?: Date
      pollSource?: number
    }
    equipIds?: Array<number>
    state: string
    text: string
  }
}

export type SiMessage = {
  event: string
  type: number
  item: {
    id: number
    state: CommonStatusEnum
    news: number
  }
}

export class Filter {
  state?: CommonStatusEnum
  type?: SchemeSystemTypeEnum
  column?: ColumnTypeEnum
  equip?: string
  node?: string
  port?: string
  pollSource?: number
  periodStart?: any | null
  periodEnd?: any | null

  constructor({
    state,
    type,
    column,
    equip,
    node,
    port,
    pollSource,
    periodStart = null,
    periodEnd = null,
  }: {
    state?: number
    type?: SchemeSystemTypeEnum
    column?: ColumnTypeEnum
    equip?: string
    node?: string
    port?: string
    pollSource?: number
    periodStart?: any
    periodEnd?: any
  }) {
    this.state = state
    this.type = type
    this.column = column
    this.equip = equip
    this.node = node
    this.port = port
    this.pollSource = pollSource
    this.periodStart = periodStart
    this.periodEnd = periodEnd
  }
}

export class EquipListError {
  name?: string

  constructor({ name = '' }: { name?: string }) {
    if (name) this.name = name
  }
}

type Point = {
  id: number
  systemType: SchemeSystemTypeEnum
  name: string
  fullName: string
}

type Node = {
  id: number
  name: string
  fullName: string
}

export class EquipCustomProperty {
  name: string
  value: string

  constructor({ name, value }: { name: string; value: string }) {
    this.name = name
    this.value = value
  }
}

export class Equip {
  checked: boolean = false
  task?: Task = new Task()

  equipId: number
  state: CommonStatusEnum
  visible: boolean
  name: string
  note: string
  timeOffset?: number
  endPoint: string
  timeCreate?: Date
  timeLastEdit?: Date
  points: Array<Point>
  archiveHourTime?: Date
  archiveDayTime?: Date
  archiveMonthTime?: Date
  pollCurrentTime?: Date
  nodes: Array<Node>
  pollSource: number
  custom: Array<EquipCustomProperty>


  constructor({
    equipId,
    name = '',
    state,
    visible,
    note,
    timeOffset,
    endPoint,
    timeCreate,
    timeLastEdit,
    points = [],
    archiveHourTime,
    archiveDayTime,
    archiveMonthTime,
    pollCurrentTime,
    nodes = [],
    pollSource,
    custom,
  }: {
    equipId: number
    name: string
    state: number
    visible: boolean
    note: string
    timeOffset?: number
    endPoint: string
    timeCreate?: Date
    timeLastEdit?: Date
    points: Array<Point>
    archiveHourTime?: Date
    archiveDayTime?: Date
    archiveMonthTime?: Date
    pollCurrentTime?: Date
    nodes: Array<Node>
    pollSource: number
    custom: Array<EquipCustomProperty>
  }) {
    this.equipId = equipId
    this.name = name
    this.state = state
    this.visible = visible
    this.note = note
    this.timeOffset = timeOffset
    this.endPoint = endPoint
    this.timeCreate = timeCreate ? new Date(timeCreate) : timeCreate
    this.timeLastEdit = timeLastEdit ? new Date(timeLastEdit) : timeLastEdit
    this.points = points
    this.archiveHourTime = archiveHourTime
      ? new Date(archiveHourTime)
      : archiveHourTime
    this.archiveDayTime = archiveDayTime
      ? new Date(archiveDayTime)
      : archiveDayTime
    this.archiveMonthTime = archiveMonthTime
      ? new Date(archiveMonthTime)
      : archiveMonthTime
    this.pollCurrentTime = pollCurrentTime
      ? new Date(pollCurrentTime)
      : pollCurrentTime
    this.nodes = nodes
    this.pollSource = pollSource
    this.custom = custom

    if (EquipList.store.state.user.userRights.pollData) {
      this.task = new Task()
    }
  }
}

export class EquipList extends BaseObject {
  editable = EquipList.store.state.user?.userRights.equipListEdit

  id: number | undefined
  name: string
  equips: Array<Equip>
  settings: any

  constructor({
    uuid = undefined,
    id = undefined,
    name = '',
    equips = [],
    settings = {},
  }: {
    uuid?: string
    id?: number
    name?: string
    equips?: Array<Equip>
    settings?: any
  }) {
    super(uuid)

    this.id = id
    this.name = name
    this.equips = equips.map((r) => new Equip(r))
    this.settings = settings
  }

  async init(id: number): Promise<void> {
    const { data } = await this.http.get<{
      id: number
      name: string
      equips: Array<Equip>
      settings: any
    }>('equipList/equipList', { params: { id } })

    this.id = data.id
    this.name = data.name
    this.equips = data.equips.map((r: any) => new Equip(r))
    this.settings = data.settings
  }

  async save() {
    await this.http.post('equipList/equipList', {
      id: this.id,
      name: this.name,
      equips: this.equips.map((r) => r.equipId),
    })
  }

  async addEquips(equips: Array<number>) {
    if (equips.length > 0) {
      const { data } = await this.http.post<Array<Equip>>(
        'equipList/addEquips',
        { equips }
      )

      data.forEach((r) => new Equip(r))

      this.equips.push(...data)
    }
  }
}
