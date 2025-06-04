<template>
  <div class="component-detail">
    <tool-bar :exportTypes="['jpeg', 'png', 'svg']" @export="exportData">
      <label
        >с:
        <date-picker v-model="filter.periodStart" :format="dateFormat" style="width: 150px" @update:modelValue="debounce()" />
      </label>
      <label
        >по:
        <date-picker v-model="filter.periodEnd" :format="dateFormat" style="width: 150px" @update:modelValue="debounce()" />
      </label>
      <label
        >Тип архива:
        <select v-model="filter.archiveType">
          <option v-for="(key, index) in Object.keys(archiveTypes)" :key="index" :value="key">{{ archiveTypes[key].text }}</option>
        </select>
      </label>
      <label
        >Группа:
        <select v-model="filter.group" @change="debounce()">
          <option v-for="item in groups" :key="item.value" :value="item.value">{{ item.text }}</option>
        </select>
      </label>
    </tool-bar>
    <!-- <div class="chart">
      <transition name="tip-fade">
        <div class="tip" v-show="tooltip.show" :style="[{ top: tooltip.top + 'px', left: tooltip.left + 'px' }, styleColors]">
          <div>Дата: {{ tooltip.date }}</div>
          <div>Значение: {{ tooltip.value }}</div>
        </div>
      </transition>
    </div> -->
    <chart-line ref="chart" v-bind="{ charts: charts }"></chart-line>
    <spinner :show="showLoader" :text="'Загрузка данных...'" />
  </div>
</template>

<script>
import debounce from '../../plugins/debounce.js'
import { getISODateTime } from '../../plugins/api.js'

import ChartLine from '../ChartLine.vue'
import ToolBar from '../ToolBar.vue'
import DatePicker from '../Inputs/DatePicker.vue'

let getDateTime = () => {
  return new Date(Date.now())
}

let dateTime = getDateTime()

