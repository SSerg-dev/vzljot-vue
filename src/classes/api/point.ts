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
    hasArchives,
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

}
