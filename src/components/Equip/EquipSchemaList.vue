<template>
  <div class="component-detail">
    <tool-bar v-if="$store.state.user?.userRights.setEdit">
      <div
        :class="['button', 'fas', 'fa-plus-circle', { disabled: wait }]"
        title="Добавить..."
        @click="onAddClick()"
      />
      <div
        :class="[
          'button',
          'fas',
          'fa-times-circle',
          { disabled: !hasSelected || wait },
        ]"
        title="Удалить"
        @click="onRemoveClick()"
      />
    </tool-bar>
    <div
      class="table-grid"
      :style="{ 'grid-template-columns': `repeat(4, max-content)` }"
    >
      <header class="header" />
      <header class="header">
        <check-box
          class="header-box"
          type="checkbox"
          v-model="all"
          @change="changeAll(all)"
          :disabled="wait"
        ></check-box>
      </header>
      <header class="header">Наименование</header>
      <header class="header">Тип</header>
      <div v-for="(r, index) in localItems" :key="index" class="table-row">
        <span class="cell icon">
          <div
            :class="`fas ${getImage(r)} clickable-icon`"
            @click="viewClick(r)"
            title="Просмотр..."
          />
        </span>
        <span class="cell cell-box">
          <check-box
            v-if="r.type === itemTypes['setEquip'] && !r.availableForAll"
            type="checkbox"
            v-model="r.checked"
            :disabled="wait"
          ></check-box>
        </span>
        <span class="cell">{{ r.name }}</span>
        <span class="cell">{{ getType(r) }}</span>
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
      <props-component v-if="edit" v-bind="componentData" @close="close">
        <component
          :is="componentData.component"
          v-bind="componentData.data"
          @saved="onSaved"
        />
      </props-component>
    </transition-group>
  </div>
</template>

<script>
import { asyncImport } from '../../plugins/api.js'

import { Schema } from '@/classes/schema'
import { Set } from '@/classes/set'

import ListComponent from '../ListComponent.vue'
import PagerComponent from '../PagerComponent.vue'
import PropsComponent from '../PropsComponent.vue'
import ToolBar from '../ToolBar.vue'
import Wizard from '../Wizard.vue'

import CheckBox from '@/components/Inputs/CheckBox.vue'

let wizardAdd = (http, set, ids) => {
  const types = [
    { type: 'create', text: 'Новый' },
    { type: 'add', text: 'Существующий' },
  ]

  return {
    name: 'add',
    component: {
      text: 'Выбор набора:',
      component: 'selector-option',
      event: 'selectionChanged',
      data: {
        options: types,
        defaultOption: types[0],
      },
      next(data) {
        if (data === 'create') {
          return {
            component: 'set-detail',
            event: 'changed',
            data: { set },
          }
        }

        if (data === 'add') {
          return {
            text: 'Выберите набор',
            component: 'selector',
            event: 'selectionChanged',
            data: {
              singleMode: true,
              loader: async () => {
                let { data } = await http.get(
                  `set/getSetsToAdd?equipTypeId=${set.equipTypeId}&${ids.reduce(
                    (sum, cur, i) => `${sum}${i === 0 ? '' : '&'}ids=${cur}`,
                    ''
                  )}`
                )
                return data
              },
              columns: [
                {
                  prop: 'text',
                  text: 'Наименование',
                },
              ],
            },
          }
        }
      },
    },
  }
}

const wizardRemove = () => {
  return {
    name: 'remove',
    component: {
      text: 'Удаление наборов:',
      component: 'message',
      data: {
        text: 'Вы действительно хотите удалить выбранные объекты?',
      },
    },
  }
}

