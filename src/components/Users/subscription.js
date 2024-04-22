import { store } from '@/store/store'

export default class Subscription {
  constructor(obj) {
    this.id = obj && Object.prototype.hasOwnProperty.call(obj, 'id') ? obj.id : null

    this.name = obj && Object.prototype.hasOwnProperty.call(obj, 'name') ? obj.name : null

    this.priority = obj && Object.prototype.hasOwnProperty.call(obj, 'priority') ? obj.priority : 'normal'

    this.includeRelatedEquips = obj && Object.prototype.hasOwnProperty.call(obj, 'includeRelatedEquips') ? obj.includeRelatedEquips : false

    this.includeRelatedMeasureSchemes = obj && Object.prototype.hasOwnProperty.call(obj, 'includeRelatedMeasureSchemes') ? obj.includeRelatedMeasureSchemes : false

    this.sourceEquip = obj && Object.prototype.hasOwnProperty.call(obj, 'sourceEquip') ? obj.sourceEquip : 'none'

    this.sourceMeasureScheme = obj && Object.prototype.hasOwnProperty.call(obj, 'sourceMeasureScheme') ? obj.sourceMeasureScheme : 'none'

    this.equips = obj && Object.prototype.hasOwnProperty.call(obj, 'equips') ? JSON.parse(JSON.stringify(obj.equips)) : []

    this.equipLists = obj && Object.prototype.hasOwnProperty.call(obj, 'equipLists') ? JSON.parse(JSON.stringify(obj.equipLists)) : []

    this.points = obj && Object.prototype.hasOwnProperty.call(obj, 'points') ? JSON.parse(JSON.stringify(obj.points)) : []

    this.pointLists = obj && Object.prototype.hasOwnProperty.call(obj, 'pointLists') ? JSON.parse(JSON.stringify(obj.pointLists)) : []

    this.pointGroups = obj && Object.prototype.hasOwnProperty.call(obj, 'pointGroups') ? JSON.parse(JSON.stringify(obj.pointGroups)) : []

    this.nodes = obj && Object.prototype.hasOwnProperty.call(obj, 'nodes') ? JSON.parse(JSON.stringify(obj.nodes)) : []

    this.balanceGroups = obj && Object.prototype.hasOwnProperty.call(obj, 'balanceGroups') ? JSON.parse(JSON.stringify(obj.balanceGroups)) : []

    this.events = obj && Object.prototype.hasOwnProperty.call(obj, 'events') ? JSON.parse(JSON.stringify(obj.events)) : Object.assign({}, ...Object.keys(store.state.env.systemMessageTypeEnum).map(r => ({ [r]: { source: 'none', selected: [] } })))
  }
}
