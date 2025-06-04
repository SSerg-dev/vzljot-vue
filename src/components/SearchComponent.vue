<template>
  <div class="search-wrapper" v-on:mouseenter="mouseenter" v-on:mouseleave="mouseleave">
    <div class="search-prefix fas fa-search"></div>
    <div class="search-container">
      <input class="search-input" type="text" placeholder="Поиск" v-on:input="input" v-on:focus="focus" v-on:keyup.enter="pressedEnter" v-on:keyup.esc="hide" v-on:keyup.up="updown(-1)" v-on:keyup.down="updown(1)" v-model.trim="text" autofocus />
      <transition>
        <div class="search-spinner-container" v-show="loading">
          <div class="search-spinner"></div>
        </div>
      </transition>
      <transition>
        <div class="button-clear fas fa-times" v-show="showClear" @click="clear" />
      </transition>
      <div class="button-settings fas fa-cog" @click="openSettings" />
    </div>
    <transition>
      <div v-show="show" class="items" :style="{ right: variableWidth ? 'auto' : '0' }">
        <div class="search-count">
          Найдено объектов: {{ count }}
          <div class="button-close fas fa-times" @click="show = false" />
        </div>
        <div class="search-content" :style="{ height: contentHeight + 'px' }" v-on:scroll="handleScroll">
          <div v-for="(r, index) in sortedItems" :key="`${r.type}_${r.id}`" class="search-item" @click="changed(r)" :class="{ 'search-item-selected': r.selected }" :style="r.selected ? $store.getters.styleColors : null" :title="r.text">
            <span>{{ index + 1 }}.</span>
            <div v-show="$store.state.env.itemTypes[r.type].type === 'point'" :class="$store.state.env.statuses[r.state].image"></div>
            <div :class="`${getImage(r)} image ${$store.state.env.statuses[r.state].class}`"></div>
            <span>{{ r.text }}</span>
          </div>
        </div>
      </div>
    </transition>
    <transition>
      <div v-show="showSettings" class="search-settings">
        <div class="search-header-settings">
          Настройки поиска:
          <div class="button-close fas fa-times" v-on:click="showSettings = false" />
        </div>
        <div style="padding: 5px">
          <div class="row">
            <check-box v-model="caseSensitive">С учетом регистра</check-box>
          </div>
          <div class="row">
            <check-box v-model="wholeWord">Слово целиком</check-box>
          </div>
          <fieldset>
            <legend>Искать в объектах:</legend>
            <template v-if="localSettings && localSettings.length > 0">
              <div v-for="(item, index) in localSettings" class="row" :key="index">
                <check-box v-model="localSettings[index].value">{{ item.text }}</check-box>
              </div>
            </template>
          </fieldset>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import debounce from '../plugins/debounce.js'
import { getImage, matchType } from '../plugins/api.js'
import CheckBox from './Inputs/CheckBox.vue'

const getSearchSettings = (types, store) => {
  let itemTypes = matchType(store.state.env.itemTypes)

  return types.map(r => {
    return {
      type: itemTypes[r],
      text: store.state.env.itemTypes[itemTypes[r]].text,
      value: true
    }
  })
}

