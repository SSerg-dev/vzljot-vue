export default class Form {
  constructor({
    id = null,
    type = null,
    objectId = null,
    report = null,
    pattern = null,
    source = 0,
    winter = true,
    summer = true,
    landscape = true
  }) {
    this.id = id
    this.type = type
    this.objectId = objectId
    this.report = report
    this.pattern = pattern
    this.source = source
    this.winter = winter
    this.summer = summer
    this.landscape = landscape
  }

  async save(http) {
    return await http.post(`${this.type === 'DbEquip' ? 'equip' : 'point'}Report/report`, this)
  }
}
