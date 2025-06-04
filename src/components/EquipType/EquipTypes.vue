<template>
  <div class="component-detail">
    <tool-bar>
      <div v-if="$store.state.user?.userRights.equipTypeEdit" :class="['button', 'fas', 'fa-plus-circle', { disabled: wait }]" title="Добавить..." @click="onAddClick" />
      <div v-if="$store.state.user?.userRights.equipTypeEdit" :class="['button', 'fas', 'fa-times-circle', { disabled: !hasSelected || wait }]" title="Удалить" @click="onRemoveClick" />
      <template v-slot:end>
        <div :class="['button', 'fas', 'fa-filter', 'remove-sign', { disabled: !hasFilterChanges }]" title="Очистить фильтр" @click="onClearFilterClick" />
        <div :class="['button', 'fas', 'fa-filter']" title="Фильтр..." @click="onFilterClick" />
      </template>
    </tool-bar>
    <div class="table-grid" :style="`grid-template-columns: repeat(${$store.state.user?.userRights.equipTypeEdit ? 11 : 10}, max-content)`">
      <header class="header" />
      <header class="header" v-if="$store.state.user?.userRights.equipTypeEdit"><input type="checkbox" v-model="all" @change="changeAll" :disabled="wait" /></header>
      <header class="header">Наименование</header>
      <header class="header">Назначение</header>
      <header class="header">Межповерочный интервал</header>
      <header class="header">Системы</header>
      <header class="header">t</header>
      <header class="header">p</header>
      <header class="header">Gv</header>
      <header class="header">Gm</header>
      <header class="header">Системная</header>
      <div v-for="(r, index) in localItems" :key="index" class="table-row">
        <span class="cell icon">
          <div :class="`${getImage(r)} clickable-icon`" title="Просмотр..." @click="viewClick(r)" />
        </span>
        <span class="cell" v-if="$store.state.user?.userRights.equipTypeEdit">
          <input v-if="!r.isSystem" type="checkbox" v-model="r.checked" :disabled="wait" />
        </span>
        <span class="cell">{{ r.name }}</span>
        <span class="cell">{{ r.purpose ? $store.state.env.equipTypePurposeEnum[r.purpose] : null }}</span>
        <span class="cell">{{ r.interval }}</span>
        <span class="cell">{{ schemas(r.schemas) }}</span>
        <span class="cell">{{ r.isTemperature ? 'Да' : '' }}</span>
        <span class="cell">{{ r.isPressure ? 'Да' : '' }}</span>
        <span class="cell">{{ r.isVolume ? 'Да' : '' }}</span>
        <span class="cell">{{ r.isWeight ? 'Да' : '' }}</span>
        <span class="cell">{{ r.isSystem ? 'Да' : '' }}</span>
      </div>
    </div>
    <pager-component v-bind="pageInfo" @go="onChangePage" />
    <spinner :show="wait" :text="waitText" />
    <transition-group>
      <wizard v-if="wizard" v-bind="wizard" @cancel="cancelWizard" @end="onWizardEnd" />
      <props-component v-if="edit" :text="text" @close="close">
        <equip-type v-bind="{ creator: $options.name, id: component.id, type: matchType($store.state.env.itemTypes).equipType }" />
      </props-component>
    </transition-group>
  </div>
</template>

<script>
import ListComponent from '../ListComponent.vue'
import PagerComponent from '../PagerComponent.vue'
import EquipType from './EquipType.vue'
import ToolBar from '../ToolBar.vue'
import PropsComponent from '../PropsComponent.vue'
import Wizard from '../Wizard.vue'

const wizardFilter = filter => {
  return {
    name: 'filter',
    component: {
      text: 'Фильтр:',
      component: 'equipTypesFilter',
      event: 'changed',
      data: {
        filter
      }
    }
  }
}

const wizardAdd = value => {
  return {
    name: 'add',
    component: {
      text: 'Создание модели:',
      component: 'equipTypeProps',
      event: 'change',
      data: {
        value
      }
    }
  }
}

const wizardRemove = () => {
  return {
    name: 'remove',
    component: {
      text: 'Удаление моделей оборудования:',
      component: 'message',
      data: {
        text: 'Вы действительно хотите удалить выбранные модели?'
      }
    }
  }
}

