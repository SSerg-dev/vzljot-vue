import Item from './item'

export default class Drawing extends Item {
  constructor (item, key) {
    super(item, key)
    this.x.component = 'drawing'
  }

  getStyle () {
    let style = super.getCoords()

    style.overflow = 'hidden'
    style.backgroundColor = this.x.style.BackColor

    if (this.AllowBorder) {
      style.border = '1px solid #666'
    }

    return style
  }
}