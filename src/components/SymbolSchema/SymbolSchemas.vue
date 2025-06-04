<template>
  <div class="component-detail">
    <tool-bar>
      <template v-slot:end>
        <div
          :class="[
            'button',
            'fas',
            'fa-filter',
            'remove-sign',
            { disabled: !hasFilterChanges },
          ]"
          title="Очистить фильтр"
          @click="onClearFilterClick"
        />
        <div
          :class="['button', 'fas', 'fa-filter']"
          title="Фильтр..."
          @click="onFilterClick"
        />
      </template>
    </tool-bar>
    <div
      class="table-grid"
      :style="{ 'grid-template-columns': `repeat(6, max-content)` }"
    >
      <header class="header" />
      <header class="header">Наименование</header>
      <header class="header">Тип мнемосхемы</header>
      <header class="header">Модель прибора</header>
      <header class="header">Системная</header>
      <header class="header">Доступна для всех приборов</header>
      <div
        v-for="(r, index) in localItems"
        :key="index"
        class="table-row"
      >
        <span class="cell icon">
          <span
            :class="getClass(r)"
            :style="getStyle(r)"
            title="Просмотр..."
            @click="viewClick(r)"
          />
        </span>
        <span class="cell">{{ r.name }}</span>
        <span class="cell">{{ getPurpose(r) }}</span>
        <span class="cell">{{ r.equipTypeText }}</span>
        <span class="cell">{{ r.isSystem ? 'Да' : 'Нет' }}</span>
        <span class="cell">{{ getForAll(r) }}</span>
      </div>
    </div>
    <pager-component v-bind="pageInfo" @go="onChangePage" />
    <spinner :show="wait" :text="'Загрузка списка...'" />
    <transition-group>
      <wizard
        v-if="wizard"
        v-bind="wizard"
        @cancel="cancelWizard"
        @end="onWizardEnd"
      />
      <props-component v-if="edit" v-bind="component" @close="close">
        <schema-component
          :key="component.uuid"
          v-bind="component.data"
          @saved="onSaved"
        />
      </props-component>
    </transition-group>
  </div>
</template>

<script>
import { Schema } from '@/classes/schema'

import { lightenDarken } from '../../plugins/api.js'

import ListComponent from '../ListComponent.vue'
import PagerComponent from '../PagerComponent.vue'
import SchemaComponent from '../SymbolSchema/Schema.vue'
import ToolBar from '../ToolBar.vue'
import PropsComponent from '../PropsComponent.vue'
import Wizard from '../Wizard.vue'

const wizardFilter = (filter) => {
  return {
    name: 'filter',
    component: {
      text: 'Фильтр:',
      component: 'SymbolSchemasFilter',
      event: 'changed',
      data: {
        filter,
      },
    },
  }
}

export default {
  name: 'symbolSchemas',
  components: {
    PagerComponent,
    SchemaComponent,
    ToolBar,
    PropsComponent,
    Wizard,
  },
  data() {
    return {
      wait: false,
      component: null,
      edit: false,
      filter: this.emptyFilter(),
      wizard: null,
    }
  },
  extends: ListComponent,
  computed: {
    setTypes() {
      return this.matchType(this.$store.state.env.setTypes)
    },
  },
  methods: {
    onUpdate(item) {
      if (this.$store.state.env.itemTypes[item.type].type === 'symbolSchema') {
        const prop = this.dataItems.find((r) => r.id === item.id)

        if (prop) {
          prop.name = item.name
          prop.availableForAll = item.availableForAll
        } else {
          this.dataItems.push({
            id: item.id,
            name: item.name,
            type: item.type,
            purposeGroup: item.purposeGroup,
            equipTypeText: item.equipTypeText,
            isSystem: item.isSystem,
            availableForAll: item.availableForAll,
          })
        }
      }
    },
    onDelete(obj) {
      if (this.$store.state.env.itemTypes[obj.type].type === 'symbolSchema') {
        const index = this.dataItems.findIndex((r) => r.id === obj.id)

        if (index >= 0) {
          this.dataItems.splice(index, 1)
        }
      }
    },
    getStyle(item) {
      return {
        position: 'relative',
        color:
          item.purposeGroup === this.setTypes.none
            ? lightenDarken('#778899', 25)
            : '#778899',
      }
    },
    getClass(item) {
      return `fas fa-project-diagram clickable-icon ${
        item.purposeGroup === this.setTypes.equipGroup ? 'sign-group' : ''
      }`
    },
    getPurpose(r) {
      return r.purposeGroup === this.setTypes.none
        ? 'Шаблон'
        : this.$store.state.env.setTypes[r.purposeGroup].text
    },
    getForAll(r) {
      return r.purposeGroup === this.setTypes.equipType
        ? r.availableForAll
          ? 'Да'
          : 'Нет'
        : ''
    },
    emptyFilter() {
      return {
        purposeGroup: null,
        name: null,
        objectName: null,
      }
    },
    onSaved(data) {
      this.component.text = `Мнемосхема: ${data.name}`
    },
    viewClick(r) {
      const schema = new Schema(r)

      this.component = {
        image: schema.image,
        text: `Мнемосхема: ${schema.name}`,
        uuid: schema.uuid,
        data: {
          id: schema.id,
          uuid: schema.uuid,
          purposeGroup: schema.purposeGroup,
        },
      }

      this.edit = true
    },
    okClick() {
      if (this.dialog === 'filter') {
        this.dialog = null
        this.get(1, this.pageInfo.Size)
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

      if (name === 'filter' && data) {
        this.filter = data
        this.get(1, this.pageInfo.Size)
      }
    },
    close() {
      this.edit = false
    },
    async get(page, size) {
      this.wait = true

      try {
        const { data } = await this.$http.get(`symbolSchema/schemas`, {
          params: {
            qs: JSON.stringify({
              purposeGroup: this.filter.purposeGroup,
              name: this.filter.name,
              objectName: this.filter.objectName,
              pageInfo: {
                page,
                size,
              },
            }),
          },
        })

        this.dataItems = data.values

        this.pageInfo = {
          Page: page,
          Items: data.pageInfo.Items,
          Size: size,
        }
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.wait = false
      }
    },
  },
}
</script>
