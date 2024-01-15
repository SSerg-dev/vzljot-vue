<template>
  <div class="info-wrapper not-selectable">
    <card-item :title="'Точки учета: ' + pointsCount">
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
    <card-item :title="'Приборы: ' + equipsCount">
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
    <!-- dev -->
    <!-- <card-item :title="'Point Lists: ' + pointLists.length">
      <ul>
        <li v-for="point in pointLists" :key="point.id">
          <strong>{{ point.name }}</strong>
          <ul>
            <li v-for="stat in point.statistic" :key="stat.key">
              {{ stat.key }}: {{ stat.value }}
            </li>
          </ul>
        </li>
      </ul>
    </card-item> -->
    <div v-for="point in pointLists" :key="point.id">
      <card-item :title="'Point List: ' + point.name">
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
    <!--         -->

    <card-item :title="'Equipment Lists: ' + equipLists.length">
      <ul>
        <li v-for="equip in equipLists" :key="equip.id">
          <strong>{{ equip.name }}</strong>
          <ul>
            <li v-for="stat in equip.statistic" :key="stat.key">
              {{ stat.key }}: {{ stat.value }}
            </li>
          </ul>
        </li>
      </ul>
    </card-item>

    <!-- end dev -->

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
      this.pointLists = data.pointLists.map((point) => ({
        id: point.id,
        name: point.name,
        statistic: Object.keys(point.statistic).map((statKey) => ({
          key: statKey,
          value: point.statistic[statKey],
        })),
      }))
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
.info-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.info-wrapper .footer {
  display: flex;
  align-items: center;
  padding: 3px;
  white-space: nowrap;
}
</style>
