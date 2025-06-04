import { CommonStatusEnum } from "../enum/CommonStatusEnum"

export class BalanceGroup {
  image = 'fas fa-sitemap icon'
  checked: boolean = false

  id: number
  name: string
  isSource: boolean
  state: CommonStatusEnum
  subGroup: number
  hasArchives: boolean

  constructor({
    id,
    name,
    isSource,
    state,
    subGroup,
    hasArchives
  }: {
    id: number
    name: string
    isSource: boolean
    state: CommonStatusEnum
    subGroup: number
    hasArchives: boolean
  }) {
    this.id = id
    this.name = name
    this.isSource = isSource
    this.state = state
    this.subGroup = subGroup
    this.hasArchives = hasArchives
  }
}