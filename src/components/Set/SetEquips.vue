<template>
  <div class="component-detail">
    <tool-bar v-if="$store.state.user?.userRights.setEdit">
      <div :class="['button', 'fas', 'fa-plus-circle', { disabled: wait }]" title="Добавить..." @click="onAddEquipClick()" />
      <div :class="['button', 'fas', 'fa-times-circle', { disabled: !isAnyParam || wait }]" title="Удалить" @click="onRemoveEquipClick()" />
    </tool-bar>
    <div class="table-grid" :style="`grid-template-columns: repeat(${$store.state.user?.userRights.setEdit ? 3 : 2}, max-content)`">
      <header class="header"></header>
      <header class="header" v-if="$store.state.user?.userRights.setEdit"><input type="checkbox" v-model="all" @change="changeAll" :disabled="wait" /></header>
      <header class="header">Наименование</header>
      <div v-for="(r, index) in localItems" :key="index" class="table-row">
        <span class="cell icon">
          <div :class="`${getImage(r)} ${$store.state.env.statuses[r.state].class} table-icon`" />
        </span>
        <span class="cell" v-if="$store.state.user?.userRights.setEdit">
          <input type="checkbox" v-model="r.checked" :disabled="wait" />
        </span>
        <span class="cell">{{ r.text }}</span>
      </div>
    </div>
    <pager-component v-bind="pageInfo" @go="onChangePage" />
    <spinner :show="wait" :text="'Загрузка данных...'" />
    <transition>
      <wizard v-if="wizard" v-bind="wizard" @cancel="cancelWizard" @end="onWizardEnd" />
    </transition>
  </div>
</template>

<script>
import ListComponent from '../ListComponent.vue'
import ToolBar from '../ToolBar.vue'
import PagerComponent from '../PagerComponent.vue'
import Wizard from '../Wizard.vue'

const wizardAdd = (http, equips, id) => {
  return {
    name: 'add',
    component: {
      text: 'Выберите прибор',
      component: 'selector',
      event: 'selectionChanged',
      data: {
        loader: async () => {
          let { data } = await http.get('set/getEquipsToAdd', { params: { setId: id } })
          return data.filter(r => !equips.includes(r.id))
        },
        columns: [
          {
            prop: 'text',
            text: 'Наименование'
          }
        ]
      }
    }
  }
}

const wizardRemove = () => {
  return {
    name: 'remove',
    component: {
      text: 'Удаление приборов:',
      component: 'message',
      data: {
        text: 'Вы действительно хотите удалить выбранные приборы?'
      }
    }
  }
}

export default {
  name: 'setEquips',
  components: {
    ToolBar,
    PagerComponent,
    Wizard
  },
  extends: ListComponent,
  props: {
    items: {
      type: Array,
      default: () => []
    },
    id: Number
  },
  data() {
    return {
      wait: false,
      wizard: null
    }
  },
  computed: {
    isAnyParam() {
      return this.dataItems.some(r => r.checked === true)
    },
    filteredItems() {
      return this.dataItems.slice(0).sort((a, b) => this.$store.state.collator.compare(a.text.toLowerCase(), b.text.toLowerCase()))
    },
  },
  methods: {
    cancelWizard() {
      this.wizard = null
    },
    onWizardEnd(data, name) {
      this.wizard = null

      if (name === 'add') {
        this.$emit('addEquips', data)
      } else if (name === 'remove') {
        this.$emit(
          'removeEquips',
          this.dataItems.filter(r => r.checked === true)
        )
      }
    },
    onAddEquipClick() {
      this.wizard = wizardAdd(
        this.$http,
        this.dataItems.map(r => r.equipId),
        this.id
      )
    },
    onRemoveEquipClick() {
      this.wizard = wizardRemove()
    }
  }
}
</script>