export default {
  components: {
    CheckBox
  },
  props: {
    value: String,
    url: String,
    variableWidth: {
      type: Boolean,
      default: false
    },
    settings: {
      type: Array,
      default: () => []
    },
    listLength: {
      type: Number,
      default: 8
    },
    pageSize: {
      type: Number,
      default: 20
    }
  },
  data() {
    return {
      text: this.value === undefined ? '' : this.value,
      showClear: this.value !== undefined ? true : false,
      items: [],
      show: false,
      count: 0,
      page: 1,
      selectedItem: null,
      loading: false,
      contentHeight: 0,
      showSettings: false,
      caseSensitive: false,
      wholeWord: false,
      localSettings: getSearchSettings(JSON.parse(JSON.stringify(this.settings)), this.$store),
      types: ['point', 'pointList', 'pointGroup', 'balanceGroup', 'address', 'node', 'systemNode', 'groupConnection', 'equip']
    }
  },
  watch: {
    text(value) {
      if (value !== '') {
        this.page = 1
        this.search(value)
      }
    },
    async items() {
      await this.$nextTick()
      this.fixHeight()
    },
    localSettings() {
      this.updateSettings()
    },
    caseSensitive() {
      this.updateSettings()
    },
    wholeWord() {
      this.updateSettings()
    },
    show(value) {
      if (value) {
        this.$nextTick().then(() => {
          this.fixHeight()
        })
      }
    }
  },
  computed: {
    sortedItems() {
      return this.items.slice(0).sort((a, b) => {
        if (a.text.toLowerCase() < b.text.toLowerCase()) return -1
        if (a.text.toLowerCase() > b.text.toLowerCase()) return 1
      })
    }
  },
  mounted() {
    document.addEventListener('click', this.click)
    this.$emitter.on('updateObject', this.update)
    this.$emitter.on('deleteObject', this.remove)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.click)
  },
  methods: {
    fixHeight() {
      let contentHeight = 0
      const items = this.$el.querySelectorAll('.search-item')

      for (var i = 0; i < (items.length > this.listLength ? this.listLength : items.length); i++) {
        contentHeight += items[i].offsetHeight
      }

      this.contentHeight = contentHeight
    },
    update(item) {
      if (Object.prototype.hasOwnProperty.call(item, 'text') && this.types.includes(this.$store.state.env.itemTypes[item.type].type)) {
        if (item.text.toLowerCase().indexOf(this.text) >= 0) {
          const items = this.items.filter(r => r.id === item.id && r.type === item.type)
          if (items.length > 0) {
            items.forEach(r => (r.text = item.text))
          } else {
            this.items.push(item)
          }
        } else {
          this.remove(item)
        }
      }
    },
    remove(item) {
      var index = -1
      for (var i = 0; i < this.items.length; i++) {
        if (this.items[i].id === item.id) {
          index = i
          break
        }
      }

      if (index >= 0) {
        this.items.splice(index, 1)
        this.count -= 1
      }
    },
    click(e) {
      if (this.show) {
        this.show = this.$el.contains(e.target)
      }

      if (this.showSettings) {
        if (e.target.classList) {
          if (!e.target.classList.contains('button-settings')) {
            this.showSettings = this.$el.getElementsByClassName('search-settings')[0].contains(e.target)
          }
        } else {
          this.showSettings = false
        }
      }
    },
    focus() {
      if (this.text !== '') {
        this.show = true
      }
    },
    hide() {
      this.show = false
    },
    input() {
      if (this.text === '') {
        this.items = []
        this.show = false
      }
      this.showClear = this.text !== ''
    },
    updateSettings: debounce(async function () {
      if (this.text !== '') {
        this.page = 1
        Object.assign(this, await this.load(this.text))
      }
    }, 500),
    search: debounce(async function (value) {
      this.showSettings = false

      Object.assign(this, await this.load(value))

      this.show = value !== ''
    }, 500),
    async load(value) {
      if (value !== '') {
        try {
          this.loading = true

          let model = {
            text: value,
            types: this.localSettings.filter(r => r.value === true).map(r => r.type),
            caseSensitive: this.caseSensitive,
            wholeWord: this.wholeWord,
            page: this.page,
            pageSize: this.pageSize
          }

          let {
            data: { count, items }
          } = await this.$http.get(this.url, {
            params: model
          })

          this.loading = false

          return { count, items }
        } catch (error) {
          console.log(error)
        }
      }

      return { count: 0, items: [] }
    },
    clear() {
      this.showClear = false
      this.text = ''
      this.items = []
      this.show = false
      this.$emit('cleared')
    },
    mouseenter() {
      this.$emit('mouseenter')
    },
    mouseleave() {
      this.$emit('mouseleave')
    },
    pressedEnter() {
      if (this.show && this.items.length > 0 && this.selectedItem) {
        this.changed(this.selectedItem)

        var inputs = this.$el.getElementsByClassName('search-input')
        for (var i = 0; i < inputs.length; i++) {
          inputs[i].blur()
        }
      }
    },
    changed: function (item) {
      this.select(item)
      this.show = false
      this.$emit('changed', item)
    },
    select: function (item) {
      if (this.selectedItem) {
        this.selectedItem.selected = false
      }

      this.selectedItem = item
      item.selected = true
    },
    scroll: function (node) {
      var viewPort = this.$el.querySelector('.search-content')
      var item = this.$el.querySelectorAll('.search-item')[this.items.indexOf(node)]

      let itemBottom = (this.items.indexOf(node) + 1) * item.offsetHeight
      if (itemBottom >= viewPort.offsetHeight) {
        viewPort.scrollTop = itemBottom - viewPort.offsetHeight
      }
    },
    handleScroll: debounce(async function () {
      var viewPort = this.$el.getElementsByClassName('search-content')[0]

      if (viewPort.scrollHeight - viewPort.scrollTop === viewPort.clientHeight) {
        if ((this.items.length < this.count) & !this.loading) {
          this.page++

          let { items } = await this.load(this.text)
          if (items.length > 0) {
            this.items = this.items.concat(items)
          }
        }
      }
    }, 100),
    updown(direction) {
      var index = 0
      if (this.selectedItem) {
        index = this.items.indexOf(this.selectedItem) + direction
        if (index < 0) {
          index = 0
        } else if (index > this.items.length - 1) {
          index = this.items.length - 1
        }
      }

      this.select(this.items[index])
      this.scroll(this.items[index])
    },
    openSettings() {
      this.showSettings = true
      this.show = false
    },
    getImage(item) {
      return getImage.call(this, item)
    }
  }
}
</script>

