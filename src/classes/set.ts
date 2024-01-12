import BaseObject from './base/baseObject'
import { SetParam } from './setParam';

export class SetError {
  name?: string
  parameters?: string

  constructor({ name = '', parameters = '' }: { name?: string; parameters?: string }) {
    if (name) this.name = name
    if (parameters) this.parameters = parameters
  }
}

export type Equip = {
  id?: number
  equipId: number
  type: number
  text: string
  state: number
  connectionGroupType: number
}

export class Set extends BaseObject {
  image = 'fas fa-tasks-alt icon'
  editable = Set.store.state.user?.userRights.setEdit

  id?: number
  name: string
  type?: number
  equipId?: number
  equipTypeId?: number
  equipType: string
  isOpcAllowed: boolean
  isPollAllowed: boolean
  availableForAll: boolean
  isCustomizing?: boolean
  params: Array<SetParam>
  equips: Array<Equip>

  constructor({
    uuid = undefined,
    id = undefined,
    name = '',
    type = undefined,
    equipId = undefined,
    equipTypeId = undefined,
    equipType = '',
    isOpcAllowed = false,
    isPollAllowed = false,
    availableForAll = false,
    isCustomizing = false,
    params = [],
    equips = []
  }: {
    uuid?: string
    id?: number
    name?: string
    type?: number
    equipId?: number
    equipTypeId?: number
    equipType?: string
    isOpcAllowed?: boolean
    isPollAllowed?: boolean
    availableForAll?: boolean
    isCustomizing?: boolean
    params?: Array<SetParam>
    equips?: Array<Equip>
  }) {
    super(uuid)

    this.id = id
    this.name = name
    this.type = type
    this.equipId = equipId
    this.equipTypeId = equipTypeId
    this.equipType = equipType
    this.isOpcAllowed = isOpcAllowed
    this.isPollAllowed = isPollAllowed
    this.availableForAll = availableForAll
    this.isCustomizing = isCustomizing

    this.params = params
    this.equips = equips
  }

  async init(id: number) {
    if (!Number.isNaN(id)) {
      const { data } = await this.http.get<Set>('set/edit', { params: { id } })

      this.id = data.id
      this.name = data.name
      this.type = data.type
      this.isOpcAllowed = data.isOpcAllowed
      this.isPollAllowed = data.isPollAllowed
      this.availableForAll = data.availableForAll
      this.isCustomizing = data.isCustomizing

      this.params = data.params.map(r => new SetParam(r))
      this.equips = data.equips
    }
  }

  async save() {
    const obj = {
      id: this.id,
      name: this.name,
      type: this.type,
      equipId: this.equipId,
      equipTypeId: this.equipTypeId,
      isOpcAllowed: this.isOpcAllowed,
      isPollAllowed: this.isPollAllowed,
      availableForAll: this.availableForAll,
      isCustomizing: this.isCustomizing,
      equips: this.availableForAll ? [] : this.equips?.map(r => r.equipId),
      parameters: this.params?.map(r => ({
        id: r.id,
        equipId: r.equipId,
        equipTypeParamId: r.equipTypeParamId,
        name: r.name,
        mu: r.mu,
        dataType: r.dataType,
        channelNumber: r.channelNumber,
        value: r.value,
        readCode: r.readCode,
        writeCode: r.writeCode
      }))
    }

    const { data } = await this.http.post('set/save', obj)

    if (data.params && data.params.length) {
      const arr = this.params?.filter(r => r.id)

      data.params.forEach((r: any) => {
        r.checked = true
        r.time = null
        r.task = {
          class: {
            fas: true,
            'fa-cog': true,
            cog: true,
            poll: false
          },
          style: {
            color: 'lightslategray'
          }
        }
        r.equipMu = null
      })
      arr?.push(...data.params)
      this.params = arr
    }
  }
}
