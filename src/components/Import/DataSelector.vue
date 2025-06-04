<template>
  <div class="wrapper-data-selector-grid">
    <div class="data-selector-grid two">
      <label>Экземпляр сервера:</label>
      <select v-model="localSystemNode" @change="dataChange()" :class="{ 'validation-error': error.systemNode }" :title="error.systemNode">
        <option v-for="r in localSystemNodes" :key="r.id" :value="r.id">{{ r.name }}</option>
      </select>
    </div>
    <div class="table-grid" style="grid-template-columns: repeat(5, max-content)">
      <header class="header sticky-first" style="display: grid; gap: 6px; grid-template-columns: repeat(2, min-content)">
        <input type="checkbox" v-model="all" @change="checkAll" />
        Наименование
      </header>
      <header class="header">Часовой архив</header>
      <header class="header">Суточный архив</header>
      <header class="header">Месячный архив</header>
      <header class="header">Текущие данные</header>
      <div v-for="(r, index) in localItems" :key="index" class="table-row">
        <span :class="rowClass(r)" style="display: grid; gap: 6px; grid-template-columns: repeat(3, min-content)">
          <input type="checkbox" v-model="r.checked" :disabled="r.error" @change="check(r)" />
          <span :class="iconClass(r)" />
          <span :title="r.error">{{ r.name }}</span>
        </span>
        <span :class="cellClass(r)">{{ r.hasOwnProperty('archiveHour') && r.archiveHour !== null ? `${new Date(r.archiveHour).toLocaleDateString()}, ${new Date(r.archiveHour).getHours().toString().padStart(2, '0')}` : '' }}</span>
        <span :class="cellClass(r)">{{ r.hasOwnProperty('archiveDay') && r.archiveDay !== null ? new Date(r.archiveDay).toLocaleDateString() : '' }}</span>
        <span :class="cellClass(r)">{{ r.hasOwnProperty('archiveMonth') && r.archiveMonth !== null ? `${(new Date(r.archiveMonth).getMonth() + 1).toString().padStart(2, '0')}.${new Date(r.archiveMonth).getFullYear()}` : '' }}</span>
        <span :class="cellClass(r)">{{ r.hasOwnProperty('all_Currents') && r.all_Currents !== null ? new Date(r.all_Currents).toLocaleString() : '' }}</span>
      </div>
    </div>
    <pager-component :buttons-count="3" v-bind="pageInfo" @go="onChangePage" />
  </div>
</template>

<script>
import { matchType } from '../../plugins/api'

import ListComponent from '../ListComponent.vue'
import PagerComponent from '../PagerComponent.vue'

const sortByName = (a, b) => {
  if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
  if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
}

export default {
  components: {
    PagerComponent
  },
  extends: ListComponent,
  props: {
    guid: String,
    systemNode: Number,
    systemNodes: {
      type: Array,
      default: () => []
    }
  },
  data() {
    const itemTypes = matchType(this.$store.state.env.itemTypes)

    return {
      balanceGroups: this.items.filter(r => r.type === itemTypes['balanceGroup']).sort(sortByName),
      pointGroups: this.items.filter(r => r.type === itemTypes['pointGroup']).sort(sortByName),
      pointLists: this.items.filter(r => r.type === itemTypes['pointList']).sort(sortByName),
      points: this.items.filter(r => r.type === itemTypes['point']).sort(sortByName),
      equipLists: this.items.filter(r => r.type === itemTypes['equipList']).sort(sortByName),
      equips: this.items.filter(r => r.type === itemTypes['equip']).sort(sortByName),
      itemTypes,
      localSystemNode: this.systemNode,
      error: {
        systemNode: null
      }
    }
  },
  computed: {
    groupTypes() {
      return [this.itemTypes.balanceGroups, this.itemTypes.pointGroups, this.itemTypes.pointLists, this.itemTypes.points, this.itemTypes.equipLists, this.itemTypes.equips]
    },
    filteredItems() {
      return [].concat(
        [{ name: this.$store.state.env.itemTypes[this.itemTypes.balanceGroups].text, type: this.itemTypes.balanceGroups, checked: false }],
        this.balanceGroups,
        [{ name: this.$store.state.env.itemTypes[this.itemTypes.pointGroups].text, type: this.itemTypes.pointGroups, checked: false }],
        this.pointGroups,
        [{ name: this.$store.state.env.itemTypes[this.itemTypes.pointLists].text, type: this.itemTypes.pointLists, checked: false }],
        this.pointLists,
        [{ name: this.$store.state.env.itemTypes[this.itemTypes.points].text, type: this.itemTypes.points, checked: false }],
        this.points,
        [{ name: this.$store.state.env.itemTypes[this.itemTypes.equipLists].text, type: this.itemTypes.equipLists, checked: false }],
        this.equipLists,
        [{ name: this.$store.state.env.itemTypes[this.itemTypes.equips].text, type: this.itemTypes.equips, checked: false }],
        this.equips
      )
    },
    localSystemNodes() {
      return this.systemNodes.slice(0).sort(sortByName)
    }
  },
  methods: {
    onClick() {
      this.$refs.fileInput.click()
    },
    check(item) {
      if (this.groupTypes.includes(item.type)) {
        this[this.$store.state.env.itemTypes[item.type].type].filter(r => !r.error).forEach(r => (r.checked = item.checked))
      }

      this.dataChange()
    },
    checkAll() {
      this.localItems.filter(r => !r.error).forEach(r => (r.checked = this.all))

      this.dataChange()
    },
    isGroup(type) {
      return this.groupTypes.includes(type)
    },
    cellClass(r) {
      const styles = ['cell']

      if (this.groupTypes.includes(r.type)) {
        styles.push('group')
      }
      return styles
    },
    rowClass(r) {
      const arr = ['sticky-first'].concat(this.cellClass(r))

      if (r.error) {
        arr.push('warn-color')
      }

      return arr
    },
    iconClass(r) {
      const arr = this.getImage(r).split(' ')

      arr.push('table-icon')

      if (r.error) {
        arr.push('warn-color')
      }

      return arr
    },
    dataChange() {
      const arr = [].concat(this.balanceGroups, this.pointGroups, this.pointLists, this.points, this.equipLists, this.equips).filter(r => r.checked)
      this.$emit(
        'dataChange',
        arr.length
          ? {
              guid: this.guid,
              systemNode: this.localSystemNode,
              items: arr.map(r => ({ id: r.id, type: r.type }))
            }
          : null
      )
    },
    validate() {
      Object.keys(this.error).forEach(r => (this.error[r] = null))

      if (!Number.isInteger(this.localSystemNode)) {
        this.error.systemNode = 'Необходимо выбрать экзкмпляр сервера.'
      }

      return !Object.keys(this.error).some(r => this.error[r])
    }
  }
}
</script>

<style scoped>
.wrapper-data-selector-grid,
.data-selector-grid {
  display: grid;
  grid-gap: 5px 3px;
}

.wrapper-data-selector-grid {
  min-height: 370px;
  max-height: 370px;
  min-width: 600px;
  position: relative;
  grid-template-rows: min-content 1fr min-content;
}

.data-selector-grid.two {
  grid-template-columns: auto 1fr;
}

.data-selector-grid label {
  text-align: right;
}

.data-selector-grid select {
  width: fit-content;
}
</style>
