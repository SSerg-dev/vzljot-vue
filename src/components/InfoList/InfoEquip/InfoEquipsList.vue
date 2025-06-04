<template>
  <div class="component-detail">
    <tool-bar>
      <template v-if="$store.state?.user.userRights.equipList">
        <div
          :class="['button', 'fas', 'fa-plus-circle', { disabled: polling }]"
          title="InfoEquipList Добавить..."
          @click="onAddClick()"
        />
        <div
          :class="[
            'button',
            'fas',
            'fa-times-circle',
            { disabled: !hasSelected || polling },
          ]"
          title="InfoEquipList Удалить"
          @click="onRemoveClick()"
        />
      </template>
      <template v-slot:end>
        <div
          :class="[
            'button',
            'fas',
            'fa-filter',
            'remove-sign',
            {
              disabled: !hasFilterChanges,
              right: !$store.state.user?.userRights.pollDataManual,
            },
          ]"
          title="Очистить фильтр"
          @click="onClearFilterClick()"
        />
        <div
          :class="['button', 'fas', 'fa-filter']"
          title="Фильтр..."
          @click="onFilterClick()"
        />
      </template>
    </tool-bar>
    <div
      class="table-grid"
      :style="`grid-template-columns: repeat(${columnsCount}, max-content)`"
    >
      <!-- ///////////////////////////////////////// -->
      <header
        class="header sticky-first column"
        :style="`grid-template-columns: repeat(${
          firstColumnsCount - 1
        }, min-content)`"
      >
        <span
          v-if="$store.state.user?.userRights.pollData"
          class="table-icon fas fa-cog"
          style="color: #596673"
        />
        <input
          v-if="$store.state.user?.userRights.equipList"
          type="checkbox"
          v-model="all"
          @change="changeAll"
          :disabled="polling"
        />
        Списки приборов
      </header>
      <!-- ///////////////////////////////////////// -->
      <header class="header" v-for="r in customColumns" :key="r">
        {{ r }}
      </header>
      <!-- ///////////////////////////////////////// -->

      <div v-for="(r, index) in localItems" :key="index" class="table-row">
        <span
          class="cell sticky-first column"
          :style="`grid-template-columns: repeat(${firstColumnsCount}, min-content)`"
        >
          <span
            v-if="$store.state.user?.userRights.pollData"
            :class="r.task?.class"
            :style="{ color: r.task?.style.color }"
            :title="r.task?.text"
          />
          <input
            v-if="
              $store.state.user?.userRights.equipList ||
              $store.state.user?.userRights.pollData
            "
            type="checkbox"
            v-model="r.checked"
            :disabled="polling"
          />
          <span
            :class="`fas fa-tablet-alt ${
              $store.state.env.statuses[r.state].class
            } table-icon`"
          />{{ r.name }}
        </span>
        <span class="cell">
          <a
            v-for="node in r.nodes"
            :key="node.id"
            @click="loadNode(node.id)"
            href="#"
            :title="node.fullName"
            >{{ node.name }};
          </a>
        </span>
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
let abortController = new AbortController()

const collator = new Intl.Collator(['en-US', 'ru-RU'])

function sort(a: { name: string }, b: { name: string }) {
  return collator.compare(a.name.toLowerCase(), b.name.toLowerCase())
}

import { axios } from '@/plugins/axios'
import { store } from '@/store/store'
import {
  computed,
  defineComponent,
  inject,
  onBeforeUnmount,
  PropType,
  ref,
  watch,
} from 'vue'

import {
  // ColumnTypeEnum,
  Equip,
  Filter,
  PollMessage,
  SiMessage,
} from '@/classes/equipList'
import PagerComponent from '@/components/PagerComponent.vue'
import ToolBar from '@/components/ToolBar.vue'
import Wizard from '@/components/Wizard.vue'
import { wizardSettings } from '@/plugins/wizardComponents/wizardSettings'

import { SchemeSystemTypeEnum } from '@/classes/enum/SchemeSystemTypeEnum'
import { Emitter } from 'mitt'

export default defineComponent({
  components: {
    PagerComponent,
    ToolBar,
    Wizard,
  },
  props: {
    items: {
      type: Array as PropType<Array<Equip>>,
      default: () => [],
      required: false,
    },
    settings: {
      type: Object,
      default: () => {},
      required: false,
    },
  },
  setup(props, { emit }) {
    const all = ref(false)
    const dataItems = ref(props.items.map((r) => new Equip(r)).sort(sort))
    const filter = ref(new Filter({}))
    const localSettings = ref(props.settings)
    const pageInfo = ref({
      Page: 1,
      Items: 0,
      Size: store.getters.pageInfo.Size,
    })
    const polling = ref(false)
    const wizard = ref()

    const emitter = inject<
      Emitter<{
        message: PollMessage
        si: SiMessage
      }>
    >('emitter')

    emitter?.on('message', processMessage)
    emitter?.on('si', onSi)

    onBeforeUnmount(() => {
      abort()

      emitter?.off('message', processMessage)
      emitter?.off('si', onSi)
    })

    const columnsCount = computed(() => {
      return 13 + customColumns.value.length
    })

    const customColumns = computed(() => {
      if (dataItems.value.length > 0) {
        return dataItems.value[0].custom.map((r) => r.name)
      } else {
        return []
      }
    })

    const filteredItems = computed(() => {
      let rows = dataItems.value.slice()

      rows = rows.filter((r) => r.visible)

      if (filter.value.state !== undefined) {
        rows = rows.filter((r) => r.state === filter.value.state)
      }

      const name = filter.value.equip
      if (name) {
        rows = rows.filter(
          (r) => r.name.toLowerCase().indexOf(name.toLowerCase()) >= 0
        )
      }

      const nodeName = filter.value.equip
      if (nodeName) {
        rows = rows.filter((r) =>
          r.nodes.some(
            (node) =>
              node.name.toLowerCase().indexOf(nodeName.toLowerCase()) >= 0
          )
        )
      }

      return rows
    })

    const firstColumnsCount = computed(() => {
      let count = 4

      if (!store.state.user?.userRights.equipList) {
        count--
      }

      if (!store.state.user?.userRights.pollData) {
        count--
      }

      return count
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
        dataItems.value = value.map((r) => new Equip(r)).sort(sort)
      },
      { deep: true }
    )

    watch(
      () => props.settings,
      (value) => (localSettings.value = JSON.parse(JSON.stringify(value)))
    )

    function abort() {
      abortController.abort()
    }

    function changeAll() {
      dataItems.value.forEach((r) => (r.checked = all.value))
    }

    function loadNode(id: number) {
      window.open(`${window.props.baseUrl}Node/NodeDetailAlone/${id}`, '_blank')
    }

    function loadPoint(id: number) {
      window.open(
        `${window.props.baseUrl}Point/PointDetailAlone/${id}`,
        '_blank'
      )
    }

    function onChangePage(page: number, size: number) {
      pageInfo.value.Size = size
      pageInfo.value.Page = page
    }

    function onClearFilterClick() {
      filter.value = new Filter({})
    }

    function onFilterClick() {
      const set = new Set<SchemeSystemTypeEnum>()

      dataItems.value
        .filter((r) => r.points.length > 0)
        .map((r) => r.points)
        .forEach((r) => {
          r.forEach((p) => set.add(p.systemType))
        })

      wizard.value = {
        name: 'filter',
        component: {
          text: 'Фильтр:',
          component: 'equipListFilter',
          event: 'changed',
          data: {
            filter: filter.value,
            types: [...set],
          },
        },
      }
    }

    function onAddClick() {
      wizard.value = {
        name: 'add',
        component: {
          text: 'Выбор приборов:',
          component: 'selector',
          event: 'selectionChanged',
          data: {
            loader: async () => {
              const equips = dataItems.value.map((r) => r.equipId)
              const { data } = await axios.get<
                Array<{
                  id: number
                  type: number
                  name: string
                  connectionGroupType: number
                  state: number
                }>
              >('equipList/equips')
              return data.filter((r) => !equips.includes(r.id)).sort(sort)
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
          text: 'Удаление:',
          component: 'message',
          data: {
            text: 'Вы действительно хотите удалить выбранные приборы?',
          },
        },
      }
    }

    function onSettingsClick() {
      wizard.value = wizardSettings(localSettings.value)
    }

    function processMessage(message: PollMessage) {
      if (message.data.action === 'pollEquipList') {
        if (message.data.state === 'stopped' && message.data.equipIds) {
          message.data.equipIds.forEach((id) => {
            const row = dataItems.value.find((r) => r.equipId === id)
            if (row) {
              row.task?.stop(message.data.text)
            }
          })
        } else {
          const equip = message.data.equip
          if (equip) {
            const row = dataItems.value.find((r) => r.equipId === equip.id)
            if (row && row.task) {
              if (message.data.state === 'success') {
                // row.archiveHourTime = equip.archiveHourTime
                //   ? new Date(equip.archiveHourTime)
                //   : undefined
                // row.archiveDayTime = equip.archiveDayTime
                //   ? new Date(equip.archiveDayTime)
                //   : undefined
                // row.archiveMonthTime = equip.archiveMonthTime
                //   ? new Date(equip.archiveMonthTime)
                //   : undefined

                // row.pollCurrentTime = equip.pollCurrentTime
                //   ? new Date(equip.pollCurrentTime)
                //   : undefined

                // row.pollSource = equip.pollSource ? equip.pollSource : 0

                row.task.success(message.data.text)
              } else if (message.data.state === 'error') {
                row.task.error(message.data.text)
              } else if (message.data.state === 'warning') {
                row.task.warning(message.data.text)
              }
            }
          }
        }
      }
    }

    async function poll() {
      dataItems.value.filter((r) => r.checked).forEach((r) => r.task?.poll())
      polling.value = true

      try {
        abortController = new AbortController()

        const settings = JSON.parse(JSON.stringify(localSettings.value))

        settings.timeFrom = new Date(settings.timeFrom).getTime()
        settings.timeTo = new Date(settings.timeTo).getTime()

        await axios.post(
          'equipList/poll',
          {
            ids: dataItems.value.filter((r) => r.checked).map((r) => r.equipId),
            settings,
          },
          { signal: abortController.signal }
        )
      } catch (error: any) {
        dataItems.value.forEach((r) => r.task?.stop(error))
        if (!abortController.signal.aborted) {
          store.commit('error', error)
        }
      } finally {
        polling.value = false
      }
    }

    function onSi(message: SiMessage) {
      if (
        message &&
        message.event === 'update' &&
        store.state.env.itemTypes[message.type].type === 'equip'
      ) {
        dataItems.value
          .filter((r) => r.equipId === message.item.id)
          .forEach((r) => (r.state = message.item.state))
      }
    }

    function onWizardCancel() {
      wizard.value = null
    }

    function onWizardEnd(data: any, name: string) {
      wizard.value = null

      if (name === 'filter') {
        if (data !== null) {
          filter.value = data
        }
      } else if (name === 'settings') {
        if (data !== null) {
          localSettings.value = data
        }
      } else if (name === 'add') {
        emit(
          'add',
          data.map((r: { id: number }) => r.id)
        )
      } else if (name === 'remove') {
        emit(
          'remove',
          dataItems.value
            .filter((r) => r.checked === true)
            .map((r) => r.equipId)
        )
      }
    }

    return {
      abort,
      all,
      changeAll,
      columnsCount,
      customColumns,
      dataItems,
      filter,
      firstColumnsCount,
      hasFilterChanges,
      hasSelected,
      loadNode,
      loadPoint,
      localItems,
      localSettings,
      onAddClick,
      onChangePage,
      onClearFilterClick,
      onFilterClick,
      onRemoveClick,
      onSettingsClick,
      onWizardCancel,
      onWizardEnd,
      pageInfo,
      poll,
      polling,
      wizard,
    }
  },
})
</script>

<style scoped>
.column {
  display: grid;
  gap: 6px;
}
</style>