export default {
  components: { ChartLine, ToolBar, DatePicker },
  props: {
    id: {
      type: Number,
      required: true
    }
  },
  data: function () {
    return {
      // padding: {
      //   top: 20,
      //   right: 20,
      //   bottom: 30,
      //   left: 0
      // },
      filter: {
        periodStart: new Date(dateTime.getFullYear(), dateTime.getMonth() - 1, dateTime.getDate()),
        periodEnd: new Date(dateTime.getFullYear(), dateTime.getMonth(), dateTime.getDate() + 1, 0, 0, -1),
        archiveType: this.$store.getters.reversedArchiveTypes.day,
        group: null
      },
      groups: [],
      dateFormat: 'DD.MM.YYYY',
      charts: {},
      // tooltip: {
      //   show: false,
      //   top: 0,
      //   left: 0,
      //   date: '',
      //   value: 0,
      //   timer: 0
      // },
      showLoader: false,
      pointName: null
    }
  },
  mounted() {
    this.$nextTick().then(() => this.get())
  },
  computed: {
    styleColors() {
      return this.$store.getters.styleColors
    },
    archiveTypes() {
      return this.$store.state.env.archiveTypes
    }
  },
  watch: {
    'filter.archiveType'() {
      this.dateFormat = this.archiveTypes[this.filter.archiveType].format
      this.debounce()
    }
  },
  methods: {
    // mouseover: function (event) {
    //   this.line.x = event.offsetX;
    //   this.line.visible = true;
    // },
    // mouseout: function (event) {
    //   if (event.relatedTarget && event.relatedTarget.nodeName !== 'circle') {
    //     this.line.visible = false;
    //   }

    //   if (event.currentTarget.nodeName === 'svg') {
    //     this.line.visible = false;
    //   }

    //   if (event.target.nodeName === 'circle') {
    //     clearTimeout(this.tooltip.timer);
    //     event.target.setAttribute("r", this.radius);
    //     this.tooltip.show = false;
    //   }
    // },
    // mousemove: function (event) {
    //   this.line.x = event.layerX - this.padding.left;
    //   let index = Math.round(this.line.x / this.tickLength);
    //   if (this.line.index !== index) {
    //     this.line.index = index;
    //   }
    // },
    debounce: debounce(function () {
      this.get()
    }, 1000),
    // getFormattedDate: function (value) {
    //   if (value === null || typeof value === 'undefined') {
    //     return value;
    //   }
    //   switch (this.archiveTypes[this.filter.archiveType].type) {
    //     case 'hour':
    //       return value.toLocaleString("ru", {
    //         day: '2-digit',
    //         month: '2-digit',
    //         year: 'numeric'
    //       }) + ' ' + value.getHours() + 'ч';
    //     case 'day':
    //       return value.toLocaleString("ru", {
    //         day: '2-digit',
    //         month: '2-digit',
    //         year: 'numeric'
    //       });
    //     case 'month':
    //       return value.toLocaleString("ru", {
    //         month: 'long',
    //         year: 'numeric'
    //       });
    //   }
    //   return value;
    // },
    // circleOver: function (x, y, event) {
    //   event.target.setAttribute("r", '5');

    //   if (y === null || typeof y === 'undefined') return;

    //   this.tooltip.date = this.getFormattedDate(x);
    //   this.tooltip.value = y.toFixed(3);

    //   var $this = this;

    //   this.tooltip.timer = setTimeout(function () {
    //     $this.tooltip.show = true;

    //     $this.$nextTick().then(function () {
    //       var tip = $this.$el.querySelector(".tip");
    //       var svg = $this.$el.querySelector("svg");

    //       $this.tooltip.left = (event.layerX + 20 + tip.clientWidth - svg.width.baseVal
    //           .value) > 0 ? event.layerX - 20 - tip.clientWidth : event.layerX +
    //         20;
    //       $this.tooltip.top = event.layerY - tip.clientHeight / 2 > 0 ? event.layerY -
    //         tip.clientHeight / 2 : 0;
    //     });
    //   }, 300);
    // },
    // circleOut: function (event) {
    //   clearTimeout(this.tooltip.timer);
    //   event.target.setAttribute("r", this.radius);
    //   this.tooltip.show = false;
    // },
    // getDateTick: function (value, i, arr) {
    //   var obj = {
    //     value: value
    //   };

    //   var year = arr[i].getFullYear();

    //   if (i - 1 >= 0) {
    //     if (year > arr[i - 1].getFullYear()) {
    //       obj.year = year;
    //     }
    //   } else {
    //     obj.year = year;
    //   }

    //   switch (this.archiveTypes[this.filter.archiveType].type) {
    //     case 'hour':
    //       obj.text = value.toLocaleString("ru", {
    //         day: 'numeric',
    //         month: '2-digit'
    //       }) + ' ' + value.getHours() + 'ч';
    //       break;
    //     case 'day':
    //       obj.text = value.toLocaleString("ru", {
    //         day: 'numeric',
    //         month: 'short'
    //       });
    //       break;
    //     case 'month':
    //       obj.text = value.toLocaleString("ru", {
    //         month: 'long'
    //       });
    //       break;
    //   }

    //   return obj;
    // },
    async get() {
      this.showLoader = true

      try {
        const { data } = await this.$http.post('archive/charts', {
          id: this.id,
          archiveType: this.filter.archiveType,
          periodStart: getISODateTime(this.filter.periodStart),
          periodEnd: getISODateTime(this.filter.periodEnd),
          group: this.filter.group
        })

        this.charts = data.data.charts
        this.groups = data.data.groups

        if (data.data.group) {
          this.filter.group = data.data.group
        }

        this.pointName = data.data.pointName
      } catch (error) {
        if (error.response.status === 550) {
          this.$store.commit('notification', {
            title: 'Формирование графиков',
            type: 'error',
            text: error.response.data
          })

          this.groups = []
          this.charts = {}
        } else {
          this.$store.commit('error', error)
        }
      } finally {
        this.showLoader = false
      }
    },
    exportData(type) {
      let periodStart = this.filter.periodStart.toLocaleString()
      let periodEnd = this.filter.periodEnd.toLocaleString()
      switch (type) {
        case 'jpeg':
        case 'png':
        case 'svg':
          this.$refs.chart.export(type, `${this.pointName}, ${this.archiveTypes[this.filter.archiveType].text} архив (${periodStart} - ${periodEnd})`)
          break
        default:
          break
      }
    }
  }
}
</script>

<style>
.chart .tip {
  position: absolute;
  white-space: nowrap;
  z-index: 105;
  padding: 10px;
  font-weight: normal;
}

.tip-fade-enter-active {
  transition: opacity 0.5s;
}

.tip-fade-leave-active {
  transition: opacity 0.2s;
}

.tip-fade-enter,
.tip-fade-leave-to {
  opacity: 0;
}
</style>
