import Factory from './factory'

export default class Schema {
  constructor (jsonString, key) {
    let schema = JSON.parse(jsonString)
    if (schema.hasOwnProperty('Items')) {
      let factory = new Factory()
      schema.Items = schema.Items.map(r => factory.create(r, key))
    }

    Object.getOwnPropertyNames(schema).forEach(r => {
      this[r] = schema[r]
    })

    this.init(schema.Items)
  }

  init(items) {
    if (this.hasOwnProperty('UseSystemUnit') && !this.UseSystemUnit) {
      items.forEach(r => {
        r.ConvertMeasureUnit = false
        if (r.hasOwnProperty('Items')) {
          this.init(r.Items)
        }
      })
    }
  }
}
