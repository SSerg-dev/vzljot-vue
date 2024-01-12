<template>
  <div class="component-detail">
    <tool-bar v-if="$store.state.user?.userRights.equipTypeEdit">
      <div :class="['button', 'fas', 'fa-plus-circle']" title="Добавить..." @click="onAddClick" />
      <div :class="['button', 'fas', 'fa-times-circle', { disabled: !hasSelected }]" title="Удалить" @click="onRemoveClick" />
    </tool-bar>
    <div class="table-grid" :style="`grid-template-columns: repeat(${columnsCount}, max-content)`">
      <header class="header" />
      <header class="header" v-if="$store.state.user?.userRights.equipTypeEdit"><input type="checkbox" v-model="all" @change="changeAll" /></header>
      <header class="header">Наименование</header>
      <header class="header">Класс точности</header>
      <header class="header">Погрешность, %</header>
      <header class="header">Системное</header>
      <header class="header" v-if="isTemperature || isWeight">DN</header>
      <header class="header" v-if="isTemperature">Tmin, °С</header>
      <header class="header" v-if="isTemperature">Tmax, °С</header>
      <header class="header" v-if="isPressure">Pmin, МПа</header>
      <header class="header" v-if="isPressure">Pmax, МПа</header>
      <header class="header" v-if="isVolume">Gvmin, м3/ч</header>
      <header class="header" v-if="isVolume">Gvmax, м3/ч</header>
      <header class="header" v-if="isWeight">Gmmin, т/ч</header>
      <header class="header" v-if="isWeight">Gmmax, т/ч</header>
      <div v-for="(r, index) in localItems" :key="index" class="table-row">
        <span class="cell icon">
          <div class="fas fa-bars icon clickable-icon" title="Просмотр..." @click="viewClick(r)" />
        </span>
        <span class="cell" v-if="$store.state.user?.userRights.equipTypeEdit">
          <input v-if="!r.isSystem" type="checkbox" v-model="r.checked" />
        </span>
        <span class="cell">{{ r.name }}</span>
        <span class="cell">{{ r.accuracyClass }}</span>
        <span class="cell">{{ r.accuracy }}</span>
        <span class="cell">{{ r.isSystem ? 'Да' : null }}</span>
        <span class="cell" v-if="isTemperature || isWeight">{{ r.diameter }}</span>
        <span class="cell" v-if="isTemperature">{{ r.tmin }}</span>
        <span class="cell" v-if="isTemperature">{{ r.tmax }}</span>
        <span class="cell" v-if="isPressure">{{ r.pmin }}</span>
        <span class="cell" v-if="isPressure">{{ r.pmax }}</span>
        <span class="cell" v-if="isVolume">{{ r.gvmin }}</span>
        <span class="cell" v-if="isVolume">{{ r.gvmax }}</span>
        <span class="cell" v-if="isWeight">{{ r.gmmin }}</span>
        <span class="cell" v-if="isWeight">{{ r.gmmax }}</span>
      </div>
    </div>
    <pager-component v-bind="pageInfo" @go="onChangePage" />
    <transition-group>
      <wizard v-if="wizard" v-bind="wizard" @cancel="cancelWizard" @end="onWizardEnd" />
      <props-component v-if="edit" :text="text" @close="close">
        <modification-component v-bind="{ modification }" @changed="onChangeModification" />
      </props-component>
    </transition-group>
  </div>
</template>

<script>
import Modification from '../../classes/modification'

import ListComponent from '../ListComponent.vue'
import ModificationComponent from './ModificationComponent.vue'
import PagerComponent from '../PagerComponent.vue'
import PropsComponent from '../PropsComponent.vue'
import ToolBar from '../ToolBar.vue'
import Wizard from '../Wizard.vue'

const wizardAdd = value => {
  return {
    name: 'add',
    component: {
      text: 'Создание исполнения:',
      component: 'equipTypeModificationProps',
      event: 'changed',
      data: value
    }
  }
}

const wizardRemove = () => {
  return {
    name: 'remove',
    component: {
      text: 'Удаление исполнений:',
      component: 'message',
      data: {
        text: 'Вы действительно хотите удалить выбранные исполнения?'
      }
    }
  }
}

export default {
  components: {
    ModificationComponent,
    PagerComponent,
    PropsComponent,
    ToolBar,
    Wizard
  },
  extends: ListComponent,
  props: {
    items: {
      type: Array,
      default: () => []
    },
    isPressure: Boolean,
    isTemperature: Boolean,
    isVolume: Boolean,
    isWeight: Boolean
  },
  data() {
    return {
      modification: null,
      edit: false,
      wizard: null
    }
  },
  computed: {
    columnsCount() {
      let count = 15

      if (!this.$store.state.user?.userRights.equipTypeEdit) {
        count--
      }

      if (!(this.isTemperature || this.isWeight)) {
        count--
      }

      if (!this.isTemperature) {
        count = count - 2
      }

      if (!this.isPressure) {
        count = count - 2
      }

      if (!this.isVolume) {
        count = count - 2
      }

      if (!this.isWeight) {
        count = count - 2
      }

      return count
    },
    text() {
      return this.modification ? `Исполнение: ${this.modification.name}` : null
    }
  },
  methods: {
    viewClick(r) {
      this.modification = r
      this.edit = true

      if (!this.modification.isSystem) {
        this.$emit('edit', this.edit)
      }
    },
    changeAll() {
      this.dataItems.filter(r => !r.isSystem).forEach(r => (r.checked = this.all))
    },
    close() {
      this.edit = false

      if (!this.modification.isSystem) {
        this.$emit('edit', this.edit)
      }
    },
    onAddClick() {
      this.wizard = wizardAdd(
        new Modification({
          isTemperature: this.isTemperature,
          isPressure: this.isPressure,
          isVolume: this.isVolume,
          isWeight: this.isWeight,
          isSystem: false
        })
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

      if (name === 'remove') {
        this.remove(this.dataItems.filter(r => r.checked === true).map(r => r.id))
      } else if (name === 'add') {
        this.add(data)
      }
    },
    onChangeModification(modification) {
      Object.keys(this.modification).forEach(r => (this.modification[r] = modification[r]))
    },
    add(modification) {
      this.$emit('add', modification)
    },
    remove(ids) {
      this.$emit('remove', ids)
    }
  }
}
</script>

<style></style>
