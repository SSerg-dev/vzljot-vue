import { Point as BasePoint } from './api/point'
import BaseObject from './base/baseObject'
import { ReportObjectTypeEnum } from './enum/ReportObjectTypeEnum'

export class PointGroupError {
  name?: string

  constructor({ name = '' }: { name?: string }) {
    if (name) this.name = name
  }
}

export class Point extends BasePoint {
  number: number

  constructor({
    id,
    name,
    number,
    state,
    systemType,
    hasArchives
  }: {
    id: number
    name: string
    number: number
    state: number
    systemType: number
    hasArchives: boolean
  }) {
    super({
      id,
      name,
      state,
      systemType,
      hasArchives
    })

    this.number = number
  }
}

export class PointGroup extends BaseObject {
  editable = PointGroup.store.state.user?.userRights.measureSchemeGroupEdit

  id?: number
  name: string
  note: string
  points: Array<Point>
  reportObjectType: number

  constructor({
    uuid = undefined,
    id = undefined,
    name = '',
    note = '',
    points = []
  }: {
    uuid?: string
    id?: number
    name?: string
    note?: string
    points?: Array<Point>
  }) {
    super(uuid)

    this.id = id
    this.name = name
    this.note = note
    this.points = points
    this.reportObjectType = ReportObjectTypeEnum.MeasureSchemeGroup
  }

  async init(id: number): Promise<void> {
    const { data } = await this.http.get<{ id: number; name: string; note: string; points: Array<Point> }>('pointGroup/pointGroup', {
      params: { id }
    })

    this.id = data.id
    this.name = data.name
    this.note = data.note
    this.points = data.points.map(r => new Point(r))
  }

  async save(): Promise<void> {
    await this.http.post('pointGroup/pointGroup', {
      id: this.id,
      name: this.name,
      note: this.note,
      points: this.points.map(r => ({ id: r.id, number: r.number }))
    })
  }

  async addPoints(points: Array<Point>) {
    this.points.push(...points.map(r => new Point(r)))
  }

  async removePoints(points: Array<number>) {
    this.points = this.points.filter(r => !points.includes(r.id))
    this.points.forEach((r, i) => (r.number = i))
  }
}
