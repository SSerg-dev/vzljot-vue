import { BalanceGroup as BaseBalanceGroup } from './api/balanceGroup'
import { Node } from './api/node'
import { Point as BasePoint } from './api/point'
import { PointList } from './api/pointList'
import BaseObject from './base/baseObject'
import { CommonStatusEnum } from './enum/CommonStatusEnum'
import { NodeTypeEnum } from './enum/NodeTypeEnum'
import { SchemeSystemTypeEnum } from './enum/SchemeSystemTypeEnum'

export class Filter {
  name?: string
  type?: number

  constructor({ name, type }: { name?: string; type?: number }) {
    this.name = name
    this.type = type
  }
}

export class BalanceGroupError {
  name?: string

  constructor({ name = '' }: { name?: string }) {
    if (name) this.name = name
  }
}

export class Point extends BasePoint {
  isSource: boolean

  constructor({
    id,
    name,
    isSource,
    state,
    systemType,
    hasArchives,
  }: {
    id: number
    name: string
    isSource: boolean
    state: CommonStatusEnum
    systemType: SchemeSystemTypeEnum
    hasArchives: boolean
  }) {
    super({
      id,
      name,
      state,
      systemType,
      hasArchives,
    })

    this.isSource = isSource
  }
}

export class BalanceGroup extends BaseObject {
  editable = BalanceGroup.store.state.user?.userRights.balanceGroupEdit

  id?: number
  name: string
  balanceGroups: Array<BaseBalanceGroup>
  nodes: Array<Node>
  points: Array<Point>
  pointLists: Array<PointList>

  constructor({
    uuid,
    id,
    name = '',
    balanceGroups = [],
    nodes = [],
    points = [],
    pointLists = [],
  }: {
    uuid?: string
    id?: number
    name?: string
    balanceGroups?: Array<BaseBalanceGroup>
    nodes?: Array<Node>
    points?: Array<Point>
    pointLists?: Array<PointList>
  }) {
    super(uuid)

    this.id = id
    this.name = name
    this.balanceGroups = balanceGroups.map((r) => new BaseBalanceGroup(r))
    this.nodes = nodes.map((r) => new Node(r))
    this.points = points.map((r) => new Point(r))
    this.pointLists = pointLists.map((r) => new PointList(r))
  }

  async init(id: number): Promise<void> {
    const { data } = await this.http.get<{
      id: number
      name: string
      balanceGroups: Array<BaseBalanceGroup>
      nodes: Array<Node>
      points: Array<Point>
      pointLists: Array<PointList>
    }>('balanceGroup/balanceGroup', {
      params: { id },
    })

    this.id = data.id
    this.name = data.name
    this.balanceGroups = data.balanceGroups.map((r) => new BaseBalanceGroup(r))
    this.nodes = data.nodes.map((r) => new Node(r))
    this.points = data.points.map((r) => new Point(r))
    this.pointLists = data.pointLists.map((r) => new PointList(r))
  }
  
  async initBalanceGroupItem(): Promise<{}> { 
    const { data } = await this.http.get<{
    }>('balanceGroup/balanceGroupItem', {})
    
    return data
  }

  async save(): Promise<void> {
    const model = {
      id: this.id,
      name: this.name,
      items: [
        ...this.balanceGroups.map((r) => ({
          id: r.id,
          type: 28,
          isSource: r.isSource,
          subGroup: r.subGroup,
        })),
        ...this.nodes.map((r) => ({
          id: r.id,
          type: 19,
          isSource: r.isSource,
          subGroup: r.subGroup,
        })),
        ...this.points.map((r) => ({
          id: r.id,
          type: 26,
          isSource: r.isSource,
        })),
        ...this.pointLists.map((r) => ({
          id: r.id,
          type: 15,
          isSource: r.isSource,
        })),
      ],
    }

    await this.http.post('balanceGroup/balanceGroup', model)
  }

  add(
    items: Array<{
      id: number
      type: number
      name: string
      originName: string
      nodeType: NodeTypeEnum
      state: CommonStatusEnum
      hasArchives: boolean
      subGroup: number
      systemType: SchemeSystemTypeEnum
    }>,
    isSource: boolean
  ) {
    this.balanceGroups.push(
      ...items
        .filter((r) => r.type === 28)
        .map(
          (r) =>
            new BaseBalanceGroup({
              id: r.id,
              name: r.originName,
              isSource,
              state: r.state,
              hasArchives: r.hasArchives,
              subGroup: r.subGroup,
            })
        )
    )
    this.nodes.push(
      ...items
        .filter((r) => r.type === 19)
        .map(
          (r) =>
            new Node({
              id: r.id,
              name: r.name,
              isSource,
              nodeType: r.nodeType,
              state: r.state,
              hasArchives: r.hasArchives,
              subGroup: 1,
            })
        )
    )
    this.points.push(
      ...items
        .filter((r) => r.type === 26)
        .map(
          (r) =>
            new Point({
              id: r.id,
              name: r.name,
              isSource,
              state: r.state,
              hasArchives: r.hasArchives,
              systemType: r.systemType,
            })
        )
    )
    this.pointLists.push(
      ...items
        .filter((r) => r.type === 15)
        .map(
          (r) =>
            new PointList({
              id: r.id,
              name: r.name,
              isSource,
              state: r.state,
              hasArchives: r.hasArchives,
            })
        )
    )
  }

  remove(
    items: Array<BaseBalanceGroup | Node | Point | PointList>,
    isSource: boolean
  ) {
    items.forEach((r) => {
      if (r instanceof BaseBalanceGroup) {
        this.balanceGroups = this.balanceGroups.filter(
          (item) => !(r.id === item.id && item.isSource === isSource)
        )
      }
      if (r instanceof Node) {
        this.nodes = this.nodes.filter(
          (item) => !(r.id === item.id && item.isSource === isSource)
        )
      }
      if (r instanceof Point) {
        this.points = this.points.filter(
          (item) => !(r.id === item.id && item.isSource === isSource)
        )
      }
      if (r instanceof PointList) {
        this.pointLists = this.pointLists.filter(
          (item) => !(r.id === item.id && item.isSource === isSource)
        )
      }
    })
  }
}
