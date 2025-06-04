import Item from './item'

export default class Chart extends Item {
  constructor (item, key) {
    super(item, key)
    this.x.component = 'param-chart'
  }

  getStyle () {
    return Object.assign({
      overflow: 'auto',
      backgroundColor: this.StyleNormal.BackColor,
      display: 'flex',
      flexDirection: 'column',
      border: `1px solid #${this.AllowBorder ? '666' : 'ccc'}`
    }, super.getCoords())
  }
}