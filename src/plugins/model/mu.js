export default class Mu {
  constructor (obj) {
    Object.getOwnPropertyNames(obj).forEach(r => {
      this[r] = obj[r]
    })
  }

  getDataTypes() {
    const arr = []

    if (this.type === 'dateTime') {
      arr.push('string')
      arr.push('dateTime')
    }
    else if (this.group) {
      arr.push('string')
      arr.push('single')
      arr.push('double')
    }
    else {
      arr.push('string')
      arr.push('boolean')
      arr.push('sByte')
      arr.push('byte')
      arr.push('int16')
      arr.push('uInt16')
      arr.push('int32')
      arr.push('uInt32')
      arr.push('int64')
      arr.push('uInt64')
      arr.push('single')
      arr.push('double')
    }
    return arr
  }
}

Mu.prototype.convert = function (value, mu) {
  if (this === mu) return value
  if (this.group !== mu.group) return value
  if (this.baseConvert === null || mu.baseConvert === null) return value

  if (this.base === mu.value) {
    return convert(this.convertType, value, this.ratio)
  } else {
    return convertReverse(mu.convertType, convert(this.convertType, value, this.ratio), mu.ratio)
  }
}

let convert = (type, value, ratio) => {
  let result = value
  switch (type) {
    case 'multiply':
      result = value * ratio
      break
    case 'divide':
      result = value / ratio
      break
    case 'add':
      result = value + ratio
      break
    case 'sub':
      result = value - ratio
      break
    default:
      break
  }
  return result
}

let convertReverse = (type, value, ratio) => {
  let result = value
  switch (type) {
    case 'multiply':
      result = value / ratio
      break
    case 'divide':
      result = value * ratio
      break
    case 'add':
      result = value - ratio
      break
    case 'sub':
      result = value + ratio
      break
    default:
      break
  }
  return result
}