export default {
  components: {
    PagerComponent,
    Schema: asyncImport(() => import('../SymbolSchema/Schema.vue')),
    SetComponent: asyncImport(() => import('../Set/SetComponent.vue')),
    PropsComponent,
    ToolBar,
    Wizard,
    CheckBox,
  },
  extends: ListComponent,
  props: {
    id: Number,
  },
  data() {
    return {
      wait: false,
      componentData: {
        component: null,
        text: null,
        data: null,
      },
      edit: false,
      equipTypeId: null,
      equipType: null,
      wizard: null,
    }
  },
  async mounted() {
    await this.load()
  },
  computed: {
    itemTypes() {
      return this.matchType(this.$store.state.env.itemTypes)
    },
    setTypes() {
      return this.matchType(this.$store.state.env.setTypes)
    },
  },
  methods: {
    async create(equipId, setId) {
      this.wait = true

      try {
        await this.$http.post('equip/set', { equipId, setId })
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.wait = false
      }
    },
    async remove(ids) {
      this.wait = true
      try {
        await this.$http.delete('equip/set', { params: { ids } })
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.wait = false
      }
    },
    onAddClick() {
      this.wizard = wizardAdd(
        this.$http,
        new Set({
          type: this.setTypes.equipType,
          equipId: this.id,
          equipTypeId: this.equipTypeId,
          equipType: this.equipType,
        }),
        this.dataItems
          .filter(
            (r) =>
              (this.itemTypes['set'] === r.type ||
                this.itemTypes['setEquip'] === r.type) &&
              this.setTypes['equipType'] === r.setType &&
              !r.availableForAll
          )
          .map((r) => r.id)
      )
    },
    onRemoveClick() {
      this.wizard = wizardRemove()
    },
    cancelWizard() {
      this.wizard = null
    },
    onWizardEnd(data, name) {
      this.wizard = null

      if (name === 'add' && data && Array.isArray(data) && data.length) {
        this.create(this.id, data[0].id)
      } else if (name === 'remove') {
        this.remove(
          this.dataItems
            .filter(
              (r) => r.checked === true && r.type === this.itemTypes['setEquip']
            )
            .map((r) => r.setEquipId)
        )
      }
    },
    getType(r) {
      return r.setType === this.setTypes.none
        ? 'Шаблон'
        : this.$store.state.env.setTypes[r.setType].text
    },
    onSaved(data) {
      this.componentData.text = `${
        data instanceof Set ? 'Набор' : 'Мнемосхема'
      }: ${data.name}`
    },
    viewClick(r) {
      const type = this.$store.state.env.itemTypes[r.type]
      const obj = type.type === 'symbolSchema' ? new Schema(r) : new Set(r)

      this.componentData = {
        component: type.type === 'symbolSchema' ? 'schema' : 'set-component',
        uuid: obj.uuid,
        image: obj.image,
        text: `${type.text}: ${r.name}`,
        data: {
          uuid: obj.uuid,
          id: r.id,
          purposeGroup: r.setType,
          equipId: this.id,
          equipTypeId: this.equipTypeId,
        },
      }
      this.edit = true
    },
    close() {
      this.edit = false
    },
    async load() {
      this.wait = true

      try {
        const { data } = await this.$http.get('equip/getSetsAndSchemas', {
          params: { equipId: this.id },
        })

        this.dataItems = data.data.values.map((r) =>
          Object.assign(r, { checked: this.all })
        )
        this.equipTypeId = data.data.equipTypeId
        this.equipType = data.data.equipType
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.wait = false
      }
    },
    onUpdate(item) {
      if (
        this.itemTypes['setEquip'] === item.type &&
        item.equipId === this.id
      ) {
        if (!this.dataItems.find((r) => r.setEquipId === item.setEquipId)) {
          this.dataItems.push(Object.assign(item, { checked: false }))
        }
      }

      if (this.itemTypes['set'] === item.type) {
        const set = this.dataItems.find(
          (r) =>
            r.id === item.id &&
            (this.itemTypes['set'] === r.type ||
              this.itemTypes['setEquip'] === r.type)
        )

        if (set) {
          if (
            set.type === this.itemTypes['set'] &&
            item.availableForAll === false
          ) {
            const index = this.dataItems.findIndex((r) => r.id === set.id)
            if (index >= 0) {
              this.dataItems.splice(index, 1)
            }
          }

          set.name = item.name
          set.setType = item.setType
          set.availableForAll = item.availableForAll
        } else if (
          item.equipTypeId === this.equipTypeId &&
          item.availableForAll
        ) {
          this.dataItems.push(Object.assign(item, { checked: false }))
        }
      }
    },
    onDelete(obj) {
      if (this.itemTypes['setEquip'] === obj.type) {
        const index = this.dataItems.findIndex((r) => r.setEquipId === obj.id)
        if (index >= 0) {
          this.dataItems.splice(index, 1)
        }
      } else if (this.itemTypes['set'] === obj.type) {
        const index = this.dataItems.findIndex(
          (r) => r.id === obj.id && r.type === obj.type
        )
        if (index >= 0) {
          this.dataItems.splice(index, 1)
        }
      }
    },
  },
}
</script>

<style scoped>
.header-box {
  border: solid 1px white;
}
.cell-box {
  justify-content: center;
}
</style>
