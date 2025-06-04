<template>
  <div class="info-wrapper not-selectable">
    <div class="container" :key="keyRender">
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

      <div v-for="(point, index) in pointListsView" :key="point.id">
        <card-item
          :title="index + 1 + '.' + 'Точки ' + point.name + ': ' + point.count"
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

      <div v-for="(equip, index) in equipListsView" :key="equip.id">
        <card-item
          :title="
            index + 1 + '.' + 'Приборы ' + equip.name + ': ' + equip.count
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
import { sortByName } from '@/utils/common.functions.js'

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

      pointListsView: [],
      equipListsView: [],

      pointListsPieChart: [],
      equipListsPieChart: [],

      isCardSelected: false,
      isInfoChanged: false,

      isVisible: false,
      keyRender: 0,
      timeout: null,
      delay: 0,

      certificates: null,
      viewData: {},
      loading: false,

      isSelectData: false,

      infoPointListIds: [],
      infoEquipListIds: [],

      statisticData: {},
    }
  },

  created() {
    this.$emitter.on('si', this.onSi)

    this.$emitter.on('info:open', (options) => {
      if (options.isInfoChanged) {
        this.selectData()
      }
    })
  },
  async mounted() {
    this.selectData()
    this.setup()
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
    pointLists(newVal) {
      if (newVal.length >= 1) {
        this.isCardSelected = true
        this.keyRender = newVal.length
      }
      if (newVal.length === 0 && this.equipLists.length === 0) {
        this.isCardSelected = false
      }
    },

    equipLists(newVal) {
      if (newVal.length >= 1) {
        this.isCardSelected = true
        this.keyRender = newVal.length
      }
      if (newVal.length === 0 && this.pointLists.length === 0) {
        this.isCardSelected = false
      }
    },
  },

  methods: {
    setup() {
      const options = {
        isCardSelected: false,
        isInfoChanged: false,
      }
      this.$store.commit('setCard', options)
      this.isCardSelected = this.getCard.isCardSelected
      this.isInfoChanged = this.getCard.isInfoChanged

      if (!this.isVisible) {
        this.timeout = setTimeout(() => {
          this.isVisible = true
        }, this.delay)
      }
    },

    async getIds() {
      this.viewData.infoMeasureSchemeListIds =
        this.statisticData.pointLists.map((item) => item.id)

      this.viewData.infoEquipListIds = this.statisticData.equipLists.map(
        (item) => item.id
      )

      const options = {
        viewData: this.viewData,
      }
      this.$store.commit('setCard', options)
    },

    async get() {
      this.showLoader = true
      let { data } = await this.$http.post('home/getStatistic')
      this.statisticData = data

      this.parseData(data)
      this.showLoader = false
    },

    async selectData() {
      await this.get().catch((error) => {
        this.showLoader = false
        this.$store.commit('error', error)
      })

      await this.getIds()

      this.updatePointLists()
      this.updateEquipLists()
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
        this.pointListsView = this.pointLists.reverse()

        this.pointListsPieChart = this.pointLists
          .map((point) => point.statistic)
          .map((item) =>
            Object.keys(item).map((_, index) => ({
              key: item[index].key,
              value: item[index].value,
              state: this.$store.state.env.statuses[item[index].key],
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
        this.equipListsView = this.equipLists.reverse()

        this.equipListsPieChart = this.equipLists
          .map((equip) => equip.statistic)
          .map((item) =>
            Object.keys(item).map((_, index) => ({
              key: item[index].key,
              value: item[index].value,
              state: this.$store.state.env.statuses[item[index].key],
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

    updatePointLists() {
      this.infoPointListIds = this.statisticData.pointLists.map(
        (item) => item.id
      )
      let updatedPointListsData = this.pointLists.map((pointList) => {
        return {
          ...pointList,
          checked: this.infoPointListIds.includes(pointList.id),
        }
      })
      this.pointLists = updatedPointListsData
        .filter((point) => this.infoPointListIds.includes(point.id))
        .sort(sortByName)
    },

    updateEquipLists() {
      this.infoEquipListIds = this.statisticData.equipLists.map(
        (item) => item.id
      )
      let updatedEquipListsData = this.equipLists.map((equipList) => {
        return {
          ...equipList,
          checked: this.infoEquipListIds.includes(equipList.id),
        }
      })
      this.equipLists = updatedEquipListsData
        .filter((equip) => this.infoEquipListIds.includes(equip.id))
        .sort(sortByName)
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
