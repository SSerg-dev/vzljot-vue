import BaseObject from './base/baseObject'
import { CustomPropertyObjectTypeEnum } from './enum/CustomPropertyObjectTypeEnum'
import { CustomPropertyDisplayInEnum } from './enum/CustomPropertyDisplayInEnum'
import { CustomPropertyTypeEnum } from './enum/CustomPropertyTypeEnum'
import { store } from '@/store/store'
export class CustomPropError {
  name?: string
  code?: string
  dataType?: string
  objectType?: string

  constructor({
    name = '',
    code = '',
    dataType = '',
    objectType = '',
  }: {
    name?: string
    code?: string
    dataType?: string
    objectType?: string
  }) {
    if (name) this.name = name
    if (code) this.code = code
    if (dataType) this.dataType = dataType
    if (objectType) this.objectType = objectType
  }
}

export class CustomProp extends BaseObject {
  image = 'fas fa-brackets-curly icon'
  editable = CustomProp.store.state.user?.userRights.customPropertyEdit

  id?: number
  name: string
  code: string
  dataType: number
  objectType: number
  displayIn: number

  constructor({
    id = undefined,
    uuid = undefined,
    name = '',
    code = '',
    dataType = CustomPropertyTypeEnum.String,
    objectType = CustomPropertyObjectTypeEnum.Equip,
    displayIn = CustomPropertyDisplayInEnum.None 
  }: {
    id?: number
    uuid?: string
    name?: string
    code?: string
    dataType?: number
    objectType?: number
    displayIn?: number
  }) {
    super(uuid)

    this.id = id
    this.name = name
    this.code = code
    this.dataType = dataType
    this.objectType = objectType
    this.displayIn = displayIn
  }

  async init(id: number) {
    if (!Number.isNaN(id)) {
      const { data } = await this.http.get<CustomProp>(
        'customProps/customProp',
        { params: { id } }
      )
      this.id = data.id
      this.name = data.name
      this.code = data.code
      this.dataType = data.dataType
      this.objectType = data.objectType
      this.displayIn = data.displayIn
      store.state.displayIn = data.displayIn
    }
  }

  async save() {
    const options = {
      id: this.id,
      name: this.name,
      code: this.code,
      dataType: this.dataType,
      objectType: this.objectType,
      displayIn: this.displayIn, 
    }
    await this.http.post('customProps/customProp', options)

    store.state.displayIn = 0
  }
}
