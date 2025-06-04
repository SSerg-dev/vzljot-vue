<template>
  <div class="component-detail">
    <tool-bar v-if="$store.state.user?.userRights.measureSchemeEdit">
      <div :class="['button', 'fas', 'fa-plus-circle']" title="Добавить..." @click="onAddClick()" />
      <div :class="['button', 'fas', 'fa-times-circle', { disabled: !hasSelected }]" title="Удалить" @click="onRemoveClick()" />
    </tool-bar>
    <div class="table-grid" :style="{ 'grid-template-columns': `repeat(${$store.state.user?.userRights.reportFileEdit ? '3' : '2'}, max-content)` }">
      <header class="header" v-if="$store.state.user?.userRights.measureSchemeEdit">
        <input type="checkbox" v-model="all" @change="changeAll" />
      </header>
      <header class="header" />
      <header class="header">Наименование</header>
      <div v-for="(r, index) in localItems" :key="index" class="table-row">
        <span class="cell" v-if="$store.state.user?.userRights.reportFileEdit">
          <input type="checkbox" v-model="r.checked" />
        </span>
        <span class="cell icon">
          <span :class="`fas fa-tablet-alt ${r.hasOwnProperty('state') ? $store.state.env.statuses[r.state].class : ''} table-icon`" />
        </span>
        <span class="cell">{{ r.name }}</span>
      </div>
    </div>
    <pager v-bind="pageInfo" @go="onChangePage" /> 
    <transition>
      <wizard v-if="wizard" v-bind="wizard" @cancel="onWizardCancel" @end="onWizardEnd" />
    </transition>
  </div>
</template>

<script lang="ts">
import { axios } from '@/plugins/axios'
import { Equip } from '@/classes/node'
import { store } from '@/store/store'
import { defineComponent, computed, PropType, ref, watch } from 'vue'

import Pager from '../PagerComponent.vue'
import ToolBar from '../ToolBar.vue'
import Wizard from '../Wizard.vue'

const collator = new Intl.Collator(['en-US', 'ru-RU'])

function sort(a: { name: string }, b: { name: string }) {
  return collator.compare(a.name.toLowerCase(), b.name.toLowerCase())
}

const wizardAdd = (equips: Array<number>) => {
  return {
    name: 'add',
    component: {
      text: 'Выбор прибора:',
      component: 'selector',
      event: 'selectionChanged',
      data: {
        loader: async () => {
          const { data } = await axios.get<Array<{ id: number; type: number; name: string; connectionGroupType: number; state: number }>>('node/equips')
          return data
            .filter(r => !equips.includes(r.id))
            .sort(sort)
        },
        searchColumn: 'name',
        columns: [
          {
            prop: 'name',
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
      text: 'Удаление:',
      component: 'message',
      data: {
        text: 'Вы действительно хотите удалить выбранные приборы?'
      }
    }
  }
}

export default defineComponent({
  components: { Pager, ToolBar, Wizard },
  props: {
    items: {
      type: Array as PropType<Array<Equip>>,
      required: true
    }
  },
  setup(props, { emit }) {
    const all = ref(false)
    const dataItems = ref<Array<Equip>>(JSON.parse(JSON.stringify(props.items)))
    const pageInfo = ref({
      Page: 1,
      Items: 0,
      Size: store.getters.pageInfo.Size
    })
    const wizard = ref<Object>()

    const filteredItems = computed(() => {
      return dataItems.value.slice().sort(sort)
    })

    const hasSelected = computed(() => dataItems.value.some(r => r.checked === true))

    const localItems = computed(() => {
      const firstIndex = (pageInfo.value.Page - 1) * pageInfo.value.Size
      const lastIndex =
        pageInfo.value.Page * pageInfo.value.Size > filteredItems.value.length
          ? filteredItems.value.length
          : pageInfo.value.Page * pageInfo.value.Size

      return filteredItems.value.slice(firstIndex, lastIndex)
    })

    watch(
      () => filteredItems.value.length,
      value => (pageInfo.value.Items = value)
    )

    watch(
      () => props.items,
      value => {
        dataItems.value = JSON.parse(JSON.stringify(value))
      },
      { deep: true }
    )

    function changeAll() {
      dataItems.value.forEach(r => (r.checked = all.value))
    }

    function onChangePage(page: number, size: number) {
      pageInfo.value.Size = size
      pageInfo.value.Page = page
    }

    function onWizardCancel() {
      wizard.value = undefined
    }

    function onAddClick() {
      wizard.value = wizardAdd(dataItems.value.map(r => r.id))
    }

    function onRemoveClick() {
      wizard.value = wizardRemove()
    }

    function onWizardEnd(data: any, name: string) {
      wizard.value = undefined

      if (name === 'add') {
        if (emit) {
          emit('add', data)
        }
      } else if (name === 'remove') {
        if (emit) {
          emit(
            'remove',
            dataItems.value.filter(r => r.checked === true).map(r => r.id)
          )
        }
      }
    }

    return {
      all,
      changeAll,
      hasSelected,
      localItems,
      onAddClick,
      onChangePage,
      onRemoveClick,
      onWizardCancel,
      onWizardEnd,
      pageInfo,
      wizard
    }
  }
})
</script>
