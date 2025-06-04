<template>
  <div class="component-detail">
    <tool-bar v-if="$store.state.user?.userRights.measureSchemeGroupEdit">
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
    </tool-bar>

    <div
      class="table-grid"
      :style="{
        'grid-template-columns': `repeat(${
          $store.state.user?.userRights.measureSchemeGroupEdit ? '5' : '4'
        }, max-content)`,
      }"
    >
      <header
        class="header"
        v-if="$store.state.user?.userRights.measureSchemeGroupEdit"
      >
        <input type="checkbox" v-model="all" @change="changeAll" />
      </header>
      <header class="header">№</header>
      <header class="header" />
      <header class="header" />
      <header class="header">Точки учета</header>
      <div v-for="(r, index) in localItems" :key="index" class="table-row">
        <span
          class="cell"
          v-if="$store.state.user?.userRights.measureSchemeGroupEdit"
        >
          <input type="checkbox" v-model="r.checked" />
        </span>
        <span class="cell">{{ dataItems.indexOf(r) + 1 }}</span>
        <span class="cell icon">
          <span
            :class="`${r.image} ${
              $store.state.env.statuses[r.state].class
            } table-icon`"
          />
        </span>
        <span class="cell icon">
          <span :class="`${getSystemImage(r.systemType)} table-icon`" />
        </span>
        <span class="cell">{{ r.name }}</span>
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
import { CommonStatusEnum } from '@/classes/enum/CommonStatusEnum'
import { Point } from '@/classes/pointGroup'
import { axios } from '@/plugins/axios'
import { store } from '@/store/store'
import { defineComponent, computed, PropType, ref, watch } from 'vue'

import PagerComponent from '../PagerComponent.vue'
import ToolBar from '../ToolBar.vue'
import Wizard from '../Wizard.vue'

import { getSystemImage } from '@/classes/api/common.functions'

const collator = new Intl.Collator(['en-US', 'ru-RU'])

function sortByName(a: { name: string }, b: { name: string }) {
  return collator.compare(a.name.toLowerCase(), b.name.toLowerCase())
}

function sort(a: { number: number }, b: { number: number }) {
  return a.number - b.number
}

export default defineComponent({
  components: {
    ToolBar,
    PagerComponent,
    Wizard,
  },
  props: {
    items: {
      type: Array as PropType<Array<Point>>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const all = ref(false)
    const dataItems = ref<Array<Point>>(props.items.map((r) => new Point(r)))

    const pageInfo = ref({
      Page: 1,
      Items: 0,
      Size: store.getters.pageInfo.Size,
    })
    const wizard = ref<Object>()

    const filteredItems = computed(() => {
      return dataItems.value.slice().sort(sort)
    })

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
        dataItems.value = value.map((r) => new Point(r))
      },
      { deep: true }
    )

    function changeAll() {
      dataItems.value.forEach((r) => (r.checked = all.value))
    }

    function onChangePage(page: number, size: number) {
      pageInfo.value.Size = size
      pageInfo.value.Page = page
    }

    function onWizardCancel() {
      wizard.value = undefined
    }

    function onAddClick() {
      const items = dataItems.value.map((r) => r.id)

      wizard.value = {
        name: 'add',
        component: {
          text: 'Выбор точек учета:',
          component: 'selector',
          event: 'selectionChanged',
          data: {
            loader: async () => {
              const { data } = await axios.get<
                Array<{
                  id: number
                  type: number
                  name: string
                  state: CommonStatusEnum
                  systemType: number
                  hasArchives: boolean
                }>
              >('pointGroup/points')
              return data.filter((r) => !items.includes(r.id)).sort(sortByName)
            },
            searchColumn: 'name',
            columns: [
              {
                prop: 'name',
                text: 'Наименование',
              },
            ],
          },
        },
      }
    }

    function onRemoveClick() {
      wizard.value = {
        name: 'remove',
        component: {
          text: 'Удаление точек учета:',
          component: 'message',
          data: {
            text: 'Вы действительно хотите удалить выбранные точки учета?',
          },
        },
      }
    }

    function onWizardEnd(data: Array<Point>, name: string) {
      wizard.value = undefined

      if (name === 'add') {
        emit('add', data)
      } else if (name === 'remove') {
        emit(
          'remove',
          dataItems.value.filter((r) => r.checked === true).map((r) => r.id)
        )
      }
    }

    return {
      all,
      changeAll,
      dataItems,
      hasSelected,
      localItems,
      onAddClick,
      onChangePage,
      onRemoveClick,
      onWizardCancel,
      onWizardEnd,
      pageInfo,
      wizard,
      getSystemImage,
    }
  },
})
</script>
