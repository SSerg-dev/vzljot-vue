const LINE_WIDTH = 4
const CURSOR_WIDTH = 2

const DATE_FORMAT = {
  hour: {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit'
  },
  day: {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  },
  month: {
    year: 'numeric',
    month: 'long'
  }
}

export function getBoundaries({ columns, rows }) {
  let yMin = Number.MAX_VALUE
  let yMax = Number.MIN_VALUE

  const indexes = columns.filter(r => Object.prototype.hasOwnProperty.call(r, 'index')).map(r => r.index)

  for (let i = 0; i < rows.length; i++) {
    indexes.forEach(r => {
      if (yMin > rows[i][r]) yMin = rows[i][r]
      if (yMax < rows[i][r]) yMax = rows[i][r]
    })
  }

  return { yMin, yMax }
}

export function getTextBBox(ctx, text) {
  const metrics = ctx.measureText(text)
  const left = metrics.actualBoundingBoxLeft * -1
  const top = metrics.actualBoundingBoxAscent * -1
  const right = metrics.actualBoundingBoxRight
  const bottom = metrics.actualBoundingBoxDescent
  // actualBoundinBox... excludes white spaces
  const width = text.trim() === text ? right - left : metrics.width
  const height = bottom - top
  return { left, top, right, bottom, width, height }
}

export function line(ctx, xValues, yValues, { color, dashed }) {
  ctx.lineWidth = LINE_WIDTH
  ctx.strokeStyle = color

  ctx.setLineDash([])

  if (dashed) {
    ctx.setLineDash([10, 10])
  }

  ctx.beginPath()

  ctx.moveTo(xValues[0] - LINE_WIDTH / 2, yValues[0])

  xValues.forEach((r, i) => ctx.lineTo(r - LINE_WIDTH / 2, yValues[i]))

  ctx.stroke()
  ctx.closePath()
}

export function circle(ctx, x, y, { color, fillColor }) {
  ctx.lineWidth = LINE_WIDTH
  ctx.setLineDash([])

  ctx.strokeStyle = color
  ctx.fillStyle = fillColor

  ctx.beginPath()

  ctx.arc(x, y, 15, 0, 2 * Math.PI)

  ctx.moveTo(x, y)

  ctx.fill()
  ctx.stroke()
  ctx.closePath()
}

export function cursor(ctx, x, y, height) {
  ctx.setLineDash([])

  ctx.lineWidth = CURSOR_WIDTH
  ctx.strokeStyle = 'darkslategrey'

  ctx.beginPath()

  const vx = Math.round(x - CURSOR_WIDTH / 2) - 0.5

  ctx.moveTo(vx, y)
  ctx.lineTo(vx, height)

  ctx.stroke()
  ctx.closePath()
}

export function rect(ctx, x, width, y, height) {
  ctx.fillStyle = '#fdeef1'

  ctx.beginPath()

  ctx.fillRect(x, y, width, height)

  ctx.fill()
  ctx.closePath()
}

export function formatDate(value, archive) {
  // console.log('format', value.toLocaleString('ru-Ru', DATE_FORMAT[archive]), archive, DATE_FORMAT[archive])
  return value.toLocaleString('ru-Ru', DATE_FORMAT[archive])
}

export function isOver(mouseX, x, length, width) {
  // console.log('isOver', mouseX, x, length, width, Math.abs(x - mouseX) < width / length / 2)

  return Math.abs(x - mouseX) < width / length / 2
}
