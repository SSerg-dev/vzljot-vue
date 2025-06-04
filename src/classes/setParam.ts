export class SetParam {
  id?: number
  equipId?: number
  equipTypeParamId: number
  equipTypeId: number
  name: string
  text: string
  equipTypeName: string
  equipTypeParamName: string
  property: number
  value: string
  channelNumber?: number
  mu: number
  dataType?: string
  readCode?: number
  writeCode?: number

  checked: boolean = true
  time?: string = undefined
  equipMu?: number = undefined
  task = {
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

  constructor({
    id = undefined,
    equipId = undefined,
    equipTypeParamId,
    equipTypeId,
    name,
    text,
    equipTypeName,
    equipTypeParamName,
    property,
    value,
    channelNumber = undefined,
    mu,
    dataType = undefined,
    readCode = undefined,
    writeCode = undefined
  }: {
    id?: number
    equipId?: number
    equipTypeParamId: number
    equipTypeId: number
    name: string
    text: string
    equipTypeName: string
    equipTypeParamName: string
    property: number
    value: string
    channelNumber?: number
    mu: number
    dataType?: string
    readCode?: number
    writeCode?: number
  }) {
    this.id = id
    this.equipId = equipId
    this.equipTypeParamId = equipTypeParamId
    this.equipTypeId = equipTypeId
    this.name = name
    this.text = text
    this.equipTypeName = equipTypeName
    this.equipTypeParamName = equipTypeParamName
    this.property = property
    this.value = value
    this.channelNumber = channelNumber
    this.mu = mu
    this.dataType = dataType
    this.readCode = readCode
    this.writeCode = writeCode
  }
}