<template>
  <div class="extra-layout">
    <nav class="nav">
      <div v-for="r in items" class="nav-item" :key="`${r.id}_${r.type}`" @click="clickNavItem(r)">
        <span :class="[getImage(r), 'nav-icon']" />
        <span :class="['nav-text', { active: r.active }]">{{ r.text }}</span>
      </div>
    </nav>
    <div class="content">
      <transition mode="out-in">
        <component v-if="component" :is="component.name" />
      </transition>
    </div>
  </div>
</template>

<script>
import { asyncImport, getImage } from '../../plugins/api.js'

export default {
  components: {
    CustomProps: asyncImport(() => import('../CustomProps/CustomProps.vue')),
    EquipTypes: asyncImport(() => import('../EquipType/EquipTypes.vue')),
    Import: asyncImport(() => import('../Import/ImportComponent.vue')),
    ReportTasks: asyncImport(() => import('../ReportTask/ReportTasks.vue')),
    Sets: asyncImport(() => import('../Set/SetList.vue')),
    SymbolSchemas: asyncImport(() => import('../SymbolSchema/SymbolSchemas.vue')),
    SystemProps: asyncImport(() => import('../SystemProps/SystemProps.vue')),
    Users: asyncImport(() => import('../Users/UsersList.vue')),
    UserGroups: asyncImport(() => import('../Users/UserGroups.vue')),
  },
  data() {
    return {
      items: [],
      creators: ['customProps', 'equipTypes', 'reportTasks', 'setList', 'symbolSchemas', 'userGroups', 'usersList'],
      component: null,
      components: [],
      itemTypes: ['customProp', 'reportTask', 'equipType', 'set', 'symbolSchema', 'systemProps', 'user', 'userGroup']
    }
  },
  created() {
    this.$emitter.on('componentCreated', this.onComponentCreated)
    this.$emitter.on('componentBeforeUnmount', this.onComponentBeforeUnmount)
  },
  mounted() {
    this.$nextTick().then(() => this.init())
  },
  beforeUnmount() {
    this.$emitter.off('componentCreated', this.onComponentCreated)
    this.$emitter.off('componentBeforeUnmount', this.onComponentBeforeUnmount)
  },
  methods: {
    async init() {
      try {
        const { data } = await this.$http.get('tree/getExtraTree')
        data.forEach(r => (r.active = false))
        data.sort((a, b) => a.text.localeCompare(b.text))
        this.items = data
      } catch (error) {
        this.$store.commit('error', error)
      }
    },
    getImage(item) {
      return getImage.call(this, item)
    },
    onComponentCreated({ type, key, creator, component }) {
      if (this.itemTypes.includes(this.$store.state.env.itemTypes[type]?.type) && (creator ? this.creators.includes(creator) : true)) {
        this.components.push({ key, component })
      }
    },
    onComponentBeforeUnmount({ type, key, creator }) {
      if (this.itemTypes.includes(this.$store.state.env.itemTypes[type]?.type) && (creator ? this.creators.includes(creator) : true)) {
        const index = this.components.findIndex(r => r.key === key)

        if (index > -1) {
          this.components.splice(index, 1)
        }
      }
    },
    clickNavItem(item) {
      this.items.forEach(r => (r.active = item === r))
      let component = null
      if (this.$store.state.env && this.$store.state.env.itemTypes[item.type]) {
        component = {
          name: this.$store.state.env.itemTypes[item.type].type
        }
      }
      this.component = component
    }
  }
}
</script>

<style scoped>
.extra-layout {
  display: grid;
  gap: 7px;
  flex: 1;
  overflow: auto;
  grid-template-columns: max-content 1fr;
}

.nav {
  overflow: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  background-color: #ecf0f6;
  border-bottom: 1px solid white;
  padding: 10px;
  cursor: pointer;
  user-select: none;
}

.nav-item:hover .nav-text {
  text-decoration: underline;
}

.nav-icon {
  text-align: center;
  width: 1.4em;
}

.nav-text {
  font-size: larger;
  padding: 0 10px;
  color: #666;
}

.nav-text.active {
  text-decoration: underline;
}

.content {
  display: flex;
  flex: 1;
  overflow: auto;
}
</style>
