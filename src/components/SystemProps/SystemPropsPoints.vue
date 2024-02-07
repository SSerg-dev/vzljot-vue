<template>
  <div class="table-grid" style="grid-template-columns: repeat(3, max-content)">
    <header class="header"></header>
    <header class="header"></header>
    <header class="header">Наименование</header>
    <div v-for="(r, i) in allPointLists" :key="i" class="table-row">
      <span class="cell">
        <input
          type="checkbox"
          v-model="r.checked"
          :disabled="!value.limitPoints"
          @click="handleCheckBox(i)"
        />
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
      <span class="cell">{{ r.name }}</span>
    </div>
  </div>
</template>

<script>
import { getImage } from '@/plugins/api.js'
import User from '@/classes/user'
import { sortByName } from '@/plugins/utils/common.functions.js'

export default {
  components: {},
  data() {
    return {
      allPointListsData: null,
      value: new User(),
      maps: {},
      pointPageInfo: JSON.parse(JSON.stringify(this.$store.getters.pageInfo)),
      userId: 30 // 1037 // 1
    }
  },
  computed: {
    allPointLists: {
      get() {
        return this.allPointListsData
      },
      async set(url) {
        try {
          const response = await this.$http.get(url)
          if (this.localPoints && response.data) {
            const mergedArray = Array.from(
              new Set([
                ...this.localPoints,
                ...response.data.map((obj) => ({ ...obj, checked: false })),
              ])
              // eslint-disable-next-line no-unused-vars
            ).map(({ hasArchives, ...rest }) => rest)

            const idMap = new Map()
            const uniqueArray = mergedArray.reduce((result, obj) => {
              if (idMap.has(obj.id)) {
                idMap.get(obj.id).checked = true
              } else {
                idMap.set(obj.id, obj)
                result.push(obj)
              }
              return result
            }, [])
            this.allPointListsData = uniqueArray.sort(sortByName)
          }
        } catch (err) {
          console.error('Error:', err)
        }
      },
    },
    localPoints() {
      let rows = this.value.points
        .concat(
          this.value.pointGroups,
          this.value.pointLists,
          this.value.balanceGroups,
          this.value.nodes
        )
        .sort(sortByName)

      const firstIndex = (this.pointPageInfo.Page - 1) * this.pointPageInfo.Size
      const lastIndex =
        this.pointPageInfo.Page * this.pointPageInfo.Size > rows.length
          ? rows.length
          : this.pointPageInfo.Page * this.pointPageInfo.Size

      return rows.slice(firstIndex, lastIndex)
    },
  },
  created() {},
  mounted() {
    const userId = this.userId
    const url = 'pointList/pointLists'
    this.allPointLists = url

    this.$emit('mounted')
    this.edit(userId)
  },

  methods: {
    handleCheckBox(index) {
      !!this.allPointListsData[index].checked === true
        ? (this.allPointListsData[index].checked = 'true')
        : (this.allPointListsData[index].checked = 'false')
    },

    getImage(item) {
      return getImage.call(this, item)
    },

    async edit(id) {
      try {
        const {
          data: {
            data: { user, maps },
          },
        } = await this.$http.get('user/user', { params: { id } })

        if (user.equips) user.equips.forEach((r) => (r.checked = false))
        if (user.equipLists) user.equipLists.forEach((r) => (r.checked = false))
        if (user.reports) user.reports.forEach((r) => (r.checked = false))
        if (user.points) user.points.forEach((r) => (r.checked = false))
        if (user.pointGroups)
          user.pointGroups.forEach((r) => (r.checked = false))
        if (user.pointLists) user.pointLists.forEach((r) => (r.checked = false))
        if (user.nodes) user.nodes.forEach((r) => (r.checked = false))

        user.subscriptions.forEach((r) => (r.checked = false))
        this.subscriptions = user.subscriptions

        if (user.equipTypes) this.equipTypes = user.equipTypes
        if (user.groupsRights) this.groupsRights = user.groupsRights
        if (user.userRights) this.userRights = user.userRights

        this.value = new User(user)

        Object.values(maps).forEach((r) => r.connections.sort())
        this.maps = maps
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.loading = false
      }
    },
  },
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
