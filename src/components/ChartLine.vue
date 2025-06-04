<template>
  <div class="chart-wrapper">
    <canvas
      :width="size.width"
      :height="size.height"
      ref="canvas"
      style="position: absolute; visibility: hidden"
    ></canvas>
    <div
      class="legend-wrapper"
      :style="legendStyle"
      v-if="localCharts.length > 0"
    >
      <div
        :class="[
          'legend-btn',
          'fas',
          { 'fa-chevron-right': legendVisible },
          { 'fa-chevron-left': !legendVisible },
        ]"
        :style="$store.getters.styleColors"
        @click="legendVisible = !legendVisible"
      ></div>
       
      <div style="overflow: auto; margin-right: 10px">
        <table class="legend-data">
        <tbody>
          <tr>
            <th></th>
            <th style="text-align: left">График</th>
            <th>Min</th>
            <th>Max</th>
            <th>Значение</th>
          </tr>
          <tr v-for="(chart, index) in localCharts" :key="index">
            <td>
              <check-box
                :color="chart.color"
                v-model="chart.visible"
                @update:modelValue="updateCharts()"
              ></check-box>
            </td>
            <td style="text-align: left">{{ chart.text }}</td>
            <td>
              {{
                chart.values.length === 0
                  ? 'нет'
                  : Math.round(chart.minY * 1000) / 1000
              }}
            </td>
            <td>
              {{
                chart.values.length === 0
                  ? 'нет'
                  : Math.round(chart.maxY * 1000) / 1000
              }}
            </td>
            <td>
              {{
                chart.values.length > 0 &&
                chart.values[line.index] &&
                chart.values[line.index].y !== null
                  ? Math.round(chart.values[line.index].y * 1000) / 1000
                  : 'нет'
              }}
            </td>
          </tr>
        </tbody>
          
        </table>
      </div>
    </div>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      ref="svg"
      :viewBox="view"
      :width="size.width"
      :height="size.height"
      @mousemove="mousemove"
      @mouseout="mouseout"
      shape-rendering="geometricPrecision"
    >
      <text ref="y" visibility="hidden" dy=".32em">
        {{ axis.y.longestText }}
      </text>
      <text ref="x" visibility="hidden" dy=".32em">
        {{ axis.x.ticks ? axis.x.ticks.map((r) => format(r)).toString() : '' }}
      </text>
      <g :transform="`translate(${padding.left},${padding.top})`">
        <g :transform="`translate(0,${chartHeight})`">
          <line style="pointer-events: none" :x2="chartWidth" stroke="#333" />
          <g
            v-for="(value, index) in axis.x.ticks"
            :transform="`translate(${
              (x.way === 'reversed' ? axis.x.max - value : value - axis.x.min) *
              xRate
            },0)`"
            :key="index"
          >
            <line style="pointer-events: none" y2="6" stroke="#333" />
            <text dy=".71em" y="9" style="text-anchor: middle; font-size: 11px">
              {{ format(value) }}
            </text>
            <line
              style="pointer-events: none"
              :y2="-chartHeight"
              stroke="#eee"
            />
          </g>
        </g>
        <g>
          <line style="pointer-events: none" :y2="chartHeight" stroke="#333" />
          <g
            v-for="(value, index) in axis.y.ticks"
            :transform="getYTickTransform(index)"
            :key="index"
          >
            <line style="pointer-events: none" x2="-6" stroke="#333" />
            <text dy=".36em" x="-8" style="text-anchor: end; font-size: 11px">
              {{ value }}
            </text>
            <line
              v-if="index !== axis.y.ticks.length - 1"
              style="pointer-events: none"
              :x2="chartWidth"
              stroke="#eee"
            />
          </g>
        </g>
        <g
          v-for="(chart, index) in localCharts"
          :key="index"
          :visibility="chart.visible ? 'visible' : 'hidden'"
        >
          <path
            v-for="(path, index) in chart.path"
            :style="chart.type === 'point' ? pathPointStyle : pathStyle"
            :d="path"
            :stroke="chart.color"
            :key="index"
          />
        </g>
        <g>
          <g :visibility="line.visible ? 'visible' : 'hidden'">
            <line
              :y2="chartHeight"
              :x1="line.x"
              :x2="line.x"
              style="stroke-width: 1; pointer-events: none"
              stroke="#333"
            />
            <text dy=".71em" :y="-11" :x="line.x" style="text-anchor: middle">
              {{ format(xValues[line.index]) }}
            </text>
            <template v-for="(chart, index) in localCharts">
              <circle
                v-if="
                  chart.visible &&
                  chart.values.length > 0 &&
                  chart.values[line.index] &&
                  chart.values[line.index].y
                "
                :key="index"
                :r="radius"
                :cx="getX(chart.values[line.index].x)"
                :cy="getY(chart.values[line.index].y)"
                :fill="chart.lightColor"
                :stroke="chart.color"
                @mouseover="circleOver"
                @mouseout="circleOut"
                style="transition: r 0.3s linear, stroke-width 0.3s linear"
              ></circle>
            </template>
          </g>
        </g>
      </g>
    </svg>
  </div>
</template>

<script>
// function throttle(fn, delay) {
//   let lastCall = 0;
//   return function (...args) {
//     const now = (new Date).getTime();
//     if (now - lastCall < delay) {
//       return;
//     }
//     lastCall = now;
//     return fn(...args);
//   }
// }

let decimals = (value) => {
  let result = Math.floor(Math.abs(Math.log(Math.abs(value)) / Math.LN10)) + 1
  return result === Math.abs(Infinity) ? 0 : result
}

import { lightenDarken } from '../plugins/api.js'
import { exportSvg } from '../plugins/export.js'

import CheckBox from './Inputs/CheckBox.vue'

export default {
  components: {
    CheckBox,
  },
  props: {
    x: {
      type: Object,
      default: () => ({ type: 'date', way: 'direct' }),
    },
    charts: {
      type: Object,
      default: () => {},
    },
    legend: {
      type: Object,
      default: () => ({ closed: false }),
    },
  },
  data() {
    return {
      padding: {
        top: 20,
        right: 20,
        bottom: 30,
        left: 0,
      },
      size: {
        width: 0,
        height: 0,
      },
      axis: {
        x: {
          min: 0,
          max: 0,
          diff: 0,
          rate: 1,
          ticks: null,
          maxTicks: 20,
        },
        y: {
          min: 0,
          max: 0,
          ticks: [],
          maxTicks: 10,
        },
      },
      line: {
        visible: false,
        x: 0,
        index: 0,
      },
      radius: 4,
      hoverRadius: 5,
      legendVisible: !this.legend.closed,
      localCharts: [],
      pathStyle: {
        fill: 'none',
        strokeWidth: 2,
        pointerEvents: 'none',
      },
      pathPointStyle: {
        fill: 'white',
        strokeWidth: 1,
        pointerEvents: 'none',
      },
    }
  },
  watch: {
    charts: {
      handler() {
        this.buildCharts()
      },
      deep: true,
    },
  },
  mounted() {
    this.$nextTick().then(() => {
      let rect = this.$el.getBoundingClientRect()
      this.size.width = rect.width
      this.size.height = rect.height
      this.buildCharts()
    })
  },
  computed: {
    legendStyle() {
      let right = 20
      return {
        right: right + 'px',
        maxWidth: this.size.width - right + 'px',
        transform: `translateX(${this.legendVisible ? '0' : '100%'})`,
      }
    },
    view() {
      return `0 0 ${this.size.width} ${this.size.height}`
    },
    chartWidth() {
      let value = this.size.width - this.padding.left - this.padding.right
      return value > 0 ? value : 0
    },
    chartHeight() {
      let value = this.size.height - this.padding.top - this.padding.bottom
      return value > 0 ? value : 0
    },
    xValues() {
      return [
        ...new Set(
          ...Object.values(this.charts).map((r) => r.values.map((x) => x.x))
        ),
      ]
    },
    xRate() {
      let diff = this.axis.x.max - this.axis.x.min
      return this.chartWidth / (diff === 0 ? 1 : diff)
    },
  },
  // created() {
  //   this.throttledMove = throttle(this.mousemove, 50)
  // },
  methods: {
    buildX(min, max) {
      let x = this.axis.x
      x.max = max
      x.min = min
      x.diff = max - min
      x.rate = x.diff === 0 ? this.chartWidth : this.chartWidth / x.diff
      x.ticks = []
      let tick = x.diff / x.maxTicks === 0 ? 1 : x.diff / x.maxTicks
      for (let i = 0; Math.round((min + tick * i) * 1000) / 1000 <= max; i++) {
        x.ticks.push(Math.round((min + tick * i) * 1000) / 1000)
      }
      this.$nextTick().then(() => {
        let textWidth = Math.round(this.$refs.x.getBBox().width * 1000) / 1000
        if (this.chartWidth < textWidth) {
          x.maxTicks = Math.ceil(x.maxTicks / 2)
          this.buildX(min, max)
        }
      })
    },
    buildY(min, max) {
      let y = this.axis.y
      y.max = max
      y.min = min === max ? 0 : min
      let diff = Math.abs(Math.ceil(y.max) - Math.floor(y.min))

      if (diff > 1) y.min = Math.floor(y.min)
      if (diff > 1) y.max = Math.ceil(y.max)
      let tick = (y.max - y.min) / y.maxTicks
      let round = Math.pow(10, diff > 1 ? 3 : decimals(tick))
      y.ticks = []
      y.longestText = ''
      for (let i = y.maxTicks + 1; i--; ) {
        let tickValue = Math.round((y.min + i * tick) * round) / round
        y.ticks[y.maxTicks - i] = tickValue
        if (tickValue.toString().length > y.longestText.toString().length) {
          y.longestText = tickValue
        }
      }
    },
    updateCharts() {
      let charts = this.localCharts.filter((r) => r.visible)
      this.buildY(
        charts.length > 0 ? Math.min(...charts.map((r) => r.minY)) : 0,
        charts.length > 0 ? Math.max(...charts.map((r) => r.maxY)) : 0
      )

      this.$nextTick().then(() => {
        this.padding.left =
          Math.round((this.$refs.y.getBBox().width + 8) * 1000) / 1000
        charts.forEach((r) => (r.path = this.getPath(r.values, r.type)))
      })
    },
    buildCharts() {
      let charts = Object.keys(this.charts).map((key) => {
        let xs = this.charts[key].values.map((r) => r.x)
        let ys = this.charts[key].values
          .filter((r) => r.y !== null)
          .map((r) => r.y)
        return {
          name: key,
          text: this.charts[key].text,
          color: this.charts[key].color,
          type: this.charts[key].type,
          visible: this.charts[key].visible,
          minX: xs.length > 0 ? Math.min(...xs, Number.MAX_SAFE_INTEGER) : 0,
          maxX: xs.length > 0 ? Math.max(...xs, Number.MIN_SAFE_INTEGER) : 0,
          minY: ys.length > 0 ? Math.min(...ys, Number.MAX_SAFE_INTEGER) : 0,
          maxY: ys.length > 0 ? Math.max(...ys, Number.MIN_SAFE_INTEGER) : 0,
          values: this.charts[key].values,
          lightColor: lightenDarken(this.charts[key].color, 25),
        }
      })
      this.buildX(
        charts.length > 0 ? Math.min(...charts.map((r) => r.minX)) : 0,
        charts.length > 0 ? Math.max(...charts.map((r) => r.maxX)) : 0
      )
      this.buildY(
        charts.length > 0 ? Math.min(...charts.map((r) => r.minY)) : 0,
        charts.length > 0 ? Math.max(...charts.map((r) => r.maxY)) : 0
      )

      this.$nextTick().then(() => {
        this.padding.left =
          Math.round((this.$refs.y.getBBox().width + 8) * 1000) / 1000
        charts.forEach((r) => (r.path = this.getPath(r.values, r.type)))
        this.localCharts = charts
      })
    },
    circleOver(event) {
      event.target.setAttribute('r', this.hoverRadius)
      event.target.setAttribute('stroke-width', 2)
    },
    circleOut(event) {
      event.target.setAttribute('r', this.radius)
      event.target.setAttribute('stroke-width', 1)
    },
    mouseout() {
      this.line.visible = false
    },
    mousemove(event) {
      if (!this.$refs.svg) return
      let ctm = this.$refs.svg.getScreenCTM()
      let x = (event.clientX - ctm.e) / ctm.a - this.padding.left
      let y = (event.clientY - ctm.f) / ctm.d - this.padding.top
      if (x >= 0 && x <= this.chartWidth && y >= 0 && y <= this.chartHeight) {
        this.line.visible = true
        this.line.x = x
        let value = 0
        switch (this.x.way) {
          case 'reversed':
            value = this.axis.x.max - this.line.x / this.xRate
            break
          case 'direct':
            value = this.axis.x.min + this.line.x / this.xRate
            break
        }

        let index = this.binarySearch(
          this.xValues,
          value,
          0,
          this.xValues.length - 1
        )

        if (this.line.index !== index) {
          this.line.index = index
        }
      } else {
        this.line.visible = false
      }
    },
    binarySearch(values, value, start, end) {
      const middle = Math.floor((start + end) / 2)
      if (value == values[middle]) return middle
      if (end - 1 === start)
        return Math.abs(values[start] - value) > Math.abs(values[end] - value)
          ? end
          : start
      switch (this.x.way) {
        case 'reversed':
          if (value < values[middle])
            return this.binarySearch(values, value, middle, end)
          if (value > values[middle])
            return this.binarySearch(values, value, start, middle)
          break
        case 'direct':
          if (value > values[middle])
            return this.binarySearch(values, value, middle, end)
          if (value < values[middle])
            return this.binarySearch(values, value, start, middle)
          break
      }
    },
    format(value) {
      if (value === null || typeof value === 'undefined') {
        return value
      }

      if (this.x.type === 'date') {
        let d = new Date(value)
        let date = new Date(
          d.getUTCFullYear(),
          d.getUTCMonth(),
          d.getUTCDate(),
          d.getUTCHours(),
          d.getUTCMinutes(),
          d.getUTCSeconds()
        )
        if (this.axis.x.diff / 1000 / 60 / 60 / 24 > 1) {
          return date.toLocaleString('ru', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
          })
        } else {
          return date.toLocaleString('ru', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        }
      }

      return value
    },
    getPath(values, type) {
      let pathes = []
      let path = ''
      let len = values.length
      let r = this.radius

      for (var i = len; i--; ) {
        let x = values[i].x
        let y = values[i].y
        if (type === 'line') {
          if (y === null) {
            if (path !== '') {
              pathes.push(path)
            }
            path = ''
          } else {
            path = `${path}${path === '' ? 'M' : ' L'} ${this.getX(
              x
            )} ${this.getY(y)}`
          }
        } else if (type === 'point') {
          if (y !== null) {
            path = `${path}${path === '' ? '' : ' '}M ${
              this.getX(x) - r
            } ${this.getY(y)} a ${r},${r} 0 1,0 ${2 * r},0 a ${r},${r} 0 1,0 ${
              -2 * r
            },0`
          }
        }
      }

      if (path !== '') {
        pathes.push(path)
      }

      return pathes
    },
    getX(value) {
      let x = 0
      if (typeof value !== 'undefined') {
        switch (this.x.way) {
          case 'reversed':
            x = this.axis.x.max - value
            break
          case 'direct':
            x = value - this.axis.x.min
            break
        }
        let width = this.axis.x.max - this.axis.x.min
        x = width === 0 ? 0 : (x / width) * this.chartWidth
      }

      return x
    },
    getY(value) {
      if (typeof value === 'undefined') {
        return 0
      }
      let height = this.axis.y.max - this.axis.y.min
      return height === 0
        ? 0
        : ((this.axis.y.max - value) / height) * this.chartHeight
    },
    getYTickTransform(index) {
      var denominator =
        this.axis.y.ticks.length > 1 ? this.axis.y.ticks.length - 1 : 1
      return 'translate(0,' + (index * this.chartHeight) / denominator + ')'
    },
    export(type, file) {
      switch (type) {
        case 'jpeg':
        case 'png':
          exportSvg(
            type,
            file,
            this.$refs.svg.cloneNode(true).outerHTML,
            this.$refs.canvas
          )
          break
        case 'svg':
          {
            let svgClone = this.$refs.svg.cloneNode(true)
            svgClone.setAttribute('width', '100%')
            svgClone.setAttribute('height', '100%')
            exportSvg(type, file, svgClone.outerHTML, this.$refs.canvas)
          }
          break
        default:
          break
      }
    },
  },
}
</script>

<style>
.chart-wrapper {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
}

.chart-wrapper .legend-wrapper {
  display: flex;
  position: absolute;
  top: 20px;
  white-space: nowrap;
  background-color: white;
  z-index: 100;
  box-shadow: 3px 3px 10px currentColor;
  border-spacing: 5px;
  color: #666;
  font-weight: normal;
  border-radius: 5px;
  transition: transform 0.5s cubic-bezier(0.65, 0.05, 0.36, 1);
}

.chart-wrapper .legend-btn {
  min-width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
  cursor: pointer;
}

.chart-wrapper .legend-data {
  margin: 5px;
  border-spacing: 7px 3px;
  border-collapse: inherit;
  text-align: right;
}

.chart-wrapper .legend-wrapper .color {
  width: 13px;
  height: 13px;
  border: 1px black solid;
}
</style>
