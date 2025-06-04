<template>
  <div class="component-detail">
    <tool-bar v-if="$store.state.user?.userRights.equipEdit">
      <div
        :class="['button', 'fas', 'fa-plus-circle', { disabled: false }]"
        title="Добавить..."
        @click="onAddClick()"
      />
      <div
        :class="[
          'button',
          'fas',
          'fa-times-circle',
          { disabled: !hasSelected || hasRemoved },
        ]"
        title="Удалить"
        @click="onRemoveClick()"
      />
    </tool-bar>

    <div
      class="table-grid"
      :style="{ 'grid-template-columns': `repeat(2, 38px) 240px` }"
    >
      <header class="header"></header>
      <header class="header"></header>
      <header class="header header-date">Наименование</header>

      <div
        v-show="localItems[0]?.name"
        v-for="(r, i) in localItems.sort(
          (a, b) => new Date(a.timeStart) - new Date(b.timeStart)
        )"
        :key="i"
        class="table-row"
        :ref="(el) => (rowsElement[r.id] = el)"
      >
        <span class="cell icon">
          <div
            :class="`fas fa-tasks-alt clickable-icon`"
            @click="viewClick(r, i)"
            title="Просмотр..."
          />
        </span>

        <span class="cell box">
          <check-box
            type="checkbox"
            v-model="r.checked"
            :disabled="false"
            @update:modelValue="handleCheckBox(i, $event)"
          >
          </check-box>
        </span>

        <span class="cell caption">{{ `${r.name}` }}</span>
      </div>
    </div>

    <pager-component v-bind="pageInfo" @go="onChangePage" />

    <transition-group>
      <wizard-message
        v-if="wizard"
        v-bind="wizard"
        @cancel="cancelWizard"
        @end="onWizardEnd"
      />
      <props-component v-if="edit" v-bind="componentData" @close="close">
        <component
          :is="componentData.component"
          v-bind="componentData.data"
          @saved="onSaved"
        />
      </props-component>
    </transition-group>
  </div>
</template>

<script>
import { asyncImport } from '@/plugins/api.js'
import { Set as _Set } from '@/classes/set'
import EquipSetting from '@/classes/equipSetting'

import ListComponent from '@/components/ListComponent.vue'
import PagerComponent from '@/components/PagerComponent.vue'
import PropsComponent from '@/components/PropsComponent.vue'

import ToolBar from '@/components/ToolBar.vue'

import WizardMessage from '@/plugins/wizardComponents/wizardConfirm/WizardMessage.vue'
import { wizardMessage } from '@/plugins/wizardComponents/wizardConfirm/wizardMessage'

import DatePicker from '@/components/Inputs/DatePicker.vue'
import CheckBox from '@/components/Inputs/CheckBox.vue'

import { mapGetters } from 'vuex'

export default {
  name: 'SetParamsEquipDetailSetting',
  components: {
    PagerComponent,
    SetComponent: asyncImport(() =>
      import('@/components/Set/SetParamsEquipDetailSettingView.vue')
    ),
    SetComponentNew: asyncImport(() =>
      import('@/components/Set/SetParamsEquipDetailSettingNew.vue')
    ),

    PropsComponent,
    ToolBar,
    WizardMessage,
    DatePicker,
    CheckBox,
  },
  extends: ListComponent,

  data() {
    return {
      wait: false,
      componentData: {
        component: null,
        text: null,
        data: null,
      },
      edit: false,
      equipTypeId: null,
      equipType: null,
      wizard: null,

      pageInfo: JSON.parse(JSON.stringify(this.$store.getters.pageInfo)),
      busy: false,
      rowsElement: {},

      dateFormat: 'DD.MM.YYYY',
      currentDate: new Date(),

      localTimeStart: null,
      localProperties: null,

      action: null,
      equipSetting: new EquipSetting({}),
      remove: new Set(),

      localItemNames: [],

      removed: false,
      localRemoved: false,

      activity: 'none',
    }
  },
  created() {
    this.$emitter.on('props-component:close', this.load)
    this.$store.state.equip.equipEvent.hasConfirmSave = false

    this.$emitter.on('componentBeforeUnmount', this.onComponentBeforeUnmount)

    this.$watch(
      '$store.state.equip.equipEvent.hasConfirmSave',
      (value) => {
        if (value) {
          this.removeLocal()
          this.$store.state.equip.equipEvent.hasConfirmSave = false
        }
      },
      { deep: true }
    )

    this.$watch(
      'localItems',
      (value) => {
        if (value) {
          this.localItems[0]?.name === ''
            ? (this.$store.state.equip.equipEvent.hasEmptyDateSet = true)
            : (this.$store.state.equip.equipEvent.hasEmptyDateSet = false)
        }
      },
      { deep: true }
    )

    this.currentDate = this.getCurrentDate()
    this.load()
  },
  mounted() {
    this.$store.state.equip.equipTopNav.hasSetting = true
  },

  computed: {
    ...mapGetters({
      getEquip: 'getEquip',
      getCard: 'getCard',
    }),
    removeIds() {
      return [...this.remove]
    },
    hasSelected() {
      return this.removeIds.length > 0 ? true : false
    },
    hasRemoved() {
      return this.localRemoved
    },
  },
  beforeUnmount() {
    this.$emitter.off('props-component:close', this.load)
    this.$emitter.off('componentBeforeUnmount', this.onComponentBeforeUnmount)

    this.$store.state.equip.equipEvent.hasEmptyDateSet = false
    this.$store.state.equip.equipTopNav.hasSetting = false
  },
  methods: {
    async update() {
      try {
        this.wait = true
        this.remove.clear()
        const { data } = await this.$http.get('equip/equipSettings', {
          params: { equipId: this.getCard.selectedNodeId },
        })

        this.dataItems = data.data.values.map((r) => {
          return Object.assign(r, {
            checked: r.properties === 1 ? true : false,
          })
        })

        this.localItems.forEach((item) => {
          if (item.checked) {
            item.checked = false
          }
        })
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.wait = false
      }
    },

    onComponentBeforeUnmount() {
      this.update()
    },
    handleCheckBox(index, event) {
      this.removed = event

      const id = this.localItems[index].id

      if (this.remove.has(id)) {
        this.remove.delete(id)
      } else {
        if (event) {
          this.remove.add(id)
        } else {
          this.remove.delete(id)
        }
      }
    },
    setEquipSettingTable(i, timeStart, properties) {
      const equipSettingTable = {
        id: this.dataItems[i]?.id ?? 0,
        equipId: this.$store.state.equip.id,
        timeStart,
        properties,
        action: this.action,
      }

      const options = {
        equipSettingIndex: i,
        equipSetting: this.dataItems,
        equipSettingTable,
      }

      this.$store.commit('setEquip', options)
    },

    async viewClick(r, i) {
      await this.load()

      this.localTimeStart = this.localItems[i]?.timeStart ?? new Date()
      this.localProperties = this.localItems[i]?.properties ?? 0

      const options = {
        hasEquipSettingEdit: true,
      }
      this.$store.commit('setEquip', options)

      this.setEquipSettingTable(i, this.localTimeStart, this.localProperties)

      const obj = new _Set(r)

      this.componentData = {
        component: 'set-component',
        uuid: null, // obj.uuid,
        image: obj.image,
        text: `Настройки: ${r.name}`,
        data: {
          uuid: obj.uuid,
          id: r.id,
          purposeGroup: r.setType,
          equipId: this.id,
          equipTypeId: this.equipTypeId,
        },
      }
      this.edit = true
    },
    async onAddClick() {
      this.action = this.localItems[0].name ? 'add' : 'create'

      if (this.action === 'add' || this.action === 'create') {
        this.localItemNames = this.localItems.map((item) => item.name)
      }

      this.localTimeStart = new Date()
      this.localProperties = 0
      this.localTimeStart.setMinutes(0, 0, 0)

      this.setEquipSettingTable(0, this.localTimeStart, this.localProperties)

      const detailArray = this.localItems[0].detailArray.map((item) => {
        if (item.value !== '') {
          item.value = ''
        }
        return item
      })

      this.localItems[0].timeStart = this.localTimeStart
      this.localItems[0].properties = this.localProperties
      this.localItems[0].name = ''
      this.localItems[0].detailArray = detailArray
      const newEquipSetting = { ...this.localItems[0] }

      const obj = new _Set(newEquipSetting)
      this.componentData = {
        component: 'set-component-new',
        uuid: null,
        image: obj.image,
        text: `Настройки: ${this.currentDate}`,

        data: {
          uuid: obj.uuid,
          id: newEquipSetting.id,
          purposeGroup: newEquipSetting.setType,
          equipId: this.id,
          equipTypeId: this.equipTypeId,
        },
      }
      setTimeout(() => {
        const options = {
          action: this.action,
          itemNames: this.localItemNames,
        }
        this.$emitter.emit('set-params-equip-setting:action', options)
      }, 200)

      this.edit = true
    },
    onRemoveClick() {
      const options = {
        name: 'remove',
        component: {
          text: 'Удаление настроек прибора:',
          component: 'message',
          data: {
            text: 'Вы действительно хотите удалить выбранные настройки прибора?',
          },
        },
      }
      this.wizard = wizardMessage(options)
    },

    cancelWizard() {
      this.wizard = null
    },
    onWizardEnd(data, name) {
      this.wizard = null
      if (name === 'remove' && !data) {
        this.$store.state.equip.equipEvent.hasConfirmSave = true
      }
    },
    async removeLocal() {
      this.localRemoved = await this.equipSetting.remove(this.removeIds)

      this.localRemoved = this.localRemoved
        ? !this.localRemoved
        : this.localRemoved

      this.remove.clear()

      await this.load()
      this.$store.state.equip.equipEvent.hasConfirmSave = false
    },

    onSaved(data) {
      this.componentData.text = `${'Настройки'}: ${data.name}`
    },
    close() {
      this.edit = false
    },
    async load() {
      this.wait = true
      if (
        typeof this.removeIds.length === 'number' &&
        this.removeIds.length > 0
      ) {
        return
      }

      try {
        const { data } = await this.$http.get('equip/equipSettings', {
          params: { equipId: this.getCard.selectedNodeId },
        })

        this.dataItems = data.data.values.map((r) => {
          return Object.assign(r, {
            checked: r.properties === 1 ? true : false,
          })
        })

        this.localItems.forEach((item) => {
          if (item.checked) {
            item.checked = false
          }
        })

        if (typeof this.localItems[0]?.detailArray === 'object') {
          const versionIndex = this.localItems[0].detailArray?.findIndex(
            (item) => item.name === 'Version'
          )
          if (versionIndex !== -1) {
            const versionItem = this.localItems[0].detailArray?.find(
              (item) => item.name === 'Version'
            )
            const newParamValues = {}
            const newParamKeys = {}

            if (versionItem.paramValues) {
              const paramValues = versionItem.paramValues

              Object.keys(paramValues).forEach((key, index) => {
                newParamValues[index] = paramValues[key]
              })
              versionItem.paramValues = newParamValues

              Object.keys(paramValues).forEach((key, index) => {
                newParamKeys[index] = key
              })
              this.$store.state.equip.versionParamKeys = newParamKeys
            }

            this.localItems[0].detailArray[versionIndex].paramValues =
              newParamValues
          }
        }
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.wait = false
      }
    },

    getCurrentDate() {
      const now = new Date()
      const day = String(now.getDate()).padStart(2, '0')
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const year = now.getFullYear()
      const hours = String(now.getHours()).padStart(2, '0')

      return `${day}-${month}-${year} ${hours}`
    },
    getImage(item) {
      return item instanceof ModemPool ? item.image : getImage.call(this, item)
    },
  }, // end methods
}
</script>

<style scoped>
.header-date,
.box {
  justify-content: center;
}
.caption {
  justify-content: end;
}
</style>
