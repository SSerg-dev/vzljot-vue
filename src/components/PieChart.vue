<template>
  <div class="vue-chart-pie-container">
    <div class="legend">
      <div
        v-for="(key, index) in Object.keys(localStatuses).sort()"
        :key="index"
        :ref="localStatuses[key].type"
        class="legend-item"
        @mouseover="legendOver(key)"
        @mouseout="legendOut(key)"
      >
        <div :class="`mark fas fa-square icon ${localStatuses[key].class}`" />
        {{ localStatuses[key].text }}
      </div>
    </div>
    <svg :viewBox="view" class="vue-chart-pie">
      <circle
        v-if="pathes.length === 1"
        :r="radius"
        :cx="viewBox.width /this.centerX"
        :cy="viewBox.height / this.centerY"
        fill="none"
        :ref="pathes[0].key"
        :stroke="pathes[0].state.color"
        @mouseover="pathIn(pathes[0])"
        @mouseout="pathOut(pathes[0])"
      ></circle>
      <path
        v-else
        v-for="(path, index) in pathes"
        :d="path.d"
        fill="none"
        :stroke="path.state.color"
        :ref="path.key"
        :key="index"
        @mouseover="pathIn(path)"
        @mouseout="pathOut(path)"
      ></path>
      <text
        :x="viewBox.width /this.centerX"
        :y="viewBox.height / this.centerY"
        dy=".3em"
        style="text-anchor: middle"
      >
        {{ text }}
      </text>
    </svg>
  </div>
</template>

<script>
export default {
  props: {
    values: Array,
    statuses: Object,
  },
  data() {
    return {
      viewBox: {
        x: 0,
        y: 0,
        width: 180,
        height: 180,
      },
      text: '',
      strokeWidth: 25,
      strokeWidthSelected: 35,
      centerX: 2,
      centerY: 1.5
    }
  },
  computed: {
    localStatuses() {
      return this.statuses ? this.statuses : {}
    },
    pathes() {
      let angle = 0
      let centerX = this.viewBox.width /this.centerX
      let centerY = this.viewBox.height / this.centerY
        return this.values.map((value) => {
        let largeArcFlag = value.percent * 360 <= 180 ? '0' : '1'
        let start = this.polarToCartesian(centerX, centerY, this.radius, angle)
        angle += value.percent * 360
        let end = this.polarToCartesian(centerX, centerY, this.radius, angle)
        return {
          d: `M ${start.x} ${start.y} A ${this.radius} ${this.radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
          key: value.key,
          state: value.state,
          value: value.value,
          percent: value.percent,
        }
      })
    },
    view() {
      return `${this.viewBox.x} ${this.viewBox.y} ${this.viewBox.width} ${this.viewBox.height}`
    },
    radius() {
      return (
        Math.min(this.viewBox.width, this.viewBox.height) / 2 -
        this.strokeWidthSelected
      )
    },
  },
  methods: {
    polarToCartesian(centerX, centerY, radius, angleInDegrees) {
      var angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0

      return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
      }
    },
    legendOver(key) {
      if (this.pathes.length === 1) {
        if (this.pathes[0].key.toString() === key) {
          this.text = `${this.pathes[0].value} (${
            Math.round(this.pathes[0].percent * 100 * 100) / 100
          }%)`
          this.$refs[key].style.strokeWidth = this.strokeWidthSelected
        }
      } else {
        this.pathes.forEach((path) => {
          if (path.key.toString() === key) {
            this.text = `${path.value} (${
              Math.round(path.percent * 100 * 100) / 100
            }%)`
            this.$refs[key][0].style.strokeWidth = this.strokeWidthSelected
          }
        })
      }
    },
    legendOut(key) {
      if (this.pathes.length === 1) {
        if (this.pathes[0].key.toString() === key) {
          this.$refs[key].style.strokeWidth = ''
        }
      } else {
        this.pathes.forEach((path) => {
          if (path.key.toString() === key) {
            this.$refs[key][0].style.strokeWidth = ''
          }
        })
      }

      this.text = ''
    },
    pathOut(path) {
      let node = this.$refs[path.key][0]
      if (!node) {
        node = this.$refs[path.key]
      }
      if (node.nodeName === 'path' || node.nodeName === 'circle') {
        this.text = ''
        node.style.strokeWidth = ''
      }
      this.$refs[path.state.type][0].style.fontWeight = ''
    },
    pathIn(path) {
      this.text = `${path.value} (${
        Math.round(path.percent * 100 * 100) / 100
      }%)`
      let node = this.$refs[path.key][0]
      if (node) {
        node.style.strokeWidth = this.strokeWidthSelected
      }
      this.$refs[path.state.type][0].style.fontWeight = 'bold'
    },
  },
}
</script>

<style>
.vue-chart-pie-container {
  position: relative;
  display: flex;
  flex: 1;
  overflow: hidden;
}

.vue-chart-pie-container .legend {
  padding: 3px;
  position: absolute;
  left: 0;
  top: 0;
  cursor: default;
}

.vue-chart-pie-container .legend .legend-item {
  display: flex;
  align-items: center;
  padding: 2px;
}

.vue-chart-pie-container .legend .mark {
  margin: 0 6px 0 0;
}

.vue-chart-pie-container .legend .legend-item:hover {
  font-weight: bold;
}

.vue-chart-pie {
  flex: 1;
}

.vue-chart-pie path,
.vue-chart-pie circle {
  stroke-width: 25;
  transition: stroke-width 0.3s ease-in-out;
}

.vue-chart-pie path:hover,
.vue-chart-pie circle:hover {
  stroke-width: 30;
}
</style>
