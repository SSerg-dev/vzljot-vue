<template>
  <div :title="item.ToolTip" :style="item.getStyle()">
    <tool-bar :exportTypes="['jpeg', 'png', 'svg']" @export="exportSvg($event, item.DefaultText)">
      <div style="display:flex;flex:1;align-items:center;text-align:center;font-weight:bold;">
        {{ item.DefaultText }}
      </div>
    </tool-bar>
    <chart-line ref="chart" v-bind="{ charts: charts, legend: { closed: true } }"></chart-line>
  </div>
</template>

<script>
import { colorGenerator } from '../../plugins/api.js'

import ToolBar from '../ToolBar.vue'
import ChartLine from '../ChartLine.vue'

let getChartId = paramCode => `chart_${paramCode}`

let getUTC = t => new Date(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate(), t.getHours(), t.getMinutes(), t.getSeconds()))

export default {
  components: {
    ToolBar,
    ChartLine
  },
  props: {
    item: {
      type: Object,
      default: null
    },
    observer: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      charts: {}
    }
  },
  created() {
    this.$emitter.on('message', this.processMessage)
    this.observer.on('clear', this.init)
  },
  beforeUnmount() {
    this.$emitter.off('message', this.processMessage)
    this.observer.off('clear', this.init)
  },
  mounted() {
    this.$nextTick().then(() => this.init())
  },
  methods: {
    init() {
      // eslint-disable-next-line vue/no-mutating-props
      this.item.startTime = getUTC(new Date())
      let colors = colorGenerator()
      this.charts = Object.assign(
        {},
        ...this.item.Items.map(chart => {
          return {
            [getChartId(chart.ParamCode)]: {
              text: chart.Text,
              color: colors.next().value,
              values: function() {
                let values = []
                let time = getUTC(new Date())
                let maxTime = getUTC(new Date())
                time.setSeconds(time.getSeconds() - this.item.DpzTime)
                while (time < maxTime) {
                  values.push({
                    x: time.getTime(),
                    y: null
                  })
                  time.setSeconds(time.getSeconds() + 10)
                }
                return values
              }.call(this),
              visible: true,
              type: 'line'
            }
          }
        })
      )
    },
    exportSvg(type, name) {
      this.$refs.chart.export(type, name)
    },
    processMessage(message) {
      if (message.data.action === 'pollSymbolSchema' && message.data.key === this.item.x.key) {
        let utcTime = getUTC(new Date())
        if (this.item.startTime < utcTime) {
          this.item.Items.filter(r => r.ParamCode === message.data.paramId && (r.EquipID === -1 || r.EquipID === message.data.equipId)).forEach(r => {
            const originMu = this.$store.state.env.mUnits[message.data.mu ? message.data.mu : r.MeasureUnit]
            const mu = r.ConvertMeasureUnit ? this.$store.state.env.mUnits[r.MeasureUnit] : originMu

            let value = message.data.value
      
            if (r.ConvertMeasureUnit && r.MeasureUnit) {
              value = originMu.convert(value, mu)
            }

            if (value !== null) {
              let num = Number(value)
              if (r.DotDigitCount && typeof num === 'number' && !isNaN(num)) {
                value = num.toFixed(r.DotDigitCount)
              }
            }

            let chartId = getChartId(r.ParamCode)
            if (this.charts.hasOwnProperty(chartId)) {
              this.charts[chartId].text = `${r.DefaultText}${r.UseSpServerUnit && mu ? r.Separator + mu.text : ''}`
              if (this.charts[chartId].values[0].x < utcTime.getTime() - this.item.DpzTime * 1000) {
                this.charts[chartId].values.shift()
              }
              this.charts[chartId].values.push({ x: utcTime.getTime(), y: value })
            }
          })
        }
      }
    }
  }
}
</script>
