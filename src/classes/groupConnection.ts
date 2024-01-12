import BaseObject from './base/baseObject'

export class GroupConnectionError {
  name?: string
  component?: any

  constructor({ name = '', component = undefined }: { name?: string; component?: any }) {
    if (name) this.name = name
    if (component) this.component = component
  }
}

export class GroupConnection extends BaseObject {
  editable = GroupConnection.store.state.user?.userRights.equipEdit

  id?: number
  name: string
  groupType: number
  systemNode?: number
  connectionTypes: any

  constructor({ uuid = undefined, id = undefined, name = '', groupType = 10, systemNode = undefined, connectionTypes = null }: { uuid?: string; id?: number; name?: string; groupType?: number; systemNode?: number; connectionTypes?: any }) {
    super(uuid)

    this.id = id
    this.name = name
    this.groupType = groupType
    this.systemNode = systemNode
    this.connectionTypes = connectionTypes
  }

  async create() {
    const { data } = await this.http.get('groupConnection/create', { params: { systemNodeId: this.systemNode } })

    this.name = data.name
    this.groupType = data.groupType
    this.connectionTypes = data.connectionTypes
  }

  async init(id: number) {
    const { data } = await this.http.get('groupConnection/edit', { params: { id } })

    this.id = id
    this.name = data.name
    this.groupType = data.groupType
    this.connectionTypes = data.connectionTypes
  }

  async save() {
    const model = this.connectionTypes.find((r: any) => r.type === this.groupType)

    model.data.group.name = this.name

    const { data } = await this.http.post('groupConnection/save', model.data.group)

    return data
  }
}
