import { SchemeSystemTypeEnum } from '@/classes/enum/SchemeSystemTypeEnum'
import { CommonStatusEnum } from '../enum/CommonStatusEnum'

export class Point {
  image = 'fas fa-circle icon'
  checked: boolean = false

  id: number
  name: string
  state: CommonStatusEnum
  systemType: SchemeSystemTypeEnum
  hasArchives: boolean

  constructor({
    id,
    name,
    state,
    systemType,
    hasArchives
  }: {
    id: number
    name: string
    state: CommonStatusEnum
    systemType: SchemeSystemTypeEnum
    hasArchives: boolean
  }) {
    this.id = id
    this.name = name
    this.state = state
    this.systemType = systemType
    this.hasArchives = hasArchives
  }

  getSystemImage() {
    switch (this.systemType) {
      case SchemeSystemTypeEnum.ES:
        return 'point-electric'
      case SchemeSystemTypeEnum.GS:
        return 'point-gas'
      case SchemeSystemTypeEnum.GVS:
        return 'point-gvs'
      case SchemeSystemTypeEnum.GVS_Refill:
        return 'point-gvs'
      case SchemeSystemTypeEnum.HVS:
        return 'point-hvs'
      case SchemeSystemTypeEnum.PS:
        return 'point-ps'
      case SchemeSystemTypeEnum.SO:
        return 'point-so'
      case SchemeSystemTypeEnum.SO_Refill:
        return 'point-so'
      case SchemeSystemTypeEnum.SO_GVS:
        return 'point-sogvs'
      case SchemeSystemTypeEnum.SO_GVS_Refill:
        return 'point-sogvs'
      case SchemeSystemTypeEnum.PS | SchemeSystemTypeEnum.GVS:
        return 'point-psgvs'
      default:
        return 'point-common'
    }
  }
}