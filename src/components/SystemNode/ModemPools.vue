<template>
  <div class="component-detail">
    <tool-bar v-if="$store.state.user?.userRights.modemPoolEdit">
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
        @click="onDeleteClick"
      />
    </tool-bar>
    <ul class="root">
      <li v-for="(r, index) in localItems" :key="index">
        <div
          class="row"
          :style="{
            'grid-template-columns': `repeat(${
              $store.state.user?.userRights.modemPoolEdit ? 5 : 4
            }, max-content)`,
          }"
        >
          <input
            v-if="$store.state.user?.userRights.modemPoolEdit"
            type="checkbox"
            v-model="r.checked"
          />
          <span
            :class="getImage(r)"
            title="Просмотр..."
            @click="viewClick(r)"
          />
          <span>{{ r.name }}</span>
          <span
            :class="
              isModem(r)
                ? {
                    warning: !serialPorts.some(
                      (port) => port.number === r.comPort
                    ),
                  }
                : null
            "
            >{{ isModem(r) ? portName(r.comPort) : '' }}</span
          >
          <span>{{
            isModem(r)
              ? r.comSpeeds
                ? r.comSpeeds.sort((a, b) => a - b).join('; ')
                : 'Все скорости'
              : ''
          }}</span>
        </div>
        <ul class="child" v-if="!isModem(r) && r.modems.length > 0">
          <li v-for="(modem, modemIndex) in r.modems" :key="modemIndex">
            <div
              class="row"
              :style="{
                'grid-template-columns': `repeat(${
                  $store.state.user?.userRights.modemPoolEdit ? 5 : 4
                }, max-content)`,
              }"
            >
              <input
                v-if="$store.state.user?.userRights.modemPoolEdit"
                type="checkbox"
                v-model="modem.checked"
              />
              <span
                :class="getImage(modem)"
                title="Просмотр..."
                @click="viewClick(modem)"
              />
              <span>{{ modem.name }}</span>
              <span
                :class="{
                  warning: !serialPorts.some((r) => r.number === modem.comPort),
                }"
                >{{ portName(modem.comPort) }}</span
              >
              <span>{{
                modem.comSpeeds
                  ? modem.comSpeeds.sort((a, b) => a - b).join('; ')
                  : 'Все скорости'
              }}</span>
            </div>
          </li>
        </ul>
      </li>
    </ul>
    <transition-group>
      <props-component
        v-if="component"
        v-bind="{
          uuid: component.uuid,
          image: component.image,
          text: component.caption,
        }"
        :key="0"
      >
        <component
          :is="component.name"
          v-bind="component.data"
          @changed="onChanged"
          @saved="onSaved"
        />
      </props-component>
      <wizard
        v-if="wizard"
        v-bind="wizard"
        @cancel="onWizardCancel"
        @end="onWizardEnd"
        :key="1"
      />
    </transition-group>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  inject,
  onBeforeUnmount,
  PropType,
  provide,
  reactive,
  ref,
  Ref,
  watch,
} from 'vue'

import { Modem, ModemError } from '../../classes/modem'
import { ModemPool, ModemPoolError } from '../../classes/modemPool'

import { store } from '@/store/store'

import ModemComponent from './Modem.vue'
import ModemPoolComponent from './ModemPool.vue'
import PropsComponent from '../PropsComponent.vue'
import ToolBar from '../ToolBar.vue'
import Wizard from '../Wizard.vue'
import { Port } from '@/classes/systemNode'
import { Emitter } from 'mitt'
import { SaveEvent } from '../Base/baseComponent'

interface ISortable {
  name: string
}

function sortByName(a?: ISortable, b?: ISortable) {
  return store.state.collator.compare(
    a?.name.toLowerCase(),
    b?.name.toLowerCase()
  )
}

