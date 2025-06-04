import Item from './item'

export default class Picture extends Item {
  constructor (item, key) {
    super(item, key)
    this.x.component = 'vue-image'
  }

  getStyle() {
    let style = super.getCoords()

    style.overflow = 'hidden'

    if (this.AllowBorder) {
      style.border = '1px solid #666'
    }

    return style
  }

  getImgStyle() {
    let x = 0
    let y = 0
    let deg = 90 * this.RotatePict
    let rad = deg * Math.PI / 180

    if (deg == 90) {
      x = 0
      y = this.Height
    } else if (deg == 180) {
      x = this.Width
      y = this.Height
    } else if (deg == 270) {
      x = this.Width
      y = 0
    }

    x = x - this.Width / 2
    y = y - this.Height / 2

    return {
      backgroundColor: this.x.style.BackColor,
      width: (this.RotatePict % 2 ? this.Height : this.Width) + 'px',
      height: (this.RotatePict % 2 ? this.Width : this.Height) + 'px',
      position: 'absolute',
      backgroundImage: `url('data:image/png;base64,${this.ImagePict}')`,
      backgroundSize: '100% 100%',
      transform: `rotate(${deg}deg)`,
      left: (x * Math.cos(rad) - y * Math.sin(rad) + this.Width / 2) + 'px',
      top: (x * Math.sin(rad) + y * Math.cos(rad) + this.Height / 2) + 'px'
    }
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
}
