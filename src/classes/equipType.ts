import BaseObject from './base/baseObject'
import Modification from './modification'

type EquipTypeType = {
  uuid?: string
  id?: number
  name?: string
  interval?: number
  isTemperature?: boolean
  isPressure?: boolean
  isVolume?: boolean
  isWeight?: boolean
  isSystem?: boolean
  modifications?: Array<Modification>
}

export default class EquipType extends BaseObject {
  id?: number
  name: string
  interval: number
  isTemperature: boolean
  isPressure: boolean
  isVolume: boolean
  isWeight: boolean
  isSystem: boolean
  modifications: Array<Modification>

  constructor({
    uuid = undefined,
    id = undefined,
    name = '',
    interval = 0,
    isTemperature = false,
    isPressure = false,
    isVolume = false,
    isWeight = false,
    isSystem = false,
    modifications = [],
  }: EquipTypeType) {
    super(uuid)

    this.id = id
    this.name = name
    this.interval = interval
    this.isTemperature = isTemperature
    this.isPressure = isPressure
    this.isVolume = isVolume
    this.isWeight = isWeight
    this.isSystem = isSystem
    this.modifications = modifications
  }

  async init(id: number, code?: string) {
    console.log('$$ init', id) 

    if (!Number.isNaN(id)) {
      let url
      if (typeof code !== 'undefined') {
        url = 'equipType/equipTypeByCode'
      } else {
        url = 'equipType/equipType'
      }

      const { data } = await this.http.get<EquipType>(url, {
        params: { id },
      })

      this.id = data.id
      this.name = data.name
      this.interval = data.interval
      this.isTemperature = data.isTemperature
      this.isPressure = data.isPressure
      this.isVolume = data.isVolume
      this.isWeight = data.isWeight
      this.isSystem = data.isSystem

      data.modifications.forEach((r) => {
        r.isTemperature = data.isTemperature
        r.isPressure = data.isPressure
        r.isVolume = data.isVolume
        r.isWeight = data.isWeight
      })

      this.modifications = data.modifications
    }
  }

  async save() {
    const model = {
      id: this.id,
      name: this.name,
      interval: this.interval,
      isTemperature: this.isTemperature,
      isPressure: this.isPressure,
      isVolume: this.isVolume,
      isWeight: this.isWeight,
      modifications: this.modifications.filter((r) => !r.isSystem),
    }

    return await this.http.post('equipType/equipType', model)
  }

  addModification(modification: Modification) {
    this.modifications.push(modification)
  }

  removeModifications(modifications: Array<number | null>) {
    this.modifications = this.modifications.filter(
      (r) => !modifications.includes(r.id)
    )
  }
}
