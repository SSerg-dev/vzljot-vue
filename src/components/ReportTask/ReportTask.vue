<template>
  <div class="component-detail">
    <preserver-component v-bind="{ readOnly: !$store.state.user?.userRights.reportTaskEdit, saving, disabled: !hasChanges || loading, loading }" @saveClick="save()">
      <tabs>
        <tab text="Параметры">
          <task-props v-bind="{ task: localItem, error: localError }" @changed="onChanged" />
        </tab>
        <tab text="Доступ к приборам">
          <label style="display: flex; padding: 10px 0">
            <radio :label="reportTaskSourceEquip.none" v-model="localItem.sourceEquip" @update:modelValue="sourceChange">Нет</radio>
            <radio :label="reportTaskSourceEquip.all" v-model="localItem.sourceEquip" @update:modelValue="sourceChange">Ко всем</radio>
            <radio :label="reportTaskSourceEquip.selected" v-model="localItem.sourceEquip" @update:modelValue="sourceChange">Из списка</radio>
          </label>
          <tool-bar>
            <div
              :class="['button', 'fas', 'fa-plus-circle', { disabled: localItem.sourceEquip !== reportTaskSourceEquip.selected }]"
              title="Добавить..."
              @click="onAddEquipClick"
            />
            <div
              :class="[
                'button',
                'fas',
                'fa-times-circle',
                { disabled: !localEquips.some(r => r.checked) || localItem.sourceEquip !== reportTaskSourceEquip.selected }
              ]"
              title="Удалить"
              @click="onRemoveEquipClick"
            />
          </tool-bar>
          <div class="table-grid" :style="`grid-template-columns: repeat(${$store.state.user?.userRights.reportTaskEdit ? '3' : '2'}, max-content)`">
            <header class="header" v-if="$store.state.user?.userRights.reportTaskEdit">
              <input
                type="checkbox"
                v-model="allEquips"
                @change="changeAllEquips()"
                :disabled="localItem.sourceEquip !== reportTaskSourceEquip.selected"
              />
            </header>
            <header class="header"></header>
            <header class="header">Наименование</header>
            <div v-for="(r, equipIndex) in localEquips" :key="equipIndex" class="table-row">
              <span class="cell" v-if="$store.state.user?.userRights.reportTaskEdit">
                <input type="checkbox" v-model="r.checked" :disabled="localItem.sourceEquip !== reportTaskSourceEquip.selected" />
              </span>
              <span class="cell icon">
                <div :class="`${image(r)} ${r.hasOwnProperty('state') ? $store.state.env.statuses[r.state].class : ''} table-icon`" />
              </span>
              <span class="cell">{{ r.name }}</span>
            </div>
          </div>
          <pager-component v-bind="equipPageInfo" @go="onChangeEquipPage" />
          <transition>
            <wizard v-if="wizardEquip" v-bind="wizardEquip" @cancel="onWizardEquipCancel" @end="onWizardEquipEnd" />
          </transition>
        </tab>
        <tab text="Доступ к точкам учета">
          <label style="display: flex; padding: 10px 0">
            <radio :label="reportTaskSourcePoint.none" v-model="localItem.sourcePoint" @update:modelValue="sourceChange">Нет</radio>
            <radio :label="reportTaskSourcePoint.all" v-model="localItem.sourcePoint" @update:modelValue="sourceChange">Ко всем</radio>
            <radio :label="reportTaskSourcePoint.selected" v-model="localItem.sourcePoint" @update:modelValue="sourceChange">Из списка</radio>
          </label>
          <tool-bar>
            <div
              :class="['button', 'fas', 'fa-plus-circle', { disabled: localItem.sourcePoint !== reportTaskSourcePoint.selected }]"
              title="Добавить..."
              @click="onAddPointClick"
            />
            <div
              :class="[
                'button',
                'fas',
                'fa-times-circle',
                { disabled: !localPoints.some(r => r.checked) || localItem.sourcePoint !== reportTaskSourcePoint.selected }
              ]"
              title="Удалить"
              @click="onRemovePointClick"
            />
          </tool-bar>
          <div class="table-grid" :style="`grid-template-columns: repeat(${$store.state.user?.userRights.reportTaskEdit ? '3' : '2'}, max-content)`">
            <header class="header" v-if="$store.state.user?.userRights.reportTaskEdit">
              <input
                type="checkbox"
                v-model="allPoints"
                @change="changeAllPoints()"
                :disabled="localItem.sourcePoint !== reportTaskSourcePoint.selected"
              />
            </header>
            <header class="header"></header>
            <header class="header">Наименование</header>
            <div v-for="(r, pointIndex) in localPoints" :key="pointIndex" class="table-row">
              <span class="cell" v-if="$store.state.user?.userRights.reportTaskEdit">
                <input type="checkbox" v-model="r.checked" :disabled="localItem.sourcePoint !== reportTaskSourcePoint.selected" />
              </span>
              <span class="cell icon">
                <div :class="`${image(r)} ${r.hasOwnProperty('state') ? $store.state.env.statuses[r.state].class : ''} table-icon`" />
              </span>
              <span class="cell">{{ r.name }}</span>
            </div>
          </div>
          <pager-component v-bind="pointPageInfo" @go="onChangePointPage" />
          <transition>
            <wizard v-if="wizardPoint" v-bind="wizardPoint" @cancel="onWizardPointCancel" @end="onWizardPointEnd" />
          </transition>
        </tab>
        <tab text="Единицы измерения">
          <expantion-panel caption="Единицы измерения" :resizable="false" class="fit">
            <div class="measure-grid">
              <template v-for="k in sortedMeasures">
                <template v-if="$store.state.env.mUnitGroups[k].units.length > 1">
                  <label :key="k">{{ $store.state.env.mUnitGroups[k].text }}:</label>
                  <select :key="k + 1000" v-model="localItem.measures[k]" @change="onMeasureChange(k, localItem.measures[k])">
                    <option v-for="r in $store.state.env.mUnitGroups[k].units" :key="r" :value="r">{{ $store.state.env.mUnits[r].text }}</option>
                  </select>
                </template>
              </template>
            </div>
          </expantion-panel>
        </tab>
        <tab text="Рассылка">
          <div class="report-task-grid" style="padding: 5px 0">
            <check-box style="grid-column: span 2" v-model="localItem.isMailingEnabled">Разрешить отправку отчетов по Email</check-box>
            <label :disabled="!localItem.isMailingEnabled">Тема письма:</label>
            <input
              v-model.trim="localItem.mailingSubject"
              type="text"
              style="width: 300px"
              maxlength="255"
              :disabled="!localItem.isMailingEnabled"
              :class="{ 'validation-error': localError.mailingSubject }"
              :title="localError.mailingSubject"
            />
            <label :disabled="!localItem.isMailingEnabled">Формат файлов:</label>
            <select v-model="localItem.mailingFileFormat" :disabled="!localItem.isMailingEnabled">
              <option v-for="[k, v] in Object.entries($store.state.env.exportFileFormats)" :key="k" :value="parseInt(k)">{{ v.text }}</option>
            </select>
            <check-box style="grid-column: span 2" v-model="localItem.mailingAllowZip" :disabled="!localItem.isMailingEnabled"
              >Архивировать вложения в формат ZIP</check-box
            >
          </div>
          <expantion-panel caption="Получатели" :resizable="false" />
          <tool-bar>
            <div
              :class="['button', 'fas', 'fa-plus-circle', { disabled: !localItem.isMailingEnabled }]"
              title="Добавить..."
              @click="onAddUserClick"
            />
            <div
              :class="['button', 'fas', 'fa-times-circle', { disabled: !localUsers.some(r => r.checked) || !localItem.isMailingEnabled }]"
              title="Удалить"
              @click="onRemoveUserClick"
            />
          </tool-bar>
          <div class="table-grid" :style="`grid-template-columns: repeat(${$store.state.user?.userRights.reportTaskEdit ? '3' : '2'}, max-content)`">
            <header class="header" v-if="$store.state.user?.userRights.reportTaskEdit">
              <input type="checkbox" v-model="allUsers" @change="changeAllUsers()" :disabled="!localItem.isMailingEnabled" />
            </header>
            <header class="header"></header>
            <header class="header">Наименование</header>
            <div v-for="(r, userIndex) in localUsers" :key="userIndex" class="table-row">
              <span class="cell" v-if="$store.state.user?.userRights.reportTaskEdit">
                <input type="checkbox" v-model="r.checked" :disabled="!localItem.isMailingEnabled" />
              </span>
              <span class="cell icon">
                <div :class="`${image(r)} table-icon`" />
              </span>
              <span class="cell">{{ r.name }}</span>
            </div>
          </div>
          <pager-component v-bind="userPageInfo" @go="onChangeUserPage" />
          <transition>
            <wizard v-if="wizardUser" v-bind="wizardUser" @cancel="onWizardUserCancel" @end="onWizardUserEnd" />
          </transition>
        </tab>
      </tabs>
    </preserver-component>
    <transition-group>
      <wizard v-if="wizard" v-bind="wizard" @cancel="onWizardCancel" @end="onWizardEnd" key="0" />
      <spinner :show="loading" :text="'Загрузка...'" key="1" />
    </transition-group>
  </div>
