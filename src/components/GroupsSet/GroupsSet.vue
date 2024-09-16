<template>
  <div class="component-detail">
    <tabs>
      
      <tabx text="points Источники">
        <preserver-component
          v-bind="{ }"
          @saveClick="save()"
        >
          <balance-group-items
            v-bind="{ items: items.filter(r => r.isSource === true) }"
            @add="onAddSourceClick"
            @remove="onRemoveSource"
          />
        </preserver-component>
        <transition>
          <wizard v-if="wizardSource" v-bind="wizardSource" @cancel="cancelWizardSource" @end="onWizardSourceEnd" />
        </transition>
      </tabx>
      <tabx text="equips Потребители">
        <preserver-component
          v-bind="{ }"
          @saveClick="save()"
        >
          <balance-group-items
            v-bind="{ items: items.filter(r => r.isSource === false) }"
            @add="onAddConsumersClick"
            @remove="onRemoveConsumers"
          />
        </preserver-component>
        <transition>
          <wizard v-if="wizardConsumers" v-bind="wizardConsumers" @cancel="cancelWizardConsumers" @end="onWizardConsumersEnd" />
        </transition>
      </tabx>
      
      
    
    </tabs>
    <transition-group>
      <wizard v-if="wizard" v-bind="wizard" @cancel="onWizardCancel" @end="onWizardEnd" key="0" />
      <spinner :show="loading" :text="'Загрузка...'" key="1" />
    </transition-group>
  </div>
</template>

<script lang="ts">
import { setupTreeComponent } from '../Base/baseComponent'

import { axios as http } from '../../plugins/axios'
import { store } from '../../store/store'
import { computed, defineComponent, PropType, ref } from 'vue'

import { matchType } from '../../plugins/api'

import { BalanceGroup as BaseBalanceGroup } from '../../classes/api/balanceGroup'

function sortByName(a: { name: string }, b: { name: string }) {
  if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
  if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
  return 0
}

function stepBalanceGroupType(id: number, items: Array<BaseBalanceGroup>) {
  const types = [
    { type: 'source', text: 'Источники' },
    { type: 'consumer', text: 'Потребители' }
  ]

  return {
    text: 'Выберите тип:',
    component: 'selector-option',
    event: 'selectionChanged',
    data: {
      options: types,
      defaultOption: types[0]
    },
    next(value: string) {
      return {
        name: 'add',
        text: `Выбор балансовой группы:`,
        component: 'selector',
        event: 'selectionChanged',
        data: {
          loader: async () => {
            const { data } = await http.get<Array<{ id: number; type: number; name: string; state: number }>>('balanceGroup/balanceGroups')
            const bgs: Array<{ id: number; type: number; name: string; originName: string; subGroup: number; state: number }> = []
            data
              .filter(r => r.id !== id)
              .forEach(r => {
                if (value === 'source' && !items.some(group => group.id === r.id)) {
                  bgs.push({ id: r.id, type: r.type, name: r.name + ' (Источники)', originName: r.name, subGroup: 1, state: r.state })
                }
                if (value === 'consumer' && !items.some(group => group.id === r.id)) {
                  bgs.push({ id: r.id, type: r.type, name: r.name + ' (Потребители)', originName: r.name, subGroup: 2, state: r.state })
                }
              })
            return bgs.sort(sortByName)
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
}

const wizardAdd = (balanceGroup: BalanceGroup) => {
  const types = ['balanceGroup', 'node', 'pointList', 'point'].map(type => Object.values(store.state.env.itemTypes).find(r => r.type === type))

  return {
    name: 'add',
    component: {
      text: 'Выберите тип объекта:',
      component: 'selector-option',
      event: 'selectionChanged',
      data: {
        options: types,
        defaultOption: types[0]
      },
      next(data: string) {
        if (data === 'balanceGroup') {
          return stepBalanceGroupType(balanceGroup.id as number, balanceGroup.balanceGroups)
        } else {
          return {
            name: 'add',
            text: `Выбор ${data === 'point' ? 'точки учета' : data === 'pointList' ? 'списка точек учета' : 'объекта учета'}:`,
            component: 'selector',
            event: 'selectionChanged',
            data: {
              loader: async () => {
                if (data === 'point') {
                  const { data } = await http.get<Array<{ id: number; name: string }>>('point/points')
                  const lists = balanceGroup.points.map(r => r.id)

                  return data.filter(r => !lists.includes(r.id)).sort(sortByName)
                } else if (data === 'pointList') {
                  const { data } = await http.get<Array<{ id: number; name: string }>>('pointList/pointLists')
                  const lists = balanceGroup.pointLists.map(r => r.id)

                  return data.filter(r => !lists.includes(r.id)).sort(sortByName)
                } else if (data === 'node') {
                  const { data } = await http.get<Array<{ id: number; name: string }>>('node/nodes')
                  const lists = balanceGroup.nodes.map(r => r.id)

                  return data.filter(r => !lists.includes(r.id)).sort(sortByName)
                }
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
    }
  }
}

import { BalanceGroup, BalanceGroupError } from '../../classes/balanceGroup'

// import BalanceGroupDetail from '../../components/BalanceGroup/BalanceGroupDetail.vue'
import BalanceGroupItems from '../../components/BalanceGroup/BalanceGroupItems.vue'
// import JournalList from '../Journal/JournalList.vue'
import PreserverComponent from '../PreserverComponent.vue'
// import ReportComponent from '../Report/ReportComponent.vue'
// import ReportFileList from '../ReportFile/ReportFileList.vue'
// import StateList from '../States/StateList.vue'
// import SystemMessages from '../SystemMessages/SystemMessages.vue'
// import Tab from '../Tabs/Tab.vue'
import Tabx from '../Tabs/Tabx.vue'
import Tabs from '../Tabs/Tabs.vue'
import Wizard from '../Wizard.vue'
import { ReportObjectTypeEnum } from '../../classes/enum/ReportObjectTypeEnum'

export default defineComponent({
  components: {
    // BalanceGroupDetail,
    BalanceGroupItems,
    // JournalList,
    PreserverComponent,
    // ReportComponent,
    // ReportFileList,
    // StateList,
    // SystemMessages,
    // Tab,
    Tabx,
    Tabs,
    Wizard
  },
  props: {
    uuid: {
      type: String as PropType<string>,
      required: true
    },
    id: {
      type: Number as PropType<number>,
      required: true
    }
  },
  setup(props) {
    const { hasChanges, loading, localError, localItem, onChanged, onWizardCancel, onWizardEnd, save, saving, wizard } = setupTreeComponent(
      props.uuid,
      props.id,
      new BalanceGroup({ uuid: props.uuid }),
      new BalanceGroupError({})
    )

    const wizardSource = ref<any>()
    const wizardConsumers = ref<any>()

    const items = computed(function () {
      return [...localItem.value.balanceGroups, ...localItem.value.nodes, ...localItem.value.points, ...localItem.value.pointLists]
    })

    const reportData = computed(function () {
      const reportTypes: { [key: string]: any } = matchType(store.state.env.reportTypes)

      return {
        ids: [props.id],
        objType: ReportObjectTypeEnum.BalanceObject,
        reportTypes:
          localItem.value.balanceGroups.some(r => r.hasArchives) ||
          localItem.value.nodes.some(r => r.hasArchives) ||
          localItem.value.points.some(r => r.hasArchives) ||
          localItem.value.pointLists.some(r => r.hasArchives)
            ? [reportTypes.balance, reportTypes.summary]
            : []
      }
    })

    function onAddSourceClick() {
      wizardSource.value = wizardAdd(localItem.value)
    }

    function onAddConsumersClick() {
      wizardConsumers.value = wizardAdd(localItem.value)
    }

    function onRemoveConsumers(items: Array<any>) {
      localItem.value.remove(items, false)
    }

    function onRemoveSource(items: Array<any>) {
      localItem.value.remove(items, true)
    }

    function cancelWizardSource() {
      wizardSource.value = undefined
    }

    function cancelWizardConsumers() {
      wizardConsumers.value = undefined
    }

    function onWizardSourceEnd(data: Array<any>, name: string) {
      wizardSource.value = undefined

      if (name === 'add') {
        localItem.value.add(data, true)
      }
    }

    function onWizardConsumersEnd(data: Array<any>, name: string) {
      wizardConsumers.value = undefined

      if (name === 'add') {
        localItem.value.add(data, false)
      }
    }

    return {
      localItem,
      DBTYPE: 'DbBalanceGroup',
      hasChanges,
      items,
      loading,
      localError,
      onAddConsumersClick,
      onAddSourceClick,
      onChanged,
      cancelWizardConsumers,
      cancelWizardSource,
      onRemoveConsumers,
      onRemoveSource,
      onWizardCancel,
      onWizardEnd,
      onWizardSourceEnd,
      onWizardConsumersEnd,
      reportData,
      save,
      saving,
      wizard,
      wizardSource,
      wizardConsumers
    }
  }
})
</script>
