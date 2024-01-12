import { lightenDarken } from '../../../plugins/api'
import * as api from '../../../chart/api'
import * as c from '../../../chart/const'
import { Tooltip } from '../../../chart/tooltip'

export class Chart {
  constructor(el, columns = [], rows = [], wrongs = [], archive = 'day') {
    this.wrapper = el
    this.data = {
      columns,
      rows,
      wrongs,
      archive
    }

    this.setup()
  }

  setup() {
    this.wrapper.insertAdjacentHTML('afterbegin', c.TEMPLATE)
    this.tooltip = new Tooltip(this.wrapper.querySelector('.chart-tooltip'))
    this.canvas = this.wrapper.querySelector('.chart')
    this.ctx = this.canvas.getContext('2d')
    this.rows_count = c.ROWS_COUNT

    const render = this.render.bind(this)

    this.mouseProxy = new Proxy(
      {},
      {
        set(...args) {
          const result = Reflect.set(...args)
          this.raf = requestAnimationFrame(render)
          return result
        }
      }
    )

    let resizing = false

    const resize = function() {
      this.measures()
      this.render()
      resizing = false
    }.bind(this)

    this.resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.contentBoxSize) {
          const contentBoxSize = Array.isArray(entry.contentBoxSize) ? entry.contentBoxSize[0] : entry.contentBoxSize

          if (contentBoxSize.inlineSize || contentBoxSize.blockSize) {
            if (resizing) {
              return
            }
            resizing = true
            this.raf = requestAnimationFrame(resize)
          } else {
            this.resizeObserver.unobserve(this.wrapper)
          }
        }
      }
    })

    this.resizeObserver.observe(this.wrapper)

    this.onMouseMove = this.onMouseMove.bind(this)
    this.onMouseLeave = this.onMouseLeave.bind(this)

    this.wrapper.addEventListener('mousemove', this.onMouseMove)
    this.wrapper.addEventListener('mouseleave', this.onMouseLeave)
  }

  onMouseMove({ clientX, clientY, target }) {
    const { left, top } = target.getBoundingClientRect()

    this.mouseProxy.mouse = {
      x: (clientX - left) * c.SCALE,
      y: (clientY - top) * c.SCALE,
      tooltip: {
        left: clientX - left,
        top: clientY - top
      }
    }
  }

  onMouseLeave() {
    this.mouseProxy.mouse = null
  }

  measures() {
    let { height, width } = this.wrapper.getBoundingClientRect()

    this.dpi_width = c.SCALE * width
    this.dpi_height = c.SCALE * height

    this.view_width = this.dpi_width - 2 * c.PADDING_WIDTH
    this.view_height = this.dpi_height - c.PADDING_HEIGHT_TOP - c.PADDING_HEIGHT_BOTTOM

    this.canvas.style.width = width + 'px'
    this.canvas.style.height = height + 'px'

    this.canvas.width = this.dpi_width
    this.canvas.height = this.dpi_height
  }

  toX(ratio) {
    return (_, i) => c.PADDING_WIDTH + i * ratio
  }

  toY(yRatio, yMin, index) {
    return y => Math.round(this.view_height + c.PADDING_HEIGHT_TOP - (y[index] - yMin) * yRatio)
  }

  render() {
    this.ctx.clearRect(0, 0, this.dpi_width, this.dpi_height)
    this.ctx.setLineDash([])

    const { yMin, yMax } = api.getBoundaries(this.data)
    const xRatio = this.view_width / (this.data.rows.length - 1)
    const yRatio = this.view_height / (yMax - yMin)

    const xValues = this.data.rows.map(this.toX(xRatio))

    const yValues = new Map()
    this.data.columns.filter((_, i) => i !== 0).forEach(r => yValues.set(r, this.data.rows.map(this.toY(yRatio, yMin, r.index))))

    if (xValues.length > 1) {
      const zeroDate = this.data.rows[0][0].getTime()
      const ratio =  (xValues[1] - xValues[0]) / (this.data.rows[1][0].getTime() - zeroDate)

      this.data.wrongs.map(r => [(r[0].getTime() - zeroDate) * ratio + c.PADDING_WIDTH, Math.round((r[1].getTime() - r[0].getTime()) * ratio)])
        .forEach(([x, width]) => api.rect(this.ctx, x, width, c.PADDING_HEIGHT_TOP, this.view_height))
    }

    this.drawRows(this.ctx)
    this.xAxis(this.ctx, xRatio)
    this.yAxis(this.ctx)

    yValues.forEach((v, k) => api.line(this.ctx, xValues, v, { color: k.color, dashed: k.isSetPoint }))

    this.yAxisText(this.ctx, yMin, yMax)

    for (let i = 0; i < xValues.length; i++) {
      if (this.mouseProxy.mouse && api.isOver(this.mouseProxy.mouse.x, xValues[i], xValues.length - 1, this.view_width)) {
        api.cursor(this.ctx, xValues[i], c.PADDING_HEIGHT_TOP, this.view_height + c.PADDING_HEIGHT_TOP)

        yValues.forEach((v, k) => {
          api.circle(this.ctx, xValues[i], v[i], { color: k.color, fillColor: lightenDarken(k.color, 25) })
        })

        break
      }
    }
  }

  dispose() {
    this.resizeObserver.unobserve(this.wrapper)
    cancelAnimationFrame(this.raf)
    this.wrapper.removeEventListener('mousemove', this.onMouseMove)
    this.wrapper.removeEventListener('mouseleave', this.onMouseLeave)
  }

  drawRows(ctx) {
    ctx.beginPath()
    ctx.lineWidth = 1
    ctx.strokeStyle = '#bbb'

    this.rows_count = 1

    while (this.rows_count < c.ROWS_COUNT && this.view_height / (this.rows_count + 1) > 100) {
      this.rows_count++
    }

    const step = this.view_height / this.rows_count

    for (let i = 0; i < this.rows_count; i++) {
      const y = Math.round(step * i) + c.PADDING_HEIGHT_TOP - 0.5

      ctx.moveTo(c.PADDING_WIDTH, y)
      ctx.lineTo(this.dpi_width - c.PADDING_WIDTH, y)
    }

    ctx.stroke()
    ctx.closePath()
  }

  xAxis(ctx, xRatio) {
    ctx.font = c.FONT
    ctx.lineWidth = c.AXIS_WIDTH
    ctx.strokeStyle = c.AXIS_COLOR
    ctx.fillStyle = c.FONT_COLOR
    ctx.setLineDash([])
    ctx.beginPath()

    const labelWidth = api.getTextBBox(ctx, api.formatDate(this.data.rows[0][0], this.data.archive)).width

    let step = 1
    let textLength = (labelWidth + labelWidth / 2) * this.data.rows.length

    while (textLength > this.view_width) {
      step++
      textLength = ((labelWidth + labelWidth / 2) * this.data.rows.length) / step
    }

    const y1Line = this.view_height + c.PADDING_HEIGHT_TOP
    const y2Line = y1Line + c.PADDING_HEIGHT_BOTTOM / 3
    const yText = this.dpi_height - 30

    for (let i = 0; i < this.data.rows.length; i++) {
      const x = Math.round(i * xRatio + c.PADDING_WIDTH)

      if (i % step === 0) {
        ctx.moveTo(x, y1Line)
        ctx.lineTo(x, y2Line)
        ctx.fillText(api.formatDate(this.data.rows[i][0], this.data.archive), x + 10, yText)
      }

      if (this.mouseProxy.mouse) {
        if (api.isOver(this.mouseProxy.mouse.x, x, this.data.rows.length - 1, this.view_width)) {
          this.tooltip.show(this.mouseProxy.mouse.tooltip, {
            title: `Дата: ${api.formatDate(this.data.rows[i][0], this.data.archive)}`,
            items: this.data.columns
              .filter((r, i) => i !== 0)
              .map(r => ({
                name: r.name,
                color: r.color,
                value: this.data.rows[i][r.index]
              }))
          })
        }
      } else {
        this.tooltip.hide()
      }
    }

    ctx.moveTo(c.PADDING_WIDTH, y1Line - 0.5)
    ctx.lineTo(this.dpi_width - c.PADDING_WIDTH, y1Line - 0.5)

    ctx.stroke()
    ctx.closePath()
  }

  yAxis(ctx) {
    ctx.lineWidth = c.AXIS_WIDTH
    ctx.strokeStyle = c.AXIS_COLOR
    ctx.setLineDash([])

    ctx.beginPath()

    ctx.moveTo(c.PADDING_WIDTH - 0.5, c.PADDING_HEIGHT_TOP)
    ctx.lineTo(c.PADDING_WIDTH - 0.5, this.view_height + c.PADDING_HEIGHT_TOP)

    ctx.stroke()
    ctx.closePath()
  }

  // decimals (value) {
  //   let result = Math.floor(Math.abs(Math.log(Math.abs(value)) / Math.LN10)) + 1
  //   return result === Math.abs(Infinity) ? 0 : result
  // }

  yAxisText(ctx, yMin, yMax) {
    const step = this.view_height / this.rows_count
    const textStep = (yMax - yMin) / this.rows_count

    ctx.font = c.FONT
    ctx.fillStyle = c.FONT_COLOR

    // let diff = Math.abs(Math.ceil(yMax) - Math.floor(yMin))

    // if (diff > 1) {
    //   yMin = Math.floor(yMin)
    //   yMax = Math.ceil(yMax)
    // }

    // let round = Math.pow(10, diff > 1 ? 3 : decimals((yMax - yMin) / this.rows_count))

    for (let i = 0; i < this.rows_count + 1; i++) {
      const y = step * i + c.PADDING_HEIGHT_TOP + c.PADDING_Y_TEXT
      const text = new String(Math.round((yMax - textStep * i) * 10) / 10)
      const { width, height } = api.getTextBBox(ctx, text)
      const rectHeightPadding = height / 3

      ctx.fillStyle = '#fff'
      ctx.fillRect(Math.round(c.PADDING_WIDTH + c.PADDING_X_TEXT - c.PADDING_X_TEXT / 2), Math.round(y - height - rectHeightPadding), Math.round(width + c.PADDING_X_TEXT), Math.round(height + 2 * rectHeightPadding))
      ctx.fillStyle = c.FONT_COLOR
      ctx.fillText(text, c.PADDING_WIDTH + c.PADDING_X_TEXT, y)
    }
  }

  update(columns, rows, wrongs, archive) {
    this.data = {
      columns,
      rows,
      wrongs,
      archive
    }

    this.render()
  }
}
