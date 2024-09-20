<template>
  <div class="table-grid" style="grid-template-columns: repeat(3, max-content)">
    <header class="header">
      <input type="checkbox" @change="handleAllEquips($event)" />
    </header>
    <header class="header"></header>
    <header class="header">Наименование</header>
    <div v-for="(r, i) in allEquipLists" :key="i" class="table-row">
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
    CheckBox,
  },
  props: {},
  data() {
    return {
      allEquipListsData: null,
      value: new User(),
      maps: {},
      equipPageInfo: JSON.parse(JSON.stringify(this.$store.getters.pageInfo)),
      wait: false,
      infoEquipListIds: [],
    }
  },
  computed: {
    allEquipLists: {
      get() {
        return this.allEquipListsData
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
            ).map(({ equipTypes = [], ...rest }) => rest)

            this.allEquipListsData = updatedArray.sort(sortByName)
          }
          this.infoEquipListIds =
            this.$store.getters.getCard.viewData.infoEquipListIds

          const updatedEquipListsData = this.allEquipListsData.map(
            (equipList) => {
              return {
                ...equipList,
                checked: this.infoEquipListIds.includes(equipList.id),
              }
            }
          )
          this.allEquipListsData = updatedEquipListsData
        } catch (err) {
          console.error('Error:', err)
        }
      },
    },
  },
  created() {},
  async mounted() {
    const url = 'user/equipLists'
    this.allEquipLists = url

    this.$emit('mounted')
  },

  methods: {
    getCard() {
      return this.$store.getters.getCard
    },
    handleCheckBox(index) {
      let changedEquips = this.allEquipLists.map(({ id, checked }) => ({
        id,
        checked,
      }))
      changedEquips[index].checked = !changedEquips[index].checked

      changedEquips = changedEquips
        .filter((equip) => equip.checked)
        .map((equip) => equip.id)

      this.$emit('equips-updated', changedEquips)
    },
    changeChecked(changedEquips, hasChecked) {
      const updatedEquips = changedEquips.map((equip) => ({
        ...equip,
        checked: hasChecked,
      }))
      return updatedEquips
    },
    handleAllEquips(event) {
      let changedEquips = this.allEquipLists.map(({ id }) => ({
        id,
        checked: event.target.checked,
      }))

      this.allEquipListsData = this.changeChecked(
        this.allEquipLists,
        event.target.checked
      )
      const equipIds = event.target.checked
        ? changedEquips.map((equip) => equip.id)
        : []

      this.$emit('equips-updated', equipIds)
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
