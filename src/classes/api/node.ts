import { CommonStatusEnum } from '../enum/CommonStatusEnum'
import { NodeTypeEnum } from '../enum/NodeTypeEnum'

export class Node {
  image = 'fas fa-home-lg-alt-o icon'
  checked: boolean = false

  id: number
  name: string
  isSource: boolean
  nodeType: NodeTypeEnum
  state: CommonStatusEnum
  subGroup: number
  hasArchives: boolean

  constructor({
    id,
    name,
    isSource,
    nodeType,
    state,
    subGroup,
    hasArchives
  }: {
    id: number
    name: string
    isSource: boolean
    nodeType: NodeTypeEnum
    state: CommonStatusEnum
    subGroup: number
    hasArchives: boolean
  }) {
    this.id = id
    this.name = name
    this.isSource = isSource
    this.nodeType = nodeType
    this.state = state
    this.subGroup = subGroup
    this.hasArchives = hasArchives

    if (nodeType === NodeTypeEnum.ResidentialBuilding) {
      this.image = 'fas fa-home-lg-alt icon'
    }
  }
}
