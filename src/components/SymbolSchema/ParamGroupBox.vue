<template>
  <div :guid="item.Guid" :title="item.ToolTip" :style="item.getStyle()">
    <div v-if="item.LinkEquip >= 0 && item.LinkSchemaType >= 0 && item.LinkSchema >= 0" title="Перейти..." class="fas fa-project-diagram" style="color: #666; padding: 2px; cursor: pointer" @click="$emit('open', item)"></div>
    <div>{{ text }}</div>
    <item :style="getStyle(r)" v-for="(r, index) in item.Items" :key="index" v-bind="getData(r)" @paramChanged="onParamChanged" @writeDialog="$emit('writeDialog', $event)" />
  </div>
</template>

<script>
import Item from './Item.vue'

export default {
  components: {
    Item
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
      value: null,
      mu: null
    }
  },
  computed: {
    text() {
      let value = this.value

      if (this.item.SummariValue === 'none') {
        return this.item.DefaultText
      } else {
        if (this.item.DotDigitCount && typeof this.value === 'number' && !isNaN(this.value)) {
          value = this.value.toFixed(this.item.DotDigitCount)
        }

        value = `${this.value ? value : this.item.DefaultText}${this.item.UseSpServerUnit && this.mu ? (this.item.Separator ? this.item.Separator : ' ') + this.mu.text : (this.item.Separator ? this.item.Separator : '')}`

        return `${this.item.StartText} ${value ? value : this.item.StartValue}${this.item.EndText}`
      }
    }
  },
  methods: {
    getData(item) {
      return {
        item: item,
        observer: this.observer
      }
    },
    getStyle(item) {
      if (item.Type === 'paramLabel') {
        return this.item.ViewOnlyResult ? { visibility: 'hidden' } : null
      }
      return null
    },
    onParamChanged() {
      let items = this.item.Items.filter(r => r.Type === 'paramLabel' && r.Format === 'decimal')
      this.mu = items.length > 0 && items.every((r, i, a) => r.x.mu === a[0].x.mu) ? items[0].x.mu : null
      this.value = null
      switch (this.item.SummariValue) {
        case 'sum':
          this.value = items.reduce((acc, current) => acc + current.x.value, 0)
          break
        case 'div':
          this.value = items.reduce((acc, current) => acc - current.x.value, 0)
          break
        case 'avg':
          this.value = items.length === 0 ? null : items.reduce((acc, current) => acc + current.x.value, 0) / items.length
          break
        case 'max':
          this.value = Math.max(...items.map(r => r.x.value))
          break
        case 'min':
          this.value = Math.min(...items.map(r => r.x.value))
          break
        case 'count':
          this.value = items.Length
          break
        case 'none':
          this.value = this.item.ViewOnlyResult ? this.item.DefaultText : null
          break
      }
    }
  }
}
</script>
