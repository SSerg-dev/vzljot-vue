<template>
  <div class="wrapper">
    <div class="search-wrapper">
      <div class="search-prefix fas fa-search"></div>
      <div class="search-container">
        <input
          ref="searchInput"
          class="search-input"
          type="text"
          placeholder="Поиск"
          @input="onInput($event.target.value)"
          autofocus
        />
        <transition>
          <div
            class="fas fa-times icon"
            v-show="showClearButton"
            @click="clear"
          />
        </transition>
      </div>
    </div>
    <div
      ref="table"
      class="table-grid"
      :style="{
        'grid-template-columns': `repeat(${columns.length + 2}, max-content)`,
      }"
      @click="onClick"
    >
      <header class="header">
        <input
          v-if="!singleMode"
          type="checkbox"
          v-model="all"
          @change="changeAll()"
          :disabled="busy"
        />
      </header>
      <header class="header" />
      <header class="header" v-for="(r, index) in columns" :key="'h' + index">
        {{ r.text }}
      </header>

      <div
        v-for="(r, i) in localItems"
        :key="i"
        class="table-row"
        @click="handleSelection(r)" 
      >
        <span class="cell check">
          <input
            v-if="singleMode"
            type="radio"
            :value="r[idColumn]"
            v-model="selectedItemId"
          />
          <input v-else type="checkbox" v-model="r.checked" />
        </span>
        <span class="cell icon">
          <span
            :class="`${getImage(r)} ${
              r.hasOwnProperty('state')
                ? $store.state.env.statuses[r.state].class
                : ''
            } table-icon`"
          />
        </span>
        <span class="cell" v-for="(column, index) in columns" :key="'c' + index"
          >{{ r[column.prop] }}
        </span>
      </div>
    </div>
    <spinner :show="busy" :text="'Загрузка...'" />
    <pager-component :buttons-count="3" v-bind="pageInfo" @go="onChangePage" />
  </div>
</template>

<script>
import debounce from '../plugins/debounce.js'

import ListComponent from './ListComponent.vue'
import PagerComponent from './PagerComponent.vue'

export default {
  props: {
    data: Object,
    url: String,
    loader: {
      type: Function,
      default: null,
    },
    singleMode: Boolean,
    idColumn: {
      type: String,
      default: 'id',
    },
    searchColumn: {
      type: String,
      default: 'text',
    },
    columns: {
      type: Array,
      default: () => {
        return [
          {
            prop: 'text',
            text: 'Наименование',
          },
        ]
      },
    },
  },
  extends: ListComponent,
  components: {
    PagerComponent,
  },
  data() {
    return {
      busy: false,
      selectedItemId: null,
    }
  },
  mounted() {
    this.load()
  },
  computed: {
    filteredItems() {
      let rows = this.dataItems
        .slice(0)
        .sort((a, b) =>
          this.$store.state.collator.compare(
            a[this.searchColumn].toLowerCase(),
            b[this.searchColumn].toLowerCase()
          )
        )

      if (this.filter.name) {
        rows = rows.filter(
          (r) =>
            r[this.searchColumn]
              .toLowerCase()
              .indexOf(this.filter.name.toLowerCase()) >= 0
        )
      }

      return rows
    },
    showClearButton() {
      return this.filter.name
    },
  },
  methods: {
    handleSelection(r) {
      if (this.singleMode) {
        this.selectedItemId = r[this.idColumn]
      } else {
        r.checked = !r.checked
      }
      this.handleChange()
    },
    onInput: debounce(function (value) {
      this.filter.name = value
    }, 500),
    clear() {
      this.filter = this.emptyFilter()
      this.$refs.searchInput.value = ''
    },
    emptyFilter() {
      return {
        name: null,
      }
    },
    onChangePage(page, size) {
      this.pageInfo.Size = size
      this.pageInfo.Page = page

      this.$refs.table.scrollTop = 0
    },
    onClick(e) {
      let target = e.target
      if (
        typeof target === 'object' &&
        target !== null &&
        Object.keys(target).length === 0
      ) {
        return
      }
      if (target.nodeName != 'INPUT') {
        if (target.nodeName != 'HEADER') {
          let classList = [...target.classList]

          if (classList.includes('table-icon')) {
            target = target.parentNode
            classList = [...target.classList]
          }

          while (!classList.includes('check')) {
            target = target.previousElementSibling
            classList = [...target.classList]
          }

          if (target) {
            const count = e.currentTarget.querySelectorAll('.header').length
            const items = e.currentTarget.querySelectorAll('.cell')
            for (let i = 0; i < items.length; i++) {
              if (items[i] === target) {
                if (this.singleMode) {
                  this.selectedItemId =
                    this.localItems[i / count][this.idColumn]
                } else {
                  this.localItems[i / count].checked =
                    !this.localItems[i / count].checked
                }
                this.handleChange()
                break
              }
            }
          }
        }
      }
    },
    changeAll() {
      this.dataItems.forEach((r) => (r.checked = this.all))
      this.handleChange()
    },
    handleChange() {
      this.$emit(
        'selectionChanged',
        this.singleMode
          ? this.dataItems.filter(
              (r) => r[this.idColumn] === this.selectedItemId
            )
          : this.dataItems.filter((r) => r.checked)
      )
      const emittedValue = this.singleMode
        ? this.dataItems.filter((r) => r[this.idColumn] === this.selectedItemId)
        : this.dataItems.filter((r) => r.checked)

      if (
        this.$store.state.equip.systemNodeType === 'systemNode' &&
        Array.isArray(emittedValue) &&
        emittedValue.length > 0
      ) {
        this.$store.state.equip.serverSystemNodesSelected = emittedValue.map(
          (r) => {
            return {
              id: r.id,
              name: r.name,
            }
          }
        )
      }
    },
    async load() {
      try {
        this.busy = true
        let data = null
        if (this.loader) {
          data = await this.loader()
        } else {
          let res = await this.$http.post(this.url, this.data)
          data = res.data
        }

        this.dataItems = data.map((item) =>
          item.hasOwnProperty('checked')
            ? item
            : Object.assign(item, { checked: false })
        )
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.busy = false
      }
    },
  },
}
</script>

<style scoped>
.cell,
.cell.icon,
.cell.icon .table-icon {
  cursor: pointer;
}

.wrapper {
  display: grid;
  min-height: 370px;
  max-height: 370px;
  min-width: 600px;
  position: relative;
  grid-template-rows: min-content 1fr min-content;
  row-gap: 3px;
}

.search-wrapper {
  display: grid;
  grid-template-columns: min-content 1fr;
  gap: 4px;
  padding: 4px 5px;
  position: relative;
  border-radius: 4px;
  color: #666;
  background-color: #ecf0f6;
}

.search-prefix {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
  font-size: 21px;
  color: lightslategrey;
}

.search-container {
  display: grid;
  grid-template-columns: 1fr min-content;
  gap: 4px;
  background-color: #fff;
  border-radius: 4px;
  color: inherit;
}

.search-input {
  flex: 1;
  border: 1px transparent solid;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
  padding: 3px;
}

.search-wrapper .fa-times {
  display: grid;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.3s;
  font-size: large;
  padding: 0 4px;
}

.search-wrapper .fa-times:hover {
  transform: rotate(90deg);
}

.search-input:focus {
  border: 1px transparent solid;
  background-color: #fff;
  outline: 0;
  box-shadow: none;
}

.search-input::placeholder {
  color: #ccc;
  opacity: 1;
}
</style>
