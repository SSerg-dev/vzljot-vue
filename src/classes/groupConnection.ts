import BaseObject from './base/baseObject'

export class GroupConnectionError {
  name?: string
  component?: any

  constructor({
    name = '',
    component = undefined,
  }: {
    name?: string
    component?: any
  }) {
    if (name) this.name = name
    if (component) this.component = component
  }
}

export class GroupConnection extends BaseObject {
  editable = GroupConnection.store.state.user?.userRights.equipEdit

  id?: number
  name: string
  groupType: number
  loRaConnectType: number
  systemNode?: number
  connectionTypes: any

  constructor({
    uuid = undefined,
    id = undefined,
    name = '',
    groupType = Object.freeze(10),
    loRaConnectType = Object.freeze(25),
    systemNode = undefined,
    connectionTypes = null,
  }: {
    uuid?: string
    id?: number
    name?: string
    groupType?: number
    loRaConnectType?: number
    systemNode?: number
    connectionTypes?: any
  }) {
    super(uuid)

    this.id = id
    this.name = name
    this.groupType = groupType
    this.loRaConnectType = loRaConnectType
    this.systemNode = systemNode
    this.connectionTypes = connectionTypes
  }

  async create() {
    const { data } = await this.http.get('groupConnection/create', {
      params: { systemNodeId: this.systemNode },
    })
    this.name = data.name
    this.groupType = data.groupType
    this.connectionTypes = data.connectionTypes
  }
  async init(id: number) {
    const { data } = await this.http.get('groupConnection/edit', { 
      params: { id },
    })
    this.id = id
    this.name = data.name
    this.groupType = data.groupType
    this.connectionTypes = data.connectionTypes
    GroupConnection.store.state.equip.groupConnectionType = data.groupType
    if (this.groupType === this.loRaConnectType) {
      GroupConnection.store.state.equip.loRaAdapter = this.getLoRaAdapter()
    }
  }
  getLoRaAdapter() {
    let result
    let index: number = -1
    if (
      Array.isArray(this.connectionTypes) &&
      this.connectionTypes.length > 0
    ) {
      index = this.connectionTypes.findIndex(
        (r: any) => r.type === this.groupType
      )
    }
    if (index !== -1) {
      result = JSON.parse(
        JSON.stringify(this.connectionTypes[index].data.group.adapter)
      )
    }
    return result
  }

  async save() {
    const model = this.connectionTypes.find(
      (r: any) => r.type === this.groupType
    )

    model.data.group.name = this.name

    const { data } = await this.http.post(
      'groupConnection/save',
      model.data.group
    )
    return data
  }
}
