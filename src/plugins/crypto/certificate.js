export default class Certificate {
  constructor(obj, isLocal = true) {
    this.type = 33
    this.thumbprint =
      obj && Object.prototype.hasOwnProperty.call(obj, 'thumbprint')
        ? obj.thumbprint
        : null
    this.issuer =
      obj && Object.prototype.hasOwnProperty.call(obj, 'issuer')
        ? obj.issuer
        : null
    this.subject =
      obj && Object.prototype.hasOwnProperty.call(obj, 'subject')
        ? obj.subject
        : null
    this.validToLocal =
      obj && Object.prototype.hasOwnProperty.call(obj, 'validTo')
        ? new Date(obj.validTo).toLocaleString()
        : null
    this.validTo =
      obj && Object.prototype.hasOwnProperty.call(obj, 'validTo')
        ? new Date(obj.validTo)
        : null
    this.isLocal = isLocal
  }
}
