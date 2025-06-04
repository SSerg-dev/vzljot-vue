import { CommonStatusEnum } from "../enum/CommonStatusEnum"

export class PointList {
  image = 'fas fa-list-alt icon'
  checked: boolean = false

  id: number
  name: string
  state: CommonStatusEnum
  isSource: boolean
  hasArchives: boolean

  constructor({
    id,
    name,
    state,
    isSource,
    hasArchives
  }: {
    id: number
    name: string
    state: CommonStatusEnum
    isSource: boolean
    hasArchives: boolean
  }) {
    this.id = id
    this.name = name
    this.state = state
    this.isSource = isSource
    this.hasArchives = hasArchives
  }
}