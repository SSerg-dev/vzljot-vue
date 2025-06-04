import BaseObject from './base/baseObject'
import { SetTypes } from './enum/enum'

export class SchemaError {
  name?: string

  constructor({ name = '' }: { name?: string }) {
    if (name) this.name = name
  }
}

type EquipType = {
  id: number
  name: string
}

export class Schema extends BaseObject {
  image = 'fas fa-project-diagram icon'
  editable = Schema.store.state.user?.userRights.setEdit

  id?: number
  name: string
  type: number
  isSystem: boolean
  availableForAll: boolean
  purposeGroup: number
  equips: Array<any>
  equipType?: EquipType

  constructor({
    id = undefined,
    uuid = undefined,
    name = '',
    type = SetTypes.None,
    isSystem = false,
    purposeGroup = SetTypes.None,
    equipType = undefined,
    availableForAll = false,
    equips = []
  }: {
    id?: number
    uuid?: string
    name?: string
    type?: SetTypes
    isSystem?: boolean
    purposeGroup?: SetTypes
    equipType?: EquipType
    availableForAll?: boolean
    equips?: Array<any>
  }) {
    super(uuid)

    this.id = id
    this.name = name
    this.type = type
    this.isSystem = isSystem
    this.purposeGroup = purposeGroup
    this.equipType = equipType
    this.availableForAll = availableForAll
    this.equips = equips
  }

  async init(id: number) {
    if (!Number.isNaN(id)) {
      const { data } = await this.http.get('symbolSchema/schema', { params: { id } })

      this.id = id
      this.name = data.name
      this.type = data.type
      this.isSystem = data.isSystem
      this.availableForAll = data.availableForAll
      this.purposeGroup = data.purposeGroup
      this.equips = data.equips
      this.equipType = data.equipType
    }
  }

  async save() {
    const model = {
      id: this.id,
      name: this.name,
      type: this.type,
      equipType: this.equipType?.id,
      availableForAll: this.availableForAll,
      equips: this.equips.map(r => r.id)
    }

    return await this.http.post('symbolSchema/schema', model)
  }
}
