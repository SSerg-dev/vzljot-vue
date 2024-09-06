<template>
  <div class="table-grid" style="grid-template-columns: repeat(3, max-content)">
    <header class="header">
      <input type="checkbox" @change="handleAllPoints($event)" />
    </header>
    <header class="header"></header>
    <header class="header">Наименование</header>
    <div v-for="(r, i) in allPointLists" :key="i" class="table-row">
      <span class="cell">
        <check-box
          type="checkbox"
          v-model="r.checked"
          :disabled="false"
          @click="handleCheckBox(i)"
        >
        </check-box>
      </span>

      <span class="cell icon">
        <div
          :class="`${getImage(r)} ${
            r.hasOwnProperty('state')
              ? $store.state.env.statuses[r.state].class
              : ''
          } table-icon`"
        />
      </span>
      <span class="cell">{{ `${r.name}` }}</span>
    </div>
  </div>
</template>

<script>
import { getImage } from '@/plugins/api.js'
import User from '@/classes/user'
import { sortByName } from '@/utils/common.functions.js'
import CheckBox from '@/components/Inputs/CheckBox.vue'

export default {
  components: {
    CheckBox
  },
  props: {},
  data() {
    return {
      allPointListsData: null,
      value: new User(),
      maps: {},
      pointPageInfo: JSON.parse(JSON.stringify(this.$store.getters.pageInfo)),
      wait: false,
      infoPointListIds: [],
    }
  },
  computed: {
    allPointLists: {
      get() {
        return this.allPointListsData
      },
      async set(url) {
        try {
          let response = await this.$http.get(url)
          response.data = response.data.filter((item) => item && item !== null)

          if (response.data) {
            let updatedArray = Array.from(
              new Set([
                ...response.data.map((obj) => ({ ...obj, checked: false })),
              ])
              // eslint-disable-next-line no-unused-vars
            ).map(({ hasArchives = [], ...rest }) => rest)

            this.allPointListsData = updatedArray.sort(sortByName)
          }
          this.infoPointListIds =
            this.$store.getters.getCard.viewData.infoMeasureSchemeListIds

          const updatedPointListsData = this.allPointListsData.map(
            (pointList) => {
              return {
                ...pointList,
                checked: this.infoPointListIds.includes(pointList.id),
              }
            }
          )
          this.allPointListsData = updatedPointListsData
        } catch (err) {
          console.error('Error:', err)
        }
      },
    },
  },
  created() {},
  async mounted() {
    const url = 'pointList/pointLists'
    this.allPointLists = url

    this.$emit('mounted')
  },

  methods: {
    getCard() {
      return this.$store.getters.getCard
    },
    handleCheckBox(index) {
      let changedPoints = this.allPointLists.map(({ id, checked }) => ({
        id,
        checked,
      }))
      changedPoints[index].checked = !changedPoints[index].checked

      changedPoints = changedPoints
        .filter((point) => point.checked)
        .map((point) => point.id)

      this.$emit('points-updated', changedPoints)
    },
    changeChecked(changedPoints, hasChecked) {
      const updatedPoints = changedPoints.map((point) => ({
        ...point,
        checked: hasChecked,
      }))
      return updatedPoints
    },
    handleAllPoints(event) {
      let changedPoints = this.allPointLists.map(({ id }) => ({
        id,
        checked: event.target.checked,
      }))

      this.allPointListsData = this.changeChecked(
        this.allPointLists,
        event.target.checked
      )
      const pointIds = event.target.checked
        ? changedPoints.map((point) => point.id) 
        : []

      this.$emit('points-updated', pointIds)
    },

    getImage(item) {
      return getImage.call(this, item)
    },
  }, // end methods
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.button {
  width: min-content;
}
</style>
