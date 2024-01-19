<template>
  <div class="info-wrapper not-selectable">
    <div class="container">
      <div>
        <card-item
          :title="'Точки учета: ' + pointsCount"
          class="container-item"
        >
          <pie-chart :values="points" :statuses="statuses"></pie-chart>
          <template #footer>
            <div class="footer" v-if="this.time" title="Время обновления">
              <span
                style="font-size: 22px; padding: 0 3px 0 0"
                class="fas fa-clock icon"
              />
              <span>{{ this.time ? this.time.toLocaleString() : '' }}</span>
            </div>
          </template>
        </card-item>
      </div>

      <div v-for="(point, index) in pointLists" :key="point.id">
        <card-item
          :title="index + 1 + '.' + 'Точки:' + point.name"
          v-if="pointLists.length > 0"
          class="container-item"
        >
          <pie-chart
            :values="pointListsPieChart"
            :statuses="statuses"
          ></pie-chart>
          <!-- $serg -->
          <ul>
            <li v-for="stat in point.statistic" :key="stat.key">
              {{ stat.key }}: {{ stat.value }}
            </li>
          </ul>

          <template #footer>
            <div class="footer" v-if="time" title="Update Time">
              <span
                style="font-size: 22px; padding: 0 3px 0 0"
                class="fas fa-clock icon"
              />
              <span>{{ time ? time.toLocaleString() : '' }}</span>
            </div>
          </template>
        </card-item>
      </div>

      <div>
        <card-item :title="'Приборы: ' + equipsCount" class="container-item">
          <pie-chart :values="equips" :statuses="statuses"></pie-chart>
          <template #footer>
            <div class="footer" v-if="this.time" title="Время обновления">
              <span
                style="font-size: 22px; padding: 0 3px 0 0"
                class="fas fa-clock icon"
              />
              <span>{{ this.time ? this.time.toLocaleString() : '' }}</span>
            </div>
          </template>
        </card-item>
      </div>

      <div v-for="(equip, index) in equipLists" :key="equip.id">
        <card-item
          :title="index + 1 + '.' + ' Приборы: ' + equip.name"
          v-if="equipLists.length > 0"
          class="container-item"
        >
          <pie-chart :values="equips" :statuses="statuses"></pie-chart>
          <!-- $serg -->
          <!-- <ul>
            <li v-for="stat in equip.statistic" :key="stat.key">
              {{ stat.key }}: {{ stat.value }}
            </li>
          </ul> -->
          <template #footer>
            <div class="footer" v-if="time" title="Update Time">
              <span
                style="font-size: 22px; padding: 0 3px 0 0"
                class="fas fa-clock icon"
              />
              <span>{{ time ? time.toLocaleString() : '' }}</span>
            </div>
          </template>
        </card-item>
      </div>
    </div>

    <!-- <div style="flex: 2"></div> -->
    <spinner :show="showLoader" />
  </div>
</template>

<script>
import CardItem from './CardItem.vue'
import PieChart from './PieChart.vue'

