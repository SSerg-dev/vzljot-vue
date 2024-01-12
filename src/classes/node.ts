import BaseObject from './base/baseObject'

export class NodeError {
  name?: string

  constructor({ name = '' }: { name?: string }) {
    if (name) this.name = name
  }
}

export type Equip = {
  id: number
  type: number
  name: string
  connectionGroupType?: number
  state: number,
  checked?: boolean
}

type Point = {
  id: number
  type: number
  name: string
  systemType: number
  state: number
}

export class Node extends BaseObject {
  editable = Node.store.state.user?.userRights.measureSchemeEdit

  id?: number
  addressId?: number
  type: number
  name: string
  note: string
  hidden: boolean
  consumer?: number
  equips: Array<Equip>
  points: Array<Point>

  constructor({
    uuid = undefined,
    id = undefined,
    addressId = undefined,
    name = '',
    note = '',
    type = 1,
    hidden = false,
    consumer = undefined,
    equips = [],
    points = []
  }: {
    uuid?: string
    id?: number
    addressId?: number
    name?: string
    note?: string
    type?: number
    hidden?: boolean
    consumer?: number
    equips?: Array<Equip>
    points?: Array<Point>
  }) {
    super(uuid)

    this.id = id
    this.addressId = addressId
    this.name = name
    this.note = note
    this.type = type
    this.hidden = hidden
    this.consumer = consumer
    this.equips = equips.map(r => this.getEquipItem(r))
    this.points = points.map(r => this.getPointItem(r))
  }

  async init(id: number) {
    const { data } = await this.http.get('node/node', { params: { id } })

    data.equips.forEach((r: any) => this.getEquipItem(r))
    data.points.forEach((r: any) => this.getPointItem(r))

    this.id = data.id
    this.addressId = data.addressId
    this.name = data.name
    this.note = data.note
    this.type = data.type
    this.hidden = data.hidden
    this.consumer = data.consumer
    this.equips = data.equips
    this.points = data.points
  }

  async save() {
    const model = {
      id: this.id,
      addressId: this.addressId,
      name: this.name,
      note: this.note,
      type: this.type,
      hidden: this.hidden,
      consumer: this.consumer,
      equips: this.equips.map(r => r.id)
    }

    await this.http.post('node/node', model)
  }

  addEquips(equips: any) {
    this.equips.push(...equips.map((r: any) => this.getEquipItem(r)))
  }

  getEquipItem(r: any): Equip {
    const obj: Equip = {
      id: r.id,
      type: r.type,
      name: r.name,
      connectionGroupType: r.connectionGroupType,
      state: r.state
    }

    return obj
  }

  getPointItem(r: any): Point {
    const obj: Point = {
      id: r.id,
      type: r.type,
      name: r.name,
      systemType: r.systemType,
      state: r.state
    }

    return obj
  }
}
