<template>
  <div class="component-detail">
    <tool-bar>
      <div
        v-if="$store.state.user?.userRights.customPropertyEdit"
        :class="['button', 'fas', 'fa-plus-circle', { disabled: wait }]"
        title="Добавить..."
        @click="onAddClick"
      />
      <div
        v-if="$store.state.user?.userRights.customPropertyEdit"
        :class="[
          'button',
          'fas',
          'fa-times-circle',
          { disabled: !hasSelected || wait },
        ]"
        title="Удалить"
        @click="onRemoveClick"
      />
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
      :style="{ 'grid-template-columns': `repeat(7, max-content)` }"
    >
      <header class="header" />
      <header class="header">
        <input
          type="checkbox"
          v-model="all"
          @change="changeAll"
          :disabled="wait"
        />
      </header>
      <header class="header">Наименование</header>
      <header class="header">Код</header>
      <header class="header">Тип данных</header>
      <header class="header">Тип объекта</header>
      <header class="header">Отображение</header>
      <div v-for="r in localItems" class="table-row" :key="r.id">
        <span class="cell icon">
          <div
            :class="'fas fa-brackets-curly clickable-icon'"
            @click="viewClick(r)"
            title="Просмотр..."
          />
        </span>
        <span class="cell"
          ><input type="checkbox" v-model="r.checked" :disabled="wait"
        /></span>
        <span class="cell">{{ r.name }}</span>
        <span class="cell">{{ r.code }}</span>
        <span class="cell">{{ propertyType(r.dataType) }}</span>
        <span class="cell">{{ objectType(r.objectType) }}</span>
        <span class="cell">{{ displayIn(r.displayIn) }}</span>
      </div>
    </div>
    <pager-component v-bind="pageInfo" @go="onChangePage" />
    <spinner :show="wait" :text="spinnerText" />
    <transition-group>
      <wizard
        v-if="wizard"
        v-bind="wizard"
        @cancel="cancelWizard"
        @end="onWizardEnd"
      />
      <props v-if="edit" v-bind="component" @close="close">
        <custom-component v-bind="component.data" />
      </props>
    </transition-group>
  </div>
</template> 

<script>
import { CustomProp, CustomPropError } from '@/classes/customProp'
import { CustomPropertyObjectTypeEnum } from '@/classes/enum/CustomPropertyObjectTypeEnum'
import { CustomPropertyDisplayInEnum } from '@/classes/enum/CustomPropertyDisplayInEnum'
import { CustomPropertyTypeEnum } from '@/classes/enum/CustomPropertyTypeEnum'

const spinnerText = 'Загрузка данных...'

let wizardFilter = (filter) => {
  return {
    name: 'filter',
    component: {
      text: 'Фильтр:',
      component: 'customPropsFilter',
      event: 'changed',
      data: {
        filter,
      },
    },
  }
}

let wizardAdd = () => {
  return {
    name: 'add',
    component: {
      text: 'Создание параметра:',
      component: 'customProp',
      event: 'changed',
      data: {
        value: new CustomProp({}),
        error: new CustomPropError({}),
      },
    },
  }
}

let wizardRemove = () => {
  return {
    name: 'remove',
    component: {
      text: 'Удаление параметров:',
      component: 'message',
      data: {
        text: 'Вы действительно хотите удалить выбранные параметры?',
      },
    },
  }
}

import CustomComponent from './CustomComponent.vue'
import ListComponent from '../ListComponent.vue'
import PagerComponent from '../PagerComponent.vue'
import Props from '../PropsComponent.vue'
import ToolBar from '../ToolBar.vue'
import Wizard from '../Wizard.vue'

export default {
  name: 'customProps',
  components: {
    CustomComponent,
    PagerComponent,
    Props,
    ToolBar,
    Wizard,
  },
  extends: ListComponent,
  data() {
    return {
      filter: this.emptyFilter(),
      wait: false,
      spinnerText: spinnerText,
      wizard: null,
      all: false,
      component: {},
      edit: false,
    }
  },
  computed: {
    filteredItems() {
      let customProps = this.dataItems.slice(0).sort(this.sort)

      if (this.filter.name !== null) {
        customProps = customProps.filter((r) =>
          r.name.toLowerCase().includes(this.filter.name.toLowerCase())
        )
      }

      if (this.filter.code !== null) {
        customProps = customProps.filter((r) =>
          r.code.toLowerCase().includes(this.filter.code.toLowerCase())
        )
      }

      if (this.filter.dataType !== null) {
        customProps = customProps.filter(
          (r) => r.dataType === this.filter.dataType
        )
      }

      if (this.filter.objectType !== null) {
        customProps = customProps.filter(
          (r) => r.objectType === this.filter.objectType
        )
      }

      return customProps
    },
  },
  async mounted() {
    await this.load()
  },
  methods: {
    displayIn(value) {
      return [
        (CustomPropertyDisplayInEnum.List & value) ===
        CustomPropertyDisplayInEnum.List
          ? 'Списки'
          : '',
        (CustomPropertyDisplayInEnum.Counter & value) ===
        CustomPropertyDisplayInEnum.Counter
          ? 'Показания счетчиков'
          : '',
        (CustomPropertyDisplayInEnum.TGA & value) ===
        CustomPropertyDisplayInEnum.TGA
          ? 'Анализ температурных графиков'
          : '',
      ]
        .filter((r) => r !== '')
        .join('; ')
    },
    objectType(type) {
      if (type === CustomPropertyObjectTypeEnum.Equip) return 'Прибор'
      if (type === CustomPropertyObjectTypeEnum.MeasureScheme)
        return 'Точка учета'
      if (type === CustomPropertyObjectTypeEnum.EquipAndMeasureScheme)
        return 'Прибор и точка учета'
    },
    propertyType(type) {
      if (type === CustomPropertyTypeEnum.String) return 'Строка'
      if (type === CustomPropertyTypeEnum.Integer) return 'Целое число'
      if (type === CustomPropertyTypeEnum.Double) return 'Вещественное число'
      if (type === CustomPropertyTypeEnum.DateTime) return 'Дата и время'
      if (type === CustomPropertyTypeEnum.Boolean) return 'Логическое значение'
    },
    onUpdate(item) {
      if (this.$store.state.env.itemTypes[item.type].type === 'customProp') {
        let prop = this.dataItems.find((r) => r.id === item.id)
        if (prop) {
          prop.name = item.name
          prop.code = item.code
          prop.dataType = item.dataType
          prop.objectType = item.objectType
          prop.displayIn = item.displayIn
        } else {
          this.dataItems.push({
            id: item.id,
            name: item.name,
            code: item.code,
            dataType: item.dataType,
            objectType: item.objectType,
            displayIn: item.displayIn,
            checked: false,
          })
        }
      }
    },
    onDelete(obj) {
      if (this.$store.state.env.itemTypes[obj.type].type === 'customProp') {
        const index = this.dataItems.findIndex((r) => r.id === obj.id)
        if (index >= 0) {
          this.dataItems.splice(index, 1)
        }
      }
    },
    emptyFilter() {
      return {
        name: null,
        code: null,
        dataType: null,
        objectType: null,
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
        this.remove(
          this.dataItems.filter((r) => r.checked === true).map((r) => r.id)
        )
      }
    },
    onAddClick() {
      this.wizard = wizardAdd()
    },
    onRemoveClick() {
      this.wizard = wizardRemove()
    },
    viewClick(r) {
      const customProp = new CustomProp(r)

      this.component = {
        image: customProp.image,
        text: `Параметр: ${customProp.name}`,
        uuid: customProp.uuid,
        data: {
          id: customProp.id,
          uuid: customProp.uuid,
        },
      }

      this.edit = true
    },
    close() {
      this.edit = false
    },
    async load() {
      try {
        this.wait = true
        this.spinnerText = spinnerText

        const { data } = await this.$http.get('customProps/customProps')

        data.forEach((r) => (r.checked = this.all))
        this.dataItems = data
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.wait = false
      }
    },
    async remove(ids) {
      this.wait = true
      this.spinnerText = 'Удаление...'
      try {
        await this.$http.delete('customProps/customProps', { params: { ids } })
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.wait = false
      }
    },
  },
}
</script>
