import BaseObject from './base/baseObject'
import Task from '../components/Poll/task'

export class PointListError {
  name?: string

  constructor({ name = '' }: { name?: string }) {
    if (name) this.name = name
  }
}

type Node = {
  id: number
  name: string
  fullName: string
}

export class PointCustomProperty {
  name: string
  value: string

  constructor({ name, value }: { name: string; value: string }) {
    this.name = name
    this.value = value
  }
}

export class Point {
  checked: boolean = false
  task?: Task

  id: number
  type: number = PointList.matchType(PointList.store.state.env.itemTypes).point
  name: string
  state: number
  visible: boolean
  systemType: number
  node: Node
  note: string
  timeOffset?: number
  lastArchiveTime: Date | null
  emptyNodeEquip: boolean
  reportTypes: Array<number>
  pollSource: number
  consumer?: string
  custom: Array<PointCustomProperty>

  constructor({
    id,
    name = '',
    state,
    visible,
    systemType,
    node,
    note,
    timeOffset,
    lastArchiveTime,
    emptyNodeEquip,
    reportTypes,
    pollSource,
    consumer,
    custom,
  }: {
    id: number
    name: string
    state: number
    visible: boolean
    systemType: number
    node: Node
    note: string
    timeOffset?: number
    lastArchiveTime: Date | null
    emptyNodeEquip: boolean
    reportTypes: Array<number>
    pollSource: number
    consumer?: string
    custom: Array<PointCustomProperty>
  }) {
    this.id = id
    this.name = name
    this.state = state
    this.visible = visible
    this.systemType = systemType
    this.node = node
    this.note = note
    this.timeOffset = timeOffset
    this.lastArchiveTime = lastArchiveTime
    this.emptyNodeEquip = emptyNodeEquip
    this.reportTypes = reportTypes
    this.pollSource = pollSource
    this.consumer = consumer
    this.custom = custom

    if (PointList.store.state.user.userRights.pollData) {
      this.task = new Task()
    }
  }
}

export class PointList extends BaseObject {
  editable = PointList.store.state.user?.userRights.measureSchemeListEdit

  id?: number
  name: string
  points: Array<Point>
  reportTypes?: Array<number>
  settings: any

  constructor({
    uuid,
    id,
    name = '',
    points = [],
    reportTypes = [],
    settings = {},
  }: {
    uuid?: string
    id?: number
    name?: string
    points?: Array<Point>
    reportTypes?: Array<number>
    settings?: any
  }) {
    super(uuid)

    this.id = id
    this.name = name
    this.points = points.map((r) => new Point(r))
    this.reportTypes = reportTypes
    this.settings = settings
  }

  async init(id: number) {
    if (!Number.isNaN(id)) {
      const { data } = await this.http.get<PointList>('pointList/pointList', {
        params: { id },
      })
      this.id = data.id
      this.name = data.name
      this.points = data.points.map((r) => new Point(r))
      this.reportTypes = data.reportTypes ? data.reportTypes : this.reportTypes
      this.settings = data.settings ? data.settings : this.settings
    }
  }

  async save() {
    await this.http.post('pointList/pointList', {
      id: this.id,
      name: this.name,
      points: this.points.map((r) => r.id),
    })
  }

  async addPoints(points: Array<number>) {
    if (points.length > 0) {
      const { data } = await this.http.post<Array<Point>>(
        'pointList/addPoints',
        { points }
      )

      data.forEach((r) => new Point(r))

      this.points.push(...data)
    }
  }
}