</template>

<script lang="ts">
import { axios as http } from '@/plugins/axios'
import { computed, defineComponent, PropType, ref, watch } from 'vue'

const sortByName = (a: { name: string }, b: { name: string }) => {
  if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
  if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
  return 0
}

import { store } from '@/store/store'
import { getImage, matchType } from '../../plugins/api.js'

import { ReportTask, ReportTaskError } from '../../classes/reportTask'

import PreserverComponent from '../PreserverComponent.vue'
import Radio from '../Inputs/Radio.vue'
import Tabs from '../Tabs/Tabs.vue'
import Tab from '../Tabs/Tab.vue'
import ToolBar from '../ToolBar.vue'
import PagerComponent from '../PagerComponent.vue'
import Wizard from '../Wizard.vue'
import TaskProps from './ReportTaskProps.vue'
import CheckBox from '../Inputs/CheckBox.vue'
import ExpantionPanel from '../ExpantionPanel.vue'
import { setupComponent } from '../Base/baseComponent'

export default defineComponent({
  components: {
    PreserverComponent,
    Radio,
    Tabs,
    Tab,
    ToolBar,
    PagerComponent,
    Wizard,
    TaskProps,
    CheckBox,
    ExpantionPanel
  },
  props: {
    id: {
      type: Number as PropType<number>,
      required: true
    },
    uuid: {
      type: String as PropType<string>,
      required: true
    }
  },
  setup(props, { emit }) {
    const { hasChanges, loading, localItem, localError, onWizardCancel, onWizardEnd, save, saving, wizard } = setupComponent<
      ReportTask,
      ReportTaskError
    >(new ReportTask({ id: props.id, uuid: props.uuid }), new ReportTaskError({}), emit)

    const allEquips = ref(false)
    const allPoints = ref(false)
    const allUsers = ref(false)
    const equipPageInfo = ref(store.getters.pageInfo)
    const pointPageInfo = ref(store.getters.pageInfo)
    const userPageInfo = ref(store.getters.pageInfo)
    const wizardEquip = ref<any>()
    const wizardPoint = ref<any>()
    const wizardUser = ref<any>()

    const reportTaskSourceEquip = computed(() => matchType(store.state.env.reportTaskSourceEquip))
    const reportTaskSourcePoint = computed(() => matchType(store.state.env.reportTaskSourcePoint))
    const filteredLocalEquips = computed(() => localItem.value.equips.concat(localItem.value.equipLists).sort(sortByName))
    const filteredLocalPoints = computed(() => localItem.value.points.concat(localItem.value.pointLists).sort(sortByName))
    const filteredLocalUsers = computed(() => localItem.value.users.slice(0).sort(sortByName))
    const sortedMeasures = computed(() =>
      Object.keys(localItem.value.measures).sort((a, b) => store.state.env.mUnitGroups[a].text.localeCompare(store.state.env.mUnitGroups[b].text))
    )

    const localEquips = computed(() => {
      const firstIndex = (equipPageInfo.value.Page - 1) * equipPageInfo.value.Size
      const lastIndex =
        equipPageInfo.value.Page * equipPageInfo.value.Size > filteredLocalEquips.value.length
          ? filteredLocalEquips.value.length
          : equipPageInfo.value.Page * equipPageInfo.value.Size

      return filteredLocalEquips.value.slice(firstIndex, lastIndex)
    })

    const localPoints = computed(() => {
      const firstIndex = (pointPageInfo.value.Page - 1) * pointPageInfo.value.Size
      const lastIndex =
        pointPageInfo.value.Page * pointPageInfo.value.Size > filteredLocalPoints.value.length
          ? filteredLocalPoints.value.length
          : pointPageInfo.value.Page * pointPageInfo.value.Size

      return filteredLocalPoints.value.slice(firstIndex, lastIndex)
    })

    const localUsers = computed(() => {
      const firstIndex = (userPageInfo.value.Page - 1) * userPageInfo.value.Size
      const lastIndex =
        userPageInfo.value.Page * userPageInfo.value.Size > filteredLocalUsers.value.length
          ? filteredLocalUsers.value.length
          : userPageInfo.value.Page * userPageInfo.value.Size

      return filteredLocalUsers.value.slice(firstIndex, lastIndex)
    })

    watch(
      () => filteredLocalEquips.value.length,
      value => (equipPageInfo.value.Items = value)
    )

    watch(
      () => filteredLocalPoints.value.length,
      value => (pointPageInfo.value.Items = value)
    )

    watch(
      () => filteredLocalUsers.value.length,
      value => (userPageInfo.value.Items = value)
    )

    function image(item: any): string {
      return getImage(item)
    }

    function onChanged(key: keyof ReportTask, value: ReportTask[keyof ReportTask]) {
      (localItem.value[key] as ReportTask[keyof ReportTask]) = value

      if (key === 'archiveType') {
        localItem.value.updateMeasures()
      }
    }

    function onMeasureChange(group: string, unit: number) {
      localItem.value.measures[group] = unit
    }

    function onChangeEquipPage(page: number, size: number) {
      equipPageInfo.value.Page = page
      equipPageInfo.value.Size = size
    }

    function onChangePointPage(page: number, size: number) {
      pointPageInfo.value.Page = page
      pointPageInfo.value.Size = size
    }

    function onChangeUserPage(page: number, size: number) {
      userPageInfo.value.Page = page
      userPageInfo.value.Size = size
    }

    function sourceChange() {
      localItem.value.updateMeasures()
      hasChanges.value = true
    }

    function changeAllEquips() {
      localItem.value.equips.forEach(r => (r.checked = allEquips.value))
      localItem.value.equipLists.forEach(r => (r.checked = allEquips.value))
    }

    function changeAllPoints() {
      localItem.value.points.forEach(r => (r.checked = allPoints.value))
      localItem.value.pointLists.forEach(r => (r.checked = allPoints.value))
    }

    function changeAllUsers() {
      localUsers.value.forEach(r => (r.checked = allUsers.value))
    }

    function onAddEquipClick() {
      const getType = (type: string) => Object.values(store.state.env.itemTypes).find(r => r.type === type)
      const types = ['equip', 'equipList'].map(r => getType(r))
      const equips = localItem.value.equips.map(r => r.id)
      const equipLists = localItem.value.equipLists.map(r => r.id)

      wizardEquip.value = {
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
            return {
              name: 'add',
              text: `Выбор ${data === 'equip' ? 'прибора' : 'списка приборов'}:`,
              component: 'selector',
              event: 'selectionChanged',
              data: {
                loader: async () => {
                  if (data === 'equip') {
                    const { data } = await http.get<Array<{ id: number; type: number; name: string; connectionGroupType: number; state: number }>>(
                      'reportTask/equips'
                    )
                    return data.filter(r => !equips.includes(r.id)).sort(sortByName)
                  } else {
                    const { data } = await http.get<Array<{ id: number; type: number; name: string; state: number }>>('reportTask/equipLists')
                    return data.filter(r => !equipLists.includes(r.id)).sort(sortByName)
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

    function onRemoveEquipClick() {
      wizardEquip.value = {
        name: 'remove',
        component: {
          text: 'Удаление приборов:',
          component: 'message',
          data: {
            text: 'Вы действительно хотите удалить выбранные объекты?'
          }
        }
      }
    }

    function onWizardEquipEnd(data: Array<any>, name: string) {
      wizardEquip.value = null

      if (name === 'remove') {
        localItem.value.equips = localItem.value.equips.filter(r => !r.checked)
        localItem.value.equipLists = localItem.value.equipLists.filter(r => !r.checked)
        localItem.value.updateMeasures()
        hasChanges.value = true
      } else if (name === 'add') {
        data.forEach(r => (r.checked = false))
        localItem.value.equips = localItem.value.equips.concat(data.filter(r => store.state.env.itemTypes[r.type].type === 'equip'))
        localItem.value.equipLists = localItem.value.equipLists.concat(data.filter(r => store.state.env.itemTypes[r.type].type === 'equipList'))
        localItem.value.updateMeasures()
        hasChanges.value = true
      }
    }

    function onWizardEquipCancel() {
      wizardEquip.value = null
    }

    function onAddPointClick() {
      const getType = (type: string) => Object.values(store.state.env.itemTypes).find(r => r.type === type)
      const types = ['point', 'pointList'].map(r => getType(r))
      const points = localItem.value.points.map(r => r.id)
      const pointLists = localItem.value.pointLists.map(r => r.id)

      wizardPoint.value = {
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
            return {
              name: 'add',
              text: `Выбор ${data === 'point' ? 'точки учета' : 'списка точек учета'}:`,
              component: 'selector',
              event: 'selectionChanged',
              data: {
                loader: async () => {
                  if (data === 'point') {
                    let { data } = await http.get<Array<{ id: number; type: number; name: string; systemType: number; state: number }>>(
                      'reportTask/points'
                    )
                    return data.filter(r => !points.includes(r.id)).sort(sortByName)
                  } else if (data === 'pointList') {
                    let { data } = await http.get<Array<{ id: number; type: number; name: string; state: number }>>('reportTask/pointLists')
                    return data.filter(r => !pointLists.includes(r.id)).sort(sortByName)
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

    function onRemovePointClick() {
      wizardPoint.value = {
        name: 'remove',
        component: {
          text: 'Удаление точек учета:',
          component: 'message',
          data: {
            text: 'Вы действительно хотите удалить выбранные объекты?'
          }
        }
      }
    }

    function onWizardPointEnd(data: Array<any>, name: string) {
      wizardPoint.value = null

      if (name === 'remove') {
        localItem.value.points = localItem.value.points.filter(r => !r.checked)
        localItem.value.pointLists = localItem.value.pointLists.filter(r => !r.checked)
        localItem.value.updateMeasures()
        hasChanges.value = true
      } else if (name === 'add') {
        data.forEach(r => (r.checked = false))
        localItem.value.points = localItem.value.points.concat(data.filter(r => store.state.env.itemTypes[r.type].type === 'point'))
        localItem.value.pointLists = localItem.value.pointLists.concat(data.filter(r => store.state.env.itemTypes[r.type].type === 'pointList'))
        localItem.value.updateMeasures()
        hasChanges.value = true
      }
    }

    function onWizardPointCancel() {
      wizardPoint.value = null
    }

    function onAddUserClick() {
      const users = localItem.value.users.map(r => r.id)
      wizardUser.value = {
        name: 'add',
        component: {
          text: `Выбор пользователей:`,
          component: 'selector',
          event: 'selectionChanged',
          data: {
            loader: async () => {
              const { data } = await http.get<Array<{ id: number; type: number; name: string; desc: string }>>('reportTask/users')
              return data.filter(r => !users.includes(r.id)).sort(sortByName)
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

    function onRemoveUserClick() {
      wizardUser.value = {
        name: 'remove',
        component: {
          text: 'Удаление пользователей:',
          component: 'message',
          data: {
            text: 'Вы действительно хотите удалить выбранных пользователей?'
          }
        }
      }
    }

    function onWizardUserEnd(data: Array<any>, name: string) {
      wizardUser.value = null

      if (name === 'remove') {
        localItem.value.users = localItem.value.users.filter(r => !r.checked)
        hasChanges.value = true
      } else if (name === 'add') {
        data.forEach(r => (r.checked = false))
        localItem.value.users = localItem.value.users.concat(data)
        hasChanges.value = true
      }
    }

    function onWizardUserCancel() {
      wizardUser.value = null
    }

    equipPageInfo.value.Items = filteredLocalEquips.value.length
    pointPageInfo.value.Items = filteredLocalPoints.value.length
    userPageInfo.value.Items = filteredLocalUsers.value.length

    return {
      allEquips,
      allPoints,
      allUsers,
      changeAllEquips,
      changeAllPoints,
      changeAllUsers,
      equipPageInfo,
      image,
      hasChanges,
      loading,
      localEquips,
      localError,
      localItem,
      localPoints,
      localUsers,
      onAddEquipClick,
      onAddPointClick,
      onAddUserClick,
      onChanged,
      onChangeEquipPage,
      onChangePointPage,
      onChangeUserPage,
      onMeasureChange,
      onRemoveEquipClick,
      onRemovePointClick,
      onRemoveUserClick,
      onWizardEnd,
      onWizardCancel,
      onWizardEquipCancel,
      onWizardEquipEnd,
      onWizardPointCancel,
      onWizardPointEnd,
      onWizardUserCancel,
      onWizardUserEnd,
      pointPageInfo,
      reportTaskSourceEquip,
      reportTaskSourcePoint,
      saving,
      save,
      sortedMeasures,
      sourceChange,
      userPageInfo,
      wizard,
      wizardEquip,
      wizardPoint,
      wizardUser
    }
  }
})
</script>

<style scoped>
.report-task-grid {
  display: grid;
  grid-gap: 5px 3px;
  grid-template-columns: auto 1fr;
  width: fit-content;
}

.report-task-grid > label {
  text-align: right;
}

.report-task-grid > div {
  text-align: right;
}

.report-task-grid > select {
  width: -moz-fit-content;
  width: fit-content;
}

.radio-wrapper {
  padding: 0 20px;
}

.measure-grid {
  display: grid;
  grid-gap: 5px 3px;
  grid-template-columns: max-content max-content;
  width: fit-content;
}

.measure-grid label {
  justify-self: end;
}

.measure-grid select {
  width: 120px;
}
</style>