export default {
  name: 'equipTypes',
  components: {
    EquipType,
    PagerComponent,
    ToolBar,
    PropsComponent,
    Wizard
  },
  extends: ListComponent,
  data() {
    return {
      wait: false,
      waitText: null,
      component: null,
      edit: false,
      filter: this.emptyFilter(),
      wizard: null
    }
  },
  async mounted() {
    await this.load()
  },
  computed: {
    schemasFlags() {
      const flags = []

      Object.keys(this.$store.state.env.pointTypes)
        .map(r => parseInt(r))
        .forEach(r => {
          if (r !== 0) {
            if (!flags.some(value => r & value)) {
              flags.push(r)
            }
          }
        })

      return [...new Set(flags)]
    },
    text() {
      return `Модель: ${this.component.name}`
    },
    filteredItems() {
      let rows = this.dataItems.slice(0).sort(this.sort)

      if (this.filter.name !== null) {
        rows = rows.filter(r => r.name.toLowerCase().includes(this.filter.name.toLowerCase()))
      }

      if (this.filter.purpose !== null) {
        rows = rows.filter(r => r.purpose === this.filter.purpose)
      }

      if (this.filter.schemas !== null) {
        rows = rows.filter(r => (r.schemas & this.filter.schemas) === this.filter.schemas)
      }

      if (this.filter.interval != null) {
        rows = rows.filter(r => r.interval === this.filter.interval)
      }

      if (this.filter.isTemperature) {
        rows = rows.filter(r => r.isTemperature)
      }

      if (this.filter.isPressure) {
        rows = rows.filter(r => r.isPressure)
      }

      if (this.filter.isVolume) {
        rows = rows.filter(r => r.isVolume)
      }

      if (this.filter.isWeight) {
        rows = rows.filter(r => r.isWeight)
      }

      if (this.filter.isSystem !== null) {
        rows = rows.filter(r => r.isSystem === this.filter.isSystem)
      }

      return rows
    }
  },
  methods: {
    schemas(value) {
      return [
        ...this.schemasFlags.reduce((acc, r) => {
          if ((value & r) === r) {
            acc.add(r)
          }

          return acc
        }, new Set())
      ].reduce((acc, r) => (acc ? `${acc}; ` : '') + this.$store.state.env.pointTypes[r]?.text, null)
    },
    emptyFilter() {
      return {
        name: null,
        purpose: null,
        schemas: null,
        interval: null,
        isTemperature: null,
        isPressure: null,
        isVolume: null,
        isWeight: null,
        isSystem: null
      }
    },
    onFilterClick() {
      this.wizard = wizardFilter(this.filter)
    },
    cancelWizard() {
      this.wizard = null
    },
    onWizardEnd(data, name) {
      this.wizard = null

      if (name === 'filter') {
        if (data !== null) {
          this.filter = data
        }
      } else if (name === 'remove') {
        this.remove(this.dataItems.filter(r => r.checked === true).map(r => r.id))
      } else if (name === 'edit') {
        let user = this.users.find(r => r.id === data.id)
        if (user) {
          Object.entries(data).forEach(([key, value]) => {
            if (user.hasOwnProperty(key)) {
              user[key] = value
            }
          })
        }
      }
    },
    viewClick(r) {
      this.component = r

      this.edit = true
    },
    close() {
      this.edit = false
    },
    async load() {
      this.wait = true
      this.waitText = 'Загрузка...'

      try {
        const type = this.matchType(this.$store.state.env.itemTypes).equipType
        const { data } = await this.$http.get(`equipType/equipTypes`)

        this.dataItems = data.map(r => Object.assign(r, { checked: false, type }))
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.wait = false
      }
    },
    onUpdate(item) {
      const type = this.$store.state.env.itemTypes[item.type].type
      if (type === 'equipType') {
        const equipType = this.dataItems.find(r => r.id === item.id)
        if (equipType) {
          equipType.name = item.name
          equipType.purpose = item.purpose
          equipType.interval = item.interval
          equipType.schemas = item.schemas
          equipType.isTemperature = item.isTemperature
          equipType.isPressure = item.isPressure
          equipType.isVolume = item.isVolume
          equipType.isWeight = item.isWeight
          equipType.isSystem = item.isSystem
        } else {
          this.dataItems.push(Object.assign(item, { checked: false }))
        }
      }
    },
    onDelete(obj) {
      const type = this.$store.state.env.itemTypes[obj.type].type
      if (type === 'equipType') {
        const index = this.dataItems.findIndex(r => r.id === obj.id)
        if (index >= 0) {
          this.dataItems.splice(index, 1)
        }
      }
    },
    onAddClick() {
      this.wizard = wizardAdd({})
    },
    onRemoveClick() {
      this.wizard = wizardRemove()
    },
    async remove(ids) {
      this.wait = true
      this.waitText = 'Удаление...'
      try {
        await this.$http.delete('equipType/equipType', { params: { ids } })
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.wait = false
      }
    }
  }
}
</script>
