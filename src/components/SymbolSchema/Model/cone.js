import { hexToRgb, rgbToHex } from '../../../plugins/api.js'
import Drawing from './drawing'

export default class Cone extends Drawing {
  constructor (item, key) {
    super(item, key)
    this.x.component = 'cone'
  }

  getGradientColor () {
    let [r, g ,b] = hexToRgb(this.BackColor)
    let [dr, dg, db] = hexToRgb(this.BackColor).map(r => this.DepthGradient > 0 ? parseInt((255 - r) * this.DepthGradient / 100.0) : parseInt(r * this.DepthGradient / 100.0))
    return rgbToHex(r + dr, g + dg, b + db)
  }

  getPath () {
    let path

    const ratioX = this.Width * this.ParityLengths / 100
    const ratioY = this.Height * this.ParityLengths / 100
    switch (this.Rotate) {
      case 1:
        path = `M 0 0 l ${this.Width} 0 l -${(this.Width - ratioX) / 2} ${this.Height} l -${ratioX} 0 z`
        break
      case 2:
        path = `M 0 ${(this.Height - ratioY) / 2} l ${this.Width} ${-(this.Height - ratioY) / 2} l 0 ${this.Height} l -${this.Width} ${-(this.Height - ratioY) / 2} z`
        break
      case 3:
        path = `M ${(this.Width - ratioX) / 2} 0 l ${ratioX} 0 l ${(this.Width - ratioX) / 2} ${this.Height} l -${this.Width} 0 z`
        break
      default:
        path = `M 0 0 l ${this.Width} ${(this.Height - ratioY) / 2} l 0 ${ratioY} l -${this.Width} ${(this.Height - ratioY) / 2} z`
        break
    }

    return path
  }

  getTextStyle () {
    let style = {
      position: 'absolute',
      fontFamily: 'sans-serif',
      color: this.x.style.ForeColor,
      fontSize: this.x.style.Font.Size + 'pt',
      backgroundColor: this.x.style.BackColor,
      whiteSpace: 'nowrap'
    }
    
    if (this.TextAlign === 'topCenter') {
      style.left = '50%'
      style.transform = 'translate(-50%)'
    } else if (this.TextAlign === 'topRight') {
      style.right = '0'
    } else if (this.TextAlign === 'middleLeft') {
      style.top = '50%'
      style.left = '0'
      style.transform = 'translate(0, -50%)'
    } else if (this.TextAlign === 'middleCenter') {
      style.top = '50%'
      style.left = '50%'
      style.transform = 'translate(-50%, -50%)'
    } else if (this.TextAlign === 'middleRight') {
      style.top = '50%'
      style.right = '0'
      style.transform = 'translate(0, -50%)'
    } else if (this.TextAlign === 'bottomLeft') {
      style.bottom = '0'
      style.left = '0'
    } else if (this.TextAlign === 'bottomCenter') {
      style.bottom = '0'
      style.left = '50%'
      style.transform = 'translate(-50%)'
    } else if (this.TextAlign === 'bottomRight') {
      style.bottom = '0'
      style.right = '0'
    }

    if (this.x.style.Font.Bold) style.fontWeight = 'bold'
    return style
  }

  getItemStyle () {
    let style = {
      flex: 1,
      clipPath: `url(#${this.Guid})`
    }

    if (this.DepthGradient && this.DepthGradient > 0) {
      const gradientColor = this.getGradientColor()
      const ratio = this.ParityLengths / 100
      let grad = null
      if (ratio === 1) {
        switch (this.Rotate) {
          case 1:
            grad = `left`
            break
          case 2:
            grad = `top`
            break
          case 3:
            grad = `right`
            break
          default:
            grad = `bottom`
            break
        }
        style.background = `linear-gradient(to ${grad}, ${this.BackColor}, ${gradientColor} 50%, ${this.BackColor})`
      } else {
        let x = null
        let deg = null
        let grad = null

        switch (this.Rotate) {
          case 1:
            x = ratio * this.Height / (1 - ratio) + this.Height
            deg = 90 - Math.atan(x / this.Width * 2) / Math.PI * 180
            grad = `180deg at 50% ${x}px, ${this.BackColor} ${180 - deg}deg, ${gradientColor} 180deg, ${this.BackColor} ${180 + deg}deg`
            break
          case 2:
            x = ratio * this.Width / (1 - ratio)
            deg = 90 - Math.atan((x + this.Width) / this.Height * 2) / Math.PI * 180
            grad = `270deg at -${x}px 50%, ${this.BackColor} ${180 - deg}deg, ${gradientColor} 180deg, ${this.BackColor} ${180 + deg}deg`
            break
          case 3:
            x = ratio * this.Height / (1 - ratio)
            deg = 90 - Math.atan((x + this.Height) / this.Width * 2) / Math.PI * 180
            grad = `0deg at 50% -${x}px, ${this.BackColor} ${180 - deg}deg, ${gradientColor} 180deg, ${this.BackColor} ${180 + deg}deg`
            break
          default:
            x = ratio * this.Width / (1 - ratio) + this.Width
            deg = 90 - Math.atan(x / this.Height * 2) / Math.PI * 180
            grad = `90deg at ${x}px 50%, ${this.BackColor} ${180 - deg}deg, ${gradientColor} 180deg, ${this.BackColor} ${180 + deg}deg`
            break
        }
        style.background = `conic-gradient(from ${grad})`
      }
    } else {
      style.background = this.BackColor
    }

    return style
  }
}