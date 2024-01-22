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
            :values="pointListsPieChart[index]"
            :statuses="statuses"
          ></pie-chart>

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

      pointListsPieChart: [],
      equipListsPieChart: [],
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
      this.pointLists = data.pointLists.map((point) => ({
        id: point.id,
        
        name: point.name,
        statistic: Object.keys(point.statistic).map((statKey) => ({
          key: statKey,
          value: point.statistic[statKey],
        })),
      }))
      console.log('this.pointLists:', this.pointLists)
      const statisticArray = this.pointLists.map((point) => point.statistic)
      console.log('statisticArray:', statisticArray)

      //const item = statisticArray

      // console.log('item:', item)
      /*
      const result = Object.keys(item).map((key) => {
        return {
          key: key.toString(),
          value: data.points[key],
          state: this.$store.state.env.statuses[key],
          percent: data.points[key] / this.pointsCount,
        } 
      })
      */
      /*
      this.pointListsPieChart = statisticArray.map((item) => 
        Object.keys(item).map((key) => ({
          key: key.toString(),
          value: data.points[key],
          state: this.$store.state.env.statuses[key],
          percent: data.points[key] / this.pointsCount,
        }))
      )
      */
      console.log('statisticArray:', statisticArray)   
      console.log('----------------------------------')
      console.log('data.points[key]:', data.points)
      
    //  console.log('data.points[key]:', data.points['0'])
    //  console.log('data.points[key]:', data.points['1'])
    //  console.log('data.points[key]:', data.points['2'])
    //  console.log('data.points[key]:', data.points['3'])
    //  console.log('data.points[key]:', data.points['4'])   

      let result
      /*
      statisticArray.forEach((item) => {
        // console.log('item:', item)
        result = Object.keys(item).map((key) => ({
          key: key.toString(),
          value: data.points[key] ?? 0,
          state: this.$store.state.env.statuses[key] ?? this.$store.state.env.statuses[0],
          percent: !isNaN(data.points[key] / this.pointsCount) ? data.points[key] / this.pointsCount : 0,
        }))
        // console.log('result:', result)
        this.pointListsPieChart.push(result)
      })
      */

      statisticArray.forEach((item) => {
        // console.log('item:', item)
        result = Object.keys(item).map((key) => ({
          key: key.toString(),
          value: data.points[key] ?? 0,
          state: this.$store.state.env.statuses[key] ?? this.$store.state.env.statuses[0],
          percent: !isNaN(data.points[key] / this.pointsCount) ? data.points[key] / this.pointsCount : 0,
        }))
        // console.log('result:', result)
        this.pointListsPieChart.push(result)
      })
      console.log('this.pointListsPieChart:', this.pointListsPieChart)

      // alert(`result: ${JSON.stringify(result)}`)
      // this.pointListsPieChart = result
      // --------------------------------

      this.equipLists = data.equipLists.map((equip) => ({
        id: equip.id,
        name: equip.name,
        statistic: Object.keys(equip.statistic).map((statKey) => ({
          key: statKey,
          value: equip.statistic[statKey],
        })),
      }))
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
