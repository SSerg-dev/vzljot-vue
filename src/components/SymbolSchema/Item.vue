<template>
  <div :guid="item.Guid" :title="item.ToolTip" :style="item.getStyle()">
    {{ item && item.x ? item.x.text : null }}
    <div v-if="item.LinkEquip >= 0 && item.LinkSchemaType >= 0 && item.LinkSchema >= 0" title="Перейти..." class="fas fa-project-diagram icon" @click="$emit('open', item)"></div>
    <div v-if="item.AllowWrite" title="Редактировать..." class="fas fa-edit icon" @click="$emit('writeDialog', item)" />
  </div>
</template>

<script>

  let style = (item, originStyle) => {
    let style = originStyle
    let value = Number(item.x.value)
    if (style === 'StyleShowValue') {
      switch (item.Format) {
        case 'decimal':
        case 'binaryInt':
          if ((value <= item.NGD || value >= item.VGD) && item.GDOnOff) {
            style = 'StyleHLDFormat'
          }
          else if ((value <= item.NAG || value >= item.VAG) && item.AGOnOff) {
            style = 'StyleHLAGFormat'
          }
          else if ((value <= item.NRG || value >= item.VRG) && item.RGOnOff) {
            style = 'StyleHLRGFormat'
          }
          break
        default:
          break
      }
    }
    return item[style]
  }

export default {
  name: 'itemComponent',
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
  created() {
    this.$emitter.on('message', this.processMessage)
    this.observer.on('clear', this.clear)
    if (this.item.Type === 'simpleTimeLabel') {
      this.timer = setInterval(() => this.item.getText(), 1000)
    }
  },
  beforeUnmount() {
    this.$emitter.off('message', this.processMessage)
    this.observer.off('clear', this.clear)
    if (this.timer) clearInterval(this.timer)
  },
  methods: {
    clear() {
      this.item.setValue(null, null)
      this.$emit('paramChanged', this.item)
    },
    processMessage(message) {
      if (message.data.action === 'pollSymbolSchema' && message.data.key === this.item.x.key) {
        if (message.data.state === 'stopped') {
          // eslint-disable-next-line vue/no-mutating-props
          this.item.x.style = this.item.StyleNormal
        }

        if (this.item.ParamCode === message.data.paramId && this.item.EquipID === message.data.equipId) {
          // eslint-disable-next-line vue/no-mutating-props
          this.item.x.style = style(this.item, message.data.style)

          if (message.data.state === 'success') {
            this.item.setValue(message.data.value, message.data.mu)
            this.$emit('paramChanged', this.item)
          }
        }
      }
    }
  }
}
</script>

<style scoped>
.icon {
  position: absolute;
  left: 0;
  color: #666;
  padding: 2px;
  cursor: pointer;
}
</style>
