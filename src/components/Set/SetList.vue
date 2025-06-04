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
      style="grid-template-columns: repeat(6, max-content)"
    >
      <header class="header"></header>
      <header class="header">Наименование</header>
      <header class="header">Тип набора</header>
      <header class="header">Модель прибора</header>
      <header class="header">Доступен для всех приборов</header>
      <header class="header">Настроечные параметры</header>
      <div
        v-for="(r, index) in dataItems" 
        :key="index"
        class="table-row"
      >
        <span class="cell icon">
          <div
            :class="`${getImage(r)} clickable-icon`"
            title="Просмотр..."
            @click="viewClick(r)"
          />
        </span>
        <span class="cell">{{ r.text }}</span>
        <span class="cell">{{
          $store.state.env.setTypes[r.setType].text
        }}</span>
        <span class="cell">{{ r.equipTypeText }}</span>
        <span class="cell">{{ r.availableForAll ? 'Да' : 'Нет' }}</span>
        <span class="cell">{{ r.isCustomizing ? 'Да' : 'Нет' }}</span>
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
        <set-component v-bind="component.data" @saved="onSaved" />
      </props-component>
    </transition-group>
  </div>
</template>

<script>
import { Set } from '../../classes/set'

import ListComponent from '../ListComponent.vue'
import PagerComponent from '../PagerComponent.vue'
import SetComponent from './SetComponent.vue'
import ToolBar from '../ToolBar.vue'
import PropsComponent from '../PropsComponent.vue'
import Wizard from '../Wizard.vue'

const wizardFilter = (filter) => {
  return {
    name: 'filter',
    component: {
      text: 'Фильтр:',
      component: 'SetListFilter',
      event: 'changed',
      data: {
        filter,
      },
    },
  }
}

export default {
  name: 'setList',
  components: {
    PagerComponent,
    SetComponent,
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
  methods: {
    emptyFilter() {
      return {
        type: null,
        name: null,
        objectName: null,
      }
    },
    sort(a, b) {
      return this.$store.state.collator.compare(
        a.text.toLowerCase(),
        b.text.toLowerCase()
      )
    },
    onSaved(data) {
      this.component.text = `Набор: ${data.name}`
    },
    viewClick(r) {
      const set = new Set(r)
      this.component = {
        image: set.image,
        text: `Набор: ${r.text}`,
        uuid: set.uuid,
        data: {
          id: set.id,
          uuid: set.uuid,
          equipId: set.equipId,
          equipTypeId: set.equipTypeId,
        },
      }

      this.edit = true
    },
    close() {
      this.edit = false
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
    async get(page, size) {
      this.wait = true

      try {
        const {
          data: { values, pageInfo },
        } = await this.$http.post(`set/sets`, {
          type: this.filter.type,
          name: this.filter.name,
          objectName: this.filter.objectName,
          pageInfo: {
            page,
            size,
          },
        })

        this.dataItems = values.map((r) => Object.assign(r, { checked: false }))

        this.pageInfo = {
          Page: page,
          Items: pageInfo.Items,
          Size: size,
        }
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.wait = false
      }
    },
    onUpdate(item) {
      const type = this.$store.state.env.itemTypes[item.type].type
      if (type === 'set') {
        const set = this.dataItems.find((r) => r.id === item.id)
        if (set) {
          set.text = item.name
          set.setType = item.setType
          set.availableForAll = item.availableForAll
          set.isCustomizing = item.isCustomizing
        } else {
          this.dataItems.push(item)
        }
      }
    },
    onDelete(obj) {
      const type = this.$store.state.env.itemTypes[obj.type].type
      if (type === 'set') {
        const index = this.dataItems.findIndex((r) => r.id === obj.id)
        if (index >= 0) {
          this.dataItems.splice(index, 1)
        }
      }
    },
  },
}
</script>
