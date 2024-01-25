<template>
  <div class="info-wrapper not-selectable">
    <div v-if="isVisible" class="container">
      <div>
        <card-item
          :title="'Точки учета: ' + pointsCount"
          :class="[
            { 'container-item-small': isCardSelected },
            { 'container-item-large': !isCardSelected },
          ]"
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
          :title="
            index + 1 + '.' + 'Точки ' + point.name + ': ' + point.count + 'шт.'
          "
          v-if="isCardSelected"
          class="container-item-small"
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
        <card-item
          :title="'Приборы: ' + equipsCount"
          :class="[
            { 'container-item-small': isCardSelected },
            { 'container-item-large': !isCardSelected },
          ]"
        >
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
          :title="
            index +
            1 +
            '.' +
            ' Приборы ' +
            equip.name +
            ': ' +
            equip.count +
            'шт.'
          "
          v-if="isCardSelected"
          class="container-item-small"
        >
          <pie-chart
            :values="equipListsPieChart[index]"
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
    </div>

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

      isCardSelected: false,
      isVisible: false,

      timeout: null,
      delay: 500
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
    
    const options = {
      isCardSelected: true,
    }
    this.$store.commit('setCard', options)
    this.isCardSelected = this.getCard.isCardSelected

    if (!this.isVisible) {
      this.timeout = setTimeout(() => {
        this.isVisible = true
      }, this.delay)
    }
  },
  
  beforeUnmount() {
    clearTimeout(this.timeout)
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
    styleColors() {
      return this.$store.getters.styleColors
    },
    getCard() {
      return this.$store.getters.getCard
    },
  },
  watch: {
    getCard(newVal) {
      if (newVal.isCardChanged) {
        this.get().catch((error) => {
          this.$store.commit('error', error)
        })

        const options = {
          isCardChanged: false,
        }
        this.$store.commit('setCard', options)
      }
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

      try {
        this.pointLists = data.pointLists.map((point) => ({
          id: point.id,
          name: point.name,
          count: point.count,
          statistic: Object.keys(point.statistic).map((statKey) => ({
            key: statKey,
            value: point.statistic[statKey],
          })),
        }))

        const statisticPointArray = this.pointLists.map(
          (point) => point.statistic
        )
        this.pointListsPieChart = statisticPointArray.map((item) =>
          Object.keys(item).map((key, index) => ({
            key: key.toString(),
            value: data.points[key] ?? 0,
            state:
              this.$store.state.env.statuses[key] ??
              this.$store.state.env.statuses[0],
            percent: this.calcPercent(item, index),
          }))
        )

        this.equipLists = data.equipLists.map((equip) => ({
          id: equip.id,
          name: equip.name,
          count: equip.count,
          statistic: Object.keys(equip.statistic).map((statKey) => ({
            key: statKey,
            value: equip.statistic[statKey],
          })),
        }))

        const statisticEquipArray = this.equipLists.map(
          (equip) => equip.statistic
        )
        this.equipListsPieChart = statisticEquipArray.map((item) =>
          Object.keys(item).map((key, index) => ({
            key: key.toString(),
            value: data.equips[key] ?? 0,
            state:
              this.$store.state.env.statuses[key] ??
              this.$store.state.env.statuses[0],
            percent: this.calcPercent(item, index),
          }))
        )
      } catch {
        console.error(err)
      }

      this.time = new Date()
    },

    calcPercent: function (item, index) {
      let result

      if (item.length === 1) {
        result = 1
      } else if (item.length > 1) {
        const sum = item.reduce((acc, current) => acc + current.value, 0)
        result = +item[index].value / +sum
      }
      return result
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
.container .container-item-small {
  height: 420px;
  width: 284px;
}
.container .container-item-large {
  height: 90vh;
  width: 25vw;
}
</style>
