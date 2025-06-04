import { store } from '@/store/store'

import Factory from './factory'

export default class Item {
  constructor (param, key) {
    Object.getOwnPropertyNames(param).forEach(r => {
      this[r] = param[r]
    })
    this.initItem(this, key)
  }

  getSize () {
    return {
      width: this.Width + 'px',
      height: this.Height + 'px'
    }
  }

  getCoords () {
    return Object.assign({
      position: 'absolute',
      left: this.Left + 'px',
      top: this.Top + 'px'
    }, this.getSize())
  }

  getStyle () {
    let obj = this.getCoords()

    if (this.AllowBorder) {
      obj.border = '1px solid #666'
    }

    obj.backgroundColor = this.x.style.BackColor

    if ((this.DefaultText || (this.Type === 'paramLabel' && this.StartText) || this.Type === 'paramGroupBox') && this.TypeObj !== 'sphere' && this.Type !== 'paramTbl') {
      let hAlign = 'flex-start'
      let vAlign = 'flex-start'

      if (this.TextAlign === 'topCenter') {
        hAlign = 'center'
      } else if (this.TextAlign === 'topRight') {
        hAlign = 'flex-end'
      } else if (this.TextAlign === 'middleLeft') {
        vAlign = 'center'
      } else if (this.TextAlign === 'middleCenter') {
        hAlign = 'center'
        vAlign = 'center'
      } else if (this.TextAlign === 'middleRight') {
        hAlign = 'flex-end'
        vAlign = 'center'
      } else if (this.TextAlign === 'bottomLeft') {
        vAlign = 'flex-end'
      } else if (this.TextAlign === 'bottomCenter') {
        hAlign = 'center'
        vAlign = 'flex-end'
      } else if (this.TextAlign === 'bottomRight') {
        hAlign = 'flex-end'
        vAlign = 'flex-end'
      }

      obj.display = 'flex'
      obj.justifyContent = hAlign
      obj.alignItems = vAlign
      obj.fontFamily = 'sans-serif'

      obj.color = this.x.style.ForeColor
      obj.fontSize = this.x.style.Font.Size + 'pt'

      if (this.x.style.Font.Bold) obj.fontWeight = 'bold'
      if (this.x.style.Font.Italic) obj.fontStyle = 'italic'
      if (this.x.style.Font.Underline) obj.textDecoration = 'underline'
      if (this.x.style.Font.Strikeout) obj.textDecoration = (obj.textDecoration ? obj.textDecoration : '') + 'line-through'
    }

    return obj
  }

  setValue (originalValue, originalMu) {
    let value = null
    let mu = store.state.env.mUnits[originalMu ? originalMu : this.MeasureUnit]
    if (originalValue !== null) {
      switch (this.Format) {
        case 'text':
          value = originalValue
          break
        case 'decimal':
          value = Number(originalValue)
          if (Number.isNaN(value)) {
            value = originalValue
          }
          break
        case 'binaryInt':
          value = Number(originalValue)
          if (Number.isNaN(value)) {
            value = originalValue
          } else {
            value = value.toString(2)
          }
          break
      }
    }

    if (this.ConvertMeasureUnit && this.MeasureUnit) {
      this.x.mu = store.state.env.mUnits[this.MeasureUnit]
      this.x.value = mu.convert(value, this.x.mu)
    } else {
      this.x.value = value
      this.x.mu = mu
    }

    this.getText()
  }

  getText () {
    if (this.Type === 'paramLabel') {
      let value = this.x.value
      if (typeof value === 'number' && !isNaN(value)) {
        value = value.toFixed(parseInt(this.DotDigitCount))
      }
      value = `${this.x.value === null ? '' : value}${this.Separator + (this.UseSpServerUnit && this.x.mu ? this.x.mu.text : '')}`
      this.x.text = `${this.StartText} ${value}${this.EndText}`
    } else if (this.Type === 'simpleTimeLabel') {
      this.x.text = new Date().toLocaleString()
    } else if (this.DefaultText) {
      if (this.hasOwnProperty('UseDefaultText')) {
        this.x.text = this.UseDefaultText ? this.DefaultText : ''
      } else {
        this.x.text = this.DefaultText
      }
    }
  }

  initItem (item, key) {
    item.x = {
      style: item.StyleNormal,
      key: key,
      component: item.Type === 'paramGroupBox' ? 'param-group-box' : 'item'
    }
  
    if (item.Type === 'paramLabel') {
      item.x.value = null
      item.x.mu = null
    }
  
    item.getText()
  
    if (item.hasOwnProperty('Items')) {
      let factory = new Factory()
      item.Items = item.Items.map(r => factory.create(r, key))
    }
  }
}