export default {
  components: { CardItem, PieChart },
  data() {
    return {
      points: [],
      equips: [],
      showLoader: false,
      pointsCount: 0,
      equipsCount: 0,
      time: null,

      pointLists: [],
      equipLists: [],
      pointListsNames: [],
      equipListsNames: [],

      pointListsPieChart: [],
      equipListsPieChart: [],

      pointItemPieChart: {
        key: '',
        value: 0,
        state: {},
        // state: {
        //   type: '',
        //   text: '',
        //   class: '',
        //   image: '',
        //   color: '',
        // },

        percent: 0,
      },
    }
  },

  created() {
    this.$emitter.on('si', this.onSi)
  },
  mounted() {
    this.get().catch((error) => {
      this.showLoader = false
      this.$store.commit('error', error)
    })
  },
  computed: {
    statuses() {
      return this.$store.state.env
        ? Object.assign(
            {},
            ...Object.keys(this.$store.state.env.statuses)
              .sort()
              .filter((r, index) => index > 0)
              .map((r) => {
                return { [r]: this.$store.state.env.statuses[r] }
              })
          )
        : {}
    },
  },
  methods: {
    async get() {
      this.showLoader = true
      let { data } = await this.$http.post('home/getStatistic')
      this.parseData(data)
      this.showLoader = false
    },
    onSi(message) {
      if (message && message.event === 'statistic') {
        this.parseData(message)
      }
    },
    parseData(data) {
      this.pointsCount = Object.keys(data.points).reduce(
        (sum, current) => sum + data.points[current],
        0
      )
      this.points = Object.keys(data.points).map((key) => {
        return {
          key: key.toString(),
          value: data.points[key],
          state: this.$store.state.env.statuses[key],
          percent: data.points[key] / this.pointsCount,
        }
      })

      // alert(`data.points: ${JSON.stringify(this.pointsCount)}`)
      // alert(`this.$store.state.env.statuses: ${JSON.stringify(this.$store.state.env.statuses)}`)
      // alert(`data.points: ${JSON.stringify(data.points)}`)
      // alert(`this.points: ${JSON.stringify(this.points)}`)

      this.equipsCount = Object.keys(data.equips).reduce(
        (sum, current) => sum + data.equips[current],
        0
      )
      this.equips = Object.keys(data.equips).map((key) => {
        return {
          key: key.toString(),
          value: data.equips[key],
          state: this.$store.state.env.statuses[key],
          percent: data.equips[key] / this.equipsCount,
        }
      })
      // --------------------------------
      // get names
      /*
      this.pointListsNames = data.pointLists.map((point) => ({
        id: point.id,
        name: point.name,
      }))
      */
      // get raw data
      this.pointLists = data.pointLists.map((point) => ({
        id: point.id,
        name: point.name,
        statistic: Object.keys(point.statistic).map((statKey) => ({
          key: statKey,
          value: point.statistic[statKey],
        })),
      }))
      // select data for PieChart
      /*
      this.pointLists.forEach((point) => {
        point.statistic.forEach((stat) => {
          this.pointListsPieChart.push({
            [stat.key]: stat.value,
          })
        })
      })
      */

      /*
      this.pointListsPieChart = this.pointLists.map((point, index) => {
        return {
          index: index,
          // key: point.statistic[0]?.key,
          // value: point.statistic[0].value,
          // state: this.$store.state.env.statuses[point],
          // state: this.$store.state.env.statuses[point?.statistic[3]?.key],
          percent: data.pointLists[0]
        }
      })
      */
      /*
      this.pointListsPieChart = Object.keys(data.pointLists).map((key) => {
        return {
          key: key.toString(),
        }
      })
      */

      for (let i = 0; i < this.pointLists.length; i++) {
        pointItemPieChart.key
        pointItemPieChart.value
        pointItemPieChart.state
        pointItemPieChart.percent
        
        // this.pointListsPieChart.push(pointItemPieChart)
      }

      alert(`data.pointLists: ${JSON.stringify(this.pointLists)}`)
      // alert(`this.pointLists: ${JSON.stringify(this.pointLists)}`)
      // alert(
      //   `this.pointListsPieChart: ${JSON.stringify(this.pointListsPieChart)}`
      // )
      // --------------------------------
      /*
      const arrayPieChart = [
        {
          key: '0',
          value: 8926,
          state: {
            type: 'ok',
            text: 'Работает нормально',
            class: 'color-ok',
            image: 'status-ok',
            color: 'limegreen',
          },
          percent: 0.9968729059638151,
        },
        {
          key: '1',
          value: 9,
          state: {
            type: 'noControl',
            text: 'Контроль архивов отключен',
            class: 'color-nocontrol',
            image: 'status-nocontrol',
            color: 'dimgrey',
          },
          percent: 0.0010051373687737324,
        },
        {
          key: '2',
          value: 6,
          state: {
            type: 'noData',
            text: 'Нет архива',
            class: 'color-nodata',
            image: 'status-nodata',
            color: 'blueviolet',
          },
          percent: 0.0006700915791824883,
        },
        {
          key: '4',
          value: 1,
          state: {
            type: 'warning',
            text: 'Нештатная ситуация',
            class: 'color-warning',
            image: 'status-warning',
            color: 'orange',
          },
          percent: 0.00011168192986374804,
        },
        {
          key: '8',
          value: 12,
          state: {
            type: 'error',
            text: 'Критическая ошибка',
            class: 'color-error',
            image: 'status-error',
            color: 'orangered',
          },
          percent: 0.0013401831583649765,
        },
      ]

      for (let i = 0; i < arrayPieChart.length; i++) {
        this.pointListsPieChart.push(arrayPieChart[i])
      }
      */
      this.pointListsPieChart = this.points
      // --------------------------------

      // get names
      /*
      this.equipListsNames = data.equipLists.map((point) => ({
        id: point.id,
        name: point.name,
      }))
      */

      this.equipLists = data.equipLists.map((equip) => ({
        id: equip.id,
        name: equip.name,
        statistic: Object.keys(equip.statistic).map((statKey) => ({
          key: statKey,
          value: equip.statistic[statKey],
        })),
      }))
      // alert(`equipLists: ${JSON.stringify(this.equipLists)}`)

      this.time = new Date()
    },
  },
}
</script>

<style>
* {
  box-sizing: border-box;
}
.info-wrapper {
  display: flex;
  /* flex: 1; */
  /* overflow: hidden; */
}
.info-wrapper .footer {
  display: flex;
  align-items: center;
  padding: 3px;
  white-space: nowrap;
}
.container {
  display: flex;
  justify-content: center;
  flex-direction: row;
  flex-wrap: wrap;
}
.container .container-item {
  height: 420px;
  width: 284px;
}
</style>
