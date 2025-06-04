<template>
  <div :title="item.ToolTip" :style="item.getStyle()">
    <tool-bar
      :exportTypes="['csv', 'xls', 'xlsx']"
      @export="exportTable(item, $event)"
    >
      <div
        style="
          display: flex;
          flex: 1;
          align-items: center;
          text-align: center;
          font-weight: bold;
        "
      >
        {{ item.DefaultText }}
      </div>
    </tool-bar>
    <div
      class="table-grid"
      :style="{
        'grid-template-columns': `repeat(${
          item.Items.length + 1
        }, max-content)`,
      }"
    >
      <header class="header">{{ columnDate.text }}</header>
      <header class="header" v-for="(r, i) in item.Items" :key="i">
        {{ r.Text }}
      </header>
      <div v-for="(r, rowIndex) in rows" :key="rowIndex" class="table-row">
        <span class="cell">{{ r.time.toLocaleString() }}</span>
        <span class="cell" v-for="(column, i) in item.Items" :key="i">{{
          r[column.ParamCode]
        }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import Export from '../../plugins/export.js'

import ToolBar from '../ToolBar.vue'

export default {
  components: {
    ToolBar,
  },
  props: {
    item: {
      type: Object,
      default: null,
    },
    schema: {
      type: Object,
      default: null,
    },
    observer: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      columnDate: {
        text: 'Дата и время',
      },
      style: this.item.StyleNormal,
      startTime: new Date(),
      rows: [],
      wait: false,
      exporter: new Export(this.$http),
    }
  },
  created() {
    this.$emitter.on('message', this.processMessage)
    this.observer.on('clear', this.clear)
  },
  beforeUnmount() {
    this.$emitter.off('message', this.processMessage)
    this.observer.off('clear', this.clear)
  },
  mounted() {
    this.$nextTick().then(() => {
      this.startTime.setSeconds(this.startTime.getSeconds() - this.item.DpzTime)
    })
  },
  methods: {
    clear() {
      this.rows = []
    },
    async exportTable(table, type) {
      this.wait = true
      try {
        await this.exporter.post('symbolSchema/exportTable', {
          columns: [this.columnDate.text, ...table.Items.map((r) => r.Text)],
          values: [
            ...this.rows.map((r) => [
              r.time.toLocaleString(),
              ...table.Items.map((item) => r[item.ParamCode]),
            ]),
          ],
          name: table.DefaultText,
          type: type,
        })
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.wait = false
      }
    },
    processMessage(message) {
      if (
        message.data.action === 'pollSymbolSchema' &&
        message.data.key === this.item.x.key
      ) {
        let time = new Date()
        if (this.startTime < time) {
          this.item.Items.filter(
            (r) =>
              r.ParamCode === message.data.paramId &&
              (r.EquipID === -1 || r.EquipID === message.data.equipId)
          ).forEach((r) => {
            const originMu =
              this.$store.state.env.mUnits[
                message.data.mu ? message.data.mu : r.MeasureUnit
              ]
            const mu = r.ConvertMeasureUnit
              ? this.$store.state.env.mUnits[r.MeasureUnit]
              : originMu

            r.Text = `${r.DefaultText}${
              r.UseSpServerUnit && mu ? r.Separator + mu.text : ''
            }`
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

            switch (this.schema.TypeArch) {
              case 'jornal':
              case 'archDay':
              case 'archHour':
                break
              case 'real':
              default:
                {
                  let row = this.rows.find((r) => {
                    let rowTime = r.time.getTime()
                    return rowTime >= time.getTime() - 1000
                  })
                  if (row) {
                    row[message.data.paramId] = value
                  } else {
                    this.rows.unshift({
                      time,
                      [message.data.paramId]: value,
                    })
                    if (this.rows.length > this.schema.BufVal) {
                      this.rows.pop()
                    }
                  }
                }

                break
            }
          })
        }
      }
    },
  },
}
</script>
