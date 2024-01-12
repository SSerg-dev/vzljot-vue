
export default class Measure {
  constructor (obj) {
    this.type = obj.type
    this.value = obj.defaultType
    this.text = obj.caption
    this.items = obj.measureUnits.map(unit => {
      return {
        value: unit.key,
        text: unit.value
      }
    })
  }
}
