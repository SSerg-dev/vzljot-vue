<template>
  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" :style="item.getStyle()">
    <template v-if="item.DepthGradient && item.DepthGradient > 0">
			<component :is="getGradientName(item)" v-bind="getGradient(item)">
				<stop v-for="(r, i) in getOffset(item)" :key="i" v-bind="r" />
			</component>
    </template>
    <ellipse v-if="item.TypeObj === 'sphere'" :style="getItemStyle(item)" :cx="item.Width / 2" :cy="item.Height / 2" :rx="item.Width / 2" :ry="item.Height / 2">
      <title v-if="item.ToolTip">{{ item.ToolTip }}</title>
    </ellipse>
    <path v-else :d="getPath(item)" :style="getItemStyle(item)">
      <title v-if="item.ToolTip">{{ item.ToolTip }}</title>
    </path>
    <text v-if="item.DefaultText && item.UseDefaultText" v-bind="getTextProps(item)">{{ item.DefaultText }}</text>
  </svg>
</template>

<script>
  import { hexToRgb, rgbToHex } from '../../plugins/api.js'

  export default {
    name: 'drawingComponent',
    props: {
      item:  {
        type: Object,
        default: null
      }
    },
    methods: {
      getGradientColor(item) {
				let [r, g ,b] = hexToRgb(item.BackColor)
				let [dr, dg, db] = hexToRgb(item.BackColor).map(r => item.DepthGradient > 0 ? parseInt((255 - r) * item.DepthGradient / 100.0) : parseInt(r * item.DepthGradient / 100.0))
				return rgbToHex(r + dr, g + dg, b + db)
      },
      getPath(item) {
        let path
        
        if (item.TypeObj === 'arc') {
					let width = item.Width / 4
					let height = item.Height / 4
					switch (item.Rotate) {
						case 1:
							path = `M 0 ${height} L 0 0 A ${item.Width} ${item.Height}, 0, 0, 1, ${item.Width} ${item.Height} L ${item.Width - width} ${item.Height} A ${item.Width - width} ${item.Height - height}, 0, 0, 0, 0 ${height}`
							break
						case 2:
							path = `M ${item.Width - width} 0 L ${item.Width} 0 A ${item.Width} ${item.Height}, 0, 0, 1, 0 ${item.Height} L 0 ${item.Height - height} A ${item.Width - width} ${item.Height - height}, 0, 0, 0, ${item.Width - width} 0`
							break
						case 3:
							path = `M ${item.Width} ${item.Height - height} L ${item.Width} ${item.Height} A ${item.Width} ${item.Height}, 0, 0, 1, 0 0 L ${width} 0 A ${item.Width - width} ${item.Height - height}, 0, 0, 0, ${item.Width} ${item.Height - height}`
							break
						default:
							path = `M ${width} ${item.Height} L ${0} ${item.Height} A ${item.Width} ${item.Height}, 0, 0, 1, ${item.Width} 0 L ${item.Width} ${height} A ${item.Width - width} ${item.Height - height}, 0, 0, 0, ${width} ${item.Height}`
							break
					}
        } else if (item.TypeObj === 'hemisphere') {
					switch (item.Rotate) {
						case 1:
							path = `M 0 ${item.Height} A ${item.Width / 2} ${item.Height} 0 1 1 ${item.Width} ${item.Height}`
							break
						case 2:
							path = `M 0 0 A ${item.Width} ${item.Height / 2} 0 1 1 0 ${item.Height}`
							break
						case 3:
							path = `M ${item.Width} 0 A ${item.Width / 2} ${item.Height} 0 1 1 0 0`
							break
						default:
              path = `M ${item.Width} ${item.Height} A ${item.Width} ${item.Height / 2} 0 1 1 ${item.Width} 0`
							break
					}
        }
        return path
			},
			getGradientName() {
				return 'radialGradient'
			},
			getGradient(item) {
        let cx = 0.5
        let cy = 0.5
        let r = 0.5

        if (item.TypeObj === 'hemisphere') {
          switch (item.Rotate) {
            case 1:
              cx = 0.5, cy = 1
              break
            case 2:
              cx = 0, cy = 0.5
              break
            case 3:
              cx = 0.5, cy = 0
              break
            default:
              cx = 1, cy = 0.5
              break
          }
          r = 1					
        } else if (item.TypeObj === 'arc') {
          switch (item.Rotate) {
            case 1:
              cx = 0, cy = 1
              break
            case 2:
              cx = 0, cy = 0
              break
            case 3:
              cx = 1, cy = 0
              break
            default:
              cx = 1, cy = 1
              break
          }
          r = 1.5
        }

        return {
          id: item.Guid,
          cx: cx,
          cy: cy,
          r: r
        }					
			},
			getOffset(item) {
				let stopColor = 'stop-color'
				if (item.TypeObj === 'arc') {
					return [
						{ offset: '49%', [stopColor]: item.BackColor },
						{ offset: '59%', [stopColor]: this.getGradientColor(item) },
						{ offset: '67%', [stopColor]: item.BackColor }
					]
				} else {
					return [
						{ offset: '0%', [stopColor]: this.getGradientColor(item) },
						{ offset: '100%', [stopColor]: item.BackColor }
					]
				}
			},
      getItemStyle(item) {
        let style = {}

        if (!item.DepthGradient || item.DepthGradient && item.DepthGradient === 0) {
          style.fill = this.item.x.style.BackColor
        } else {
          style.fill = `url(#${item.Guid})`
        }

        return style
      },
      getTextProps(item) {
        let props = {
          x: item.TextAlign.indexOf('Left') > -1 ? 0 : item.TextAlign.indexOf('Right') > -1 ? item.Width : item.Width / 2,
          y: item.TextAlign.indexOf('top') > -1 ? 0 : item.TextAlign.indexOf('bottom') > -1 ? item.Height : item.Height / 2,
          style: {
            textAnchor: item.TextAlign.indexOf('Left') > -1 ? 'start' : item.TextAlign.indexOf('Right') > -1 ? 'end' : 'middle',
            dominantBaseline: item.TextAlign.indexOf('top') > -1 ? 'text-before-edge' : item.TextAlign.indexOf('bottom') > -1 ? 'text-after-edge' : 'middle',
            fontFamily: 'sans-serif',
            fill: this.item.x.style.ForeColor,
            fontSize: this.item.x.style.Font.Size + 'pt'
          }
        }
        if (this.item.x.style.Font.Bold) props.style.fontWeight = 'bold'
        return props
      }
    }
  }
</script>
