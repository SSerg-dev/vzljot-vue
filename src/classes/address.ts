import BaseObject from './base/baseObject'

export class AddressError {
  name?: string
  number?: string

  constructor({ name = '', number = '' }: { name?: string; number?: string }) {
    if (name) this.name = name
    if (number) this.number = number
  }
}

export class Address extends BaseObject {
  editable = Address.store.state.user?.userRights.measureSchemeEdit

  id?: number
  addressId?: number
  type: number
  hidden: boolean
  name?: string
  number?: string
  building?: string
  construction?: string
  letter?: string
  note?: string

  constructor({
    uuid = undefined,
    id = undefined,
    addressId = undefined,
    type = 1,
    hidden = false,
    name = '',
    number = '',
    building = '',
    construction = '',
    letter = '',
    note = ''
  }: {
    uuid?: string
    id?: number
    addressId?: number
    type?: number
    hidden?: boolean
    name?: string
    number?: string
    building?: string
    construction?: string
    letter?: string
    note?: string
  }) {
    super(uuid)

    this.id = id
    this.addressId = addressId
    this.type = type
    this.hidden = hidden
    this.construction = construction
    this.letter = letter
    this.note = note

    if (this.type === 4) {
      this.number = number
      this.building = building
      this.construction = construction
      this.letter = letter
      this.note = note
    } else {
      this.name = name
    }
  }

  async init(id: number): Promise<void> {
    const { data } = await this.http.get('address/address', { params: { id } })

    this.id = data.id
    this.addressId = data.addressId
    this.type = data.type
    this.name = data.name
    this.hidden = data.hidden
    this.number = data.number
    this.building = data.building
    this.construction = data.construction
    this.letter = data.letter
    this.note = data.note
  }

  async save() {
    interface IAddress {
      id?: number
      addressId?: number
      type: number
      hidden: boolean
      name?: string
      number?: string
      building?: string
      construction?: string
      letter?: string
      note?: string
    }

    const obj: IAddress = {
      id: this.id,
      addressId: this.addressId,
      type: this.type,
      hidden: this.hidden
    }

    if (this.type === 4) {
      obj.number = this.number
      obj.building = this.building
      obj.construction = this.construction
      obj.letter = this.letter
      obj.note = this.note
    } else {
      obj.name = this.name
    }

    await this.http.post(`address/${this.type === 4 ? 'house' : 'address'}`, obj)
  }
}