<style scoped>
.search-wrapper {
  display: flex;
  padding: 4px;
  position: relative;
  border-radius: 4px;
  color: #666;
  background-color: #ecf0f6;
}

.search-prefix {
  padding: 0 4px 0 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
  font-size: 21px;
  color: lightslategrey;
}

.search-container {
  display: flex;
  flex: 1;
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

.search-input:focus {
  border: 1px transparent solid;
  background-color: #fff;
  outline: 0;
  box-shadow: none;
}

.items,
.search-settings {
  position: absolute;
  top: 100%;
  left: 0;
  white-space: nowrap;
  color: inherit;
  background-color: #fff;
  z-index: 100;
  box-shadow: 3px 3px 10px currentColor;
}

.search-settings {
  right: 0;
}

.search-settings .row {
  display: flex;
  align-items: center;
  padding: 3px;
}

.search-item {
  padding: 3px 3px;
  outline: 0 none;
  cursor: pointer;
  color: inherit;
}

.search-item .image {
  padding: 0 4px;
}

.search-count,
.search-header-settings {
  display: grid;
  gap: 5px 3px;
  justify-items: center;
  grid-template-columns: 1fr auto;
  padding: 3px;
  background-color: #ecf0f6;
  cursor: default;
}

.search-content {
  overflow: auto;
  overflow-x: hidden;
  height: 14em;
  color: inherit;
  background-color: inherit;
}

.search-item:hover {
  background-color: #eee;
  color: #666;
}

.search-item > div,
.search-item > span {
  display: inline-block;
  vertical-align: middle;
}

.button-clear,
.button-settings,
.button-close {
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0 3px;
  color: slategrey;
}

.button-clear:hover,
.button-settings:hover,
.button-close:hover {
  color: #48525c;
}

.search-spinner-container {
  display: flex;
  align-items: center;
  color: inherit;
}

.search-spinner {
  color: inherit;
  width: 1em;
  height: 1em;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-bottom-color: currentColor;
  animation: spinner 0.8s linear infinite;
}

@keyframes search-spinner {
  to {
    transform: rotate(360deg);
  }
}

.search-container .search-input::-ms-clear {
  display: none;
}

</style>
