<template>
  <div class="component-detail">
    <tool-bar>
      <template v-if="$store.state.user?.userRights.balanceGroupEdit">
        <div
          :class="['button', 'fas', 'fa-plus-circle']"
          title="Добавить..."
          @click="onAddClick"
        />
        <div
          :class="[
            'button',
            'fas',
            'fa-times-circle',
            { disabled: !hasSelected },
          ]"
          title="Удалить"
          @click="onRemoveClick"
        />
      </template>
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
      :style="`grid-template-columns: repeat(${
        $store.state.user?.userRights.balanceGroupEdit ? 4 : 3
      }, max-content)`"
    >
      <header class="header" />
      <header
        class="header"
        v-if="$store.state.user?.userRights.balanceGroupEdit"
      >
        <input type="checkbox" v-model="all" @change="changeAll" />
      </header>
      <header class="header">Наименование</header>
      <header class="header">Тип объекта</header>
      <div v-for="(r, index) in localItems" :key="index" class="table-row">
        <span class="cell icon">
          <div
            :class="`${r.image} ${
              $store.state.env.statuses[r.state].class
            } table-icon`"
          />
        </span>
        <span
          class="cell"
          v-if="$store.state.user?.userRights.balanceGroupEdit"
        >
          <input type="checkbox" v-model="r.checked" />
        </span>
        <span class="cell">{{ r.name }}</span>
        <span class="cell">{{ getType(r) }}</span>
      </div>
    </div>
    <pager-component v-bind="pageInfo" @go="onChangePage" />
    <transition>
      <wizard
        v-if="wizard"
        v-bind="wizard"
        @cancel="onWizardCancel"
        @end="onWizardEnd"
      />
    </transition>
  </div>
</template>

<script lang="ts">
import { store } from '@/store/store'
import { computed, defineComponent, PropType, ref, watch } from 'vue'

import { Filter, Point } from '@/classes/balanceGroup'
import { BalanceGroup } from '@/classes/api/balanceGroup'
import { Node } from '@/classes/api/node'
import { PointList } from '@/classes/api/pointList'
import { BalanceSubGroupEnum } from '@/classes/enum/BalanceSubGroupEnum'

import PagerComponent from '../PagerComponent.vue'
import ToolBar from '../ToolBar.vue'
import Wizard from '../Wizard.vue'
import { ItemTypeEnum } from '@/classes/enum/ItemTypeEnum'

const collator = new Intl.Collator(['en-US', 'ru-RU'])

function sort(a: { name: string }, b: { name: string }) {
  return collator.compare(a.name.toLowerCase(), b.name.toLowerCase())
}

export default defineComponent({
  components: {
    PagerComponent,
    ToolBar,
    Wizard,
  },
  props: {
    items: {
      type: Array as PropType<Array<BalanceGroup | Node | Point | PointList>>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const all = ref(false)
    const dataItems = ref<Array<BalanceGroup | Node | Point | PointList>>(
      props.items.map(create)
    )
    const filter = ref(new Filter({}))
    const pageInfo = ref({
      Page: 1,
      Items: 0,
      Size: store.getters.pageInfo.Size,
    })
    const wizard = ref<Object>()

    const filteredItems = computed(() => {
      let rows = dataItems.value.slice(0).sort(sort)

      const name = filter.value.name
      if (name) {
        rows = rows.filter((r) =>
          r.name.toLowerCase().includes(name.toLowerCase())
        )
      }

      const type = filter.value.type
      if (type) {
        if (type === ItemTypeEnum.BalanceGroup) {
          rows = rows.filter((r) => r instanceof BalanceGroup)
        } else if (type === ItemTypeEnum.Node) {
          rows = rows.filter((r) => r instanceof Node)
        } else if (type === ItemTypeEnum.Point) {
          rows = rows.filter((r) => r instanceof Point)
        } else if (type === ItemTypeEnum.PointList) {
          rows = rows.filter((r) => r instanceof PointList)
        }
      }

      return rows
    })

    const hasFilterChanges = computed(
      () => JSON.stringify(filter.value) !== JSON.stringify(new Filter({}))
    )

    const hasSelected = computed(() =>
      dataItems.value.some((r) => r.checked === true)
    )

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
      (value) => (pageInfo.value.Items = value)
    )

    watch(
      () => props.items,
      (value) => {
        dataItems.value = value.map(create).sort(sort)
      },
      { deep: true }
    )

    function create(r: BalanceGroup | Node | Point | PointList) {
      if (r instanceof BalanceGroup) {
        return new BalanceGroup(r)
      } else if (r instanceof Node) {
        return new Node(r)
      } else if (r instanceof Point) {
        return new Point(r)
      } else {
        return new PointList(r)
      }
    }

    function changeAll() {
      dataItems.value.forEach((r) => (r.checked = all.value))
    }

    function onChangePage(page: number, size: number) {
      pageInfo.value.Size = size
      pageInfo.value.Page = page
    }

    function onAddClick() {
      emit('add')
    }

    function onRemoveClick() {
      wizard.value = {
        name: 'remove',
        component: {
          text: 'Удаление объектов:',
          component: 'message',
          data: {
            text: 'Вы действительно хотите удалить выбранные объекты?',
          },
        },
      }
    }

    function onFilterClick() {
      wizard.value = {
        name: 'filter',
        component: {
          text: 'Фильтр:',
          component: 'balanceGroupItemsFilter',
          event: 'changed',
          data: {
            filter: filter.value,
          },
        },
      }
    }

    function onClearFilterClick() {
      filter.value = new Filter({})
    }

    function onWizardCancel() {
      wizard.value = undefined
    }

    function onWizardEnd(data: any, name: string) {
      wizard.value = undefined

      if (name === 'filter') {
        if (data !== null) {
          filter.value = data
        }
      } else if (name === 'remove') {
        emit(
          'remove',
          dataItems.value.filter((r) => r.checked === true)
        )
      }
    }

    function getType(r: BalanceGroup | Node | Point | PointList) {
      if (r instanceof BalanceGroup) {
        return `Балансовая группа${
          r.subGroup === BalanceSubGroupEnum.Sources
            ? ' (Источники)'
            : r.subGroup === BalanceSubGroupEnum.Consumers
            ? ' (Потребители)'
            : ''
        }`
      } else if (r instanceof Node) {
        return r.subGroup === BalanceSubGroupEnum.Sources
          ? 'Объект учета (Общедомовые точки учета)'
          : r.subGroup === BalanceSubGroupEnum.Consumers
          ? 'Объект учета (Квартирные точки учета)'
          : 'Объект учета'
      } else if (r instanceof Point) {
        return 'Точка учета'
      } else if (r instanceof PointList) {
        return 'Список точек учета'
      }
    }

    return {
      all,
      changeAll,
      dataItems,
      filter,
      getType,
      hasFilterChanges,
      hasSelected,
      localItems,
      onAddClick,
      onChangePage,
      onClearFilterClick,
      onFilterClick,
      onRemoveClick,
      onWizardCancel,
      onWizardEnd,
      pageInfo,
      wizard,
    }
  },
})
</script>