export default defineComponent({
  components: {
    ModemComponent,
    ModemPoolComponent,
    PropsComponent,
    ToolBar,
    Wizard,
  },
  props: {
    pools: {
      type: Array as PropType<Array<ModemPool>>,
      default: () => [],
    },
    modems: {
      type: Array as PropType<Array<Modem>>,
      default: () => [],
    },
  },
  setup(props, { emit }) {
    const emitter = inject<
      Emitter<{
        save: SaveEvent
        beforeClose: { uuid: string }
      }>
    >('emitter')

    emitter?.on('beforeClose', onBeforeClose)

    onBeforeUnmount(() => {
      emitter?.off('beforeClose', onBeforeClose)
    })

    let selectedPool: ModemPool | undefined = undefined

    const serialPorts = inject<Ref<Array<Port>>>('serialPorts')

    const provider = reactive({
      modems: props.modems,
      pools: props.pools,
    })

    provide('provider', provider)

    const component = ref<{
      name: string
      uuid: string
      caption: string
      image: string
      data: any
      hasChanges?: boolean
      editable: boolean
    }>()

    const localItems = ref([
      ...provider.pools.map((r) => new ModemPool(r)).sort(sortByName),
      ...provider.modems.map((r) => new Modem(r)).sort(sortByName),
    ])

    const listItems = computed(function () {
      const items = localItems.value.slice()
      localItems.value.forEach((r) => {
        if (r instanceof ModemPool) {
          items.push(...r.modems)
        }
      })
      return items
    })

    const hasSelected = computed(function () {
      return listItems.value.some((r) => r.checked === true)
    })

    watch(
      () => props.modems,
      (value) => {
        provider.modems = value
        localItems.value = [
          ...provider.pools.map((r) => new ModemPool(r)).sort(sortByName),
          ...value.map((r) => new Modem(r)).sort(sortByName),
        ]
      },
      { deep: true }
    )

    watch(
      () => props.pools,
      (value) => {
        provider.pools = value
        localItems.value = [
          ...value.map((r) => new ModemPool(r)).sort(sortByName),
          ...provider.modems.map((r) => new Modem(r)).sort(sortByName),
        ]
      },
      { deep: true }
    )

    const wizard = ref<object | undefined>(undefined)

    const onAddClick = () => {
      const types = [
        { type: 'modem', text: 'Модем' },
        { type: 'pool', text: 'Пул модемов' },
      ]

      wizard.value = {
        name: 'add',
        component: {
          text: 'Выберите тип объекта:',
          component: 'selector-option',
          event: 'selectionChanged',
          data: {
            options: types,
            defaultOption: types[0],
          },
          next(data: string) {
            if (data === 'modem') {
              const types = [
                { type: 'none', text: 'Без пула модемов' },
                { type: 'pool', text: 'С пулом модемов' },
              ]
              return {
                text: `Создание модема:`,
                component: 'selector-option',
                data: {
                  options: types,
                  defaultOption: types[0],
                },
                event: 'selectionChanged',
                next(data: string) {
                  if (data === 'none') {
                    selectedPool = undefined

                    return {
                      text: `Создание модема:`,
                      component: 'modemProps',
                      data: {
                        modem: new Modem({}),
                        error: new ModemError({}),
                        modems: props.modems,
                      },
                      event: 'changed',
                    }
                  } else if (data === 'pool') {
                    return {
                      text: `Выбор пула модема:`,
                      component: 'selector',
                      data: {
                        loader: () => {
                          return props.pools
                        },
                        singleMode: true,
                        idColumn: 'uuid',
                        searchColumn: 'name',
                        columns: [
                          {
                            prop: 'name',
                            text: 'Наименование',
                          },
                        ],
                      },
                      event: 'selectionChanged',
                      next(data: Array<ModemPool>) {
                        selectedPool = data[0]

                        return {
                          text: `Создание модема:`,
                          component: 'modemProps',
                          data: {
                            modem: new Modem({}),
                            error: new ModemError({}),
                            modems: selectedPool.modems,
                          },
                          event: 'changed',
                        }
                      },
                    }
                  }
                },
              }
            } else {
              return {
                text: `Создание пула модемов:`,
                component: 'modemPoolProps',
                data: {
                  modemPool: new ModemPool({}),
                  error: new ModemPoolError({}),
                },
                event: 'changed',
              }
            }
          },
        },
      }
    }

    function onDeleteClick() {
      wizard.value = {
        name: 'remove',
        component: {
          text: 'Удаление:',
          component: 'message',
          data: {
            text: 'Вы действительно хотите удалить выбранные объекты?',
          },
        },
      }
    }

    function onWizardCancel(name: string) {
      wizard.value = undefined

      if (name === 'save') {
        component.value = undefined
      }
    }

    const onWizardEnd = (data: Modem | ModemPool, name: string) => {
      wizard.value = undefined

      if (name === 'add') {
        if (data instanceof Modem) {
          emit('modemAdd', data, selectedPool)
        } else if (data instanceof ModemPool) {
          emit('poolAdd', data)
        }
      } else if (name === 'save') {
        if (component.value) {
          let uuid = ''
          if (component.value.data.modem) {
            uuid = (component.value.data.modem as Modem).uuid
          } else if (component.value.data.modemPool) {
            uuid = (component.value.data.modemPool as ModemPool).uuid
          }

          emitter?.emit('save', { uuid, close: true })
        }
      } else if (name === 'remove') {
        emit(
          'remove',
          listItems.value.filter((r) => r.checked === true).map((r) => r.uuid)
        )
      }
    }

    const viewClick = (item: Modem | ModemPool) => {
      if (item instanceof Modem) {
        const pool = props.pools.find((r) =>
          r.modems.some((modem) => modem.uuid === item.uuid)
        )

        component.value = {
          name: 'modemComponent',
          uuid: item.uuid,
          caption: `Модем: ${item.name}`,
          image: item.image,
          data: { modem: item, modems: pool ? pool.modems : props.modems },
          editable: item.editable,
        }
      } else if (item instanceof ModemPool) {
        component.value = {
          name: 'modemPoolComponent',
          uuid: item.uuid,
          caption: `Пул модемов: ${item.name}`,
          image: item.image,
          data: { modemPool: item },
          editable: item.editable,
        }
      }
    }

    function onChanged() {
      if (component.value) {
        component.value.hasChanges = true
      }
    }

    function onBeforeClose(event: { uuid: string }) {
      if (
        component.value &&
        component.value.editable &&
        component.value.uuid === event.uuid &&
        component.value.hasChanges
      ) {
        wizard.value = {
          name: 'save',
          component: {
            text: 'Сохранение:',
            component: 'message',
            data: {
              text: 'Данные были изменены. Сохранить изменения?',
            },
          },
        }
      } else {
        component.value = undefined
      }
    }

    function onSaved(item: Modem | ModemPool, close: boolean) {
      if (component.value) {
        component.value.hasChanges = false
      }

      if (close) {
        component.value = undefined
      }

      emit(item instanceof Modem ? 'modemChanged' : 'poolChanged', item)
    }

    function portName(number: number) {
      const port = serialPorts?.value.find((r) => r.number === number)

      return port ? port.name : `COM${number} (н/д)`
    }

    function getImage(item: Modem | ModemPool) {
      return `${item.image} clickable-icon`
    }

    function isModem(item: Modem | ModemPool) {
      return item instanceof Modem
    }

    return {
      component,
      getImage,
      hasSelected,
      isModem,
      listItems,
      localItems,
      onAddClick,
      onChanged,
      onDeleteClick,
      onSaved,
      onWizardCancel,
      onWizardEnd,
      portName,
      serialPorts,
      viewClick,
      wizard,
    }
  },
})
</script>

<style scoped>
ul {
  list-style-type: none;
}

.root {
  margin-block: 0;
  padding-inline-start: 0;
  overflow: auto;
  flex: 1;
}

.child {
  padding-inline-start: 2em;
}

.row {
  display: grid;
  gap: 10px;
  align-items: center;
}

ul .clickable-icon {
  color: lightslategrey;
  font-size: 21px;
  transition: 0.3s;
}

ul .clickable-icon:hover {
  color: #48525c;
  transform: rotate(360deg);
}

ul input[type='checkbox']:hover {
  cursor: pointer;
}

.warning {
  color: crimson;
}
</style>
