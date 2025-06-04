<template>
  <div class="component-detail">
    <preserver-component
      v-bind="{
        readOnly: !$store.state.user?.userRights.equipEdit,
        saving,
        disabled: !hasChanges,
        addition: true,
      }"
      @saveClick="onSaveClick()"
    >
      <div class="setting-container">
        <span class="setting-item-1">Дата ввода</span>

        <span class="cell date-picker setting-item-2">
          <date-picker
            v-model="localTimeStart"
            :format="dateFormat"
            @update:modelValue="
              handleEquipSettingDate($event, this.getEquip.equipSettingIndex)
            "
          />
        </span>

        <label class="cell check-box setting-item-3 clickable-label">
          <check-box
            v-model="localProperties"
            @update:modelValue="
              handlePassSettingCheck($event, this.getEquip.equipSettingIndex)
            "
          ></check-box>

          <span class="setting-item-4"
            >Разрешить пропускать проверку настроек</span
          >
        </label>
      </div>

      <div class="table-grid">
        <header class="header"></header>
        <header class="header header-date">Наименование</header>
        <header class="header header-date">Значение</header>

        <div
          v-for="(r, i) in localEquipSettingSorted[getEquip.equipSettingIndex]
            ?.detailArray"
          :key="i"
          class="table-row"
          :ref="(el) => (rowsElement[r.id] = el)"
        >
          <span class="cell icon" title="Редактирование...">
            <div :class="['fas', 'fa-cog', 'cog', 'clickable-icon']" />
          </span>

          <span class="cell" style="justify-content: start">{{
            r.caption
          }}</span>
          <span class="cell" style="justify-content: end"
            ><EquipSettingValue :param="r" :editName="editName" :mode="mode" />
          </span>
        </div>
      </div>

      <pager-component v-bind="this.pageInfo" @go="onChangePage" />

      <transition-group>
        <wizard
          v-if="wizard"
          v-bind="wizard"
          @cancel="cancelWizard"
          @end="onWizardEnd"
        />
        <props-component v-if="edit" v-bind="componentData">
          <component
            :is="componentData.component"
            v-bind="componentData.data"
            @saved="onSaved"
          />
        </props-component>
      </transition-group>
    </preserver-component>
  </div>
</template>

<script>
import EquipSetting from '@/classes/equipSetting'

import BaseComponent from '../Base/BaseComponent.vue'
import PagerComponent from '@/components/PagerComponent.vue'
import PropsComponent from '@/components/PropsComponent.vue'
import ToolBar from '@/components/ToolBar.vue'
import Wizard from '@/components/Wizard.vue'
import PreserverComponent from '@/components/PreserverComponent.vue'

import DatePicker from '@/components/Inputs/DatePicker.vue'
import CheckBox from '@/components/Inputs/CheckBox.vue'
import EquipSettingValue from '@/components/Inputs/EquipSettingValue.vue'

import { mapGetters } from 'vuex'

export default {
  name: 'SetComponentEquipDetailSettingNew',
  components: {
    PropsComponent,
    ToolBar,
    Wizard,
    EquipSettingValue,
    PreserverComponent,
    PagerComponent,
    DatePicker,
    CheckBox,
  },
  extends: BaseComponent,

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

      pageInfo: {
        Page: 1,
        Items: 0,
        Size: this.$store.getters.pageInfo.Size,
      },

      busy: false,
      rowsElement: {},
      localEditName: '',
      dateFormat: 'DD.MM.YYYY HH',

      localTimeStart: null,
      localProperties: null,
      localEquipSettingId: null,
      localEquipSettingSorted: [],

      equipSetting: new EquipSetting({}),
      mode: 'new',

      localAction: null,
      hasExist: false,
      localItemNames: [],
      currentName: '',
      delay: Object.freeze(2000),
    }
  },

  created() {
    this.$emitter.on('set-params-equip-setting:action', this.set)

    this.$emitter.on('equip-setting-value:update', this.change)
    this.$emitter.on('equip-setting-node:save', this.onSaveClick)

    this.$store.state.equip.equipEvent.hasChangeSave = false
    this.$store.state.equip.equipEvent.hasExistDateSet = false

    this.pageInfo.Items =
      this.getEquip.equipSetting[
        this.getEquip.equipSettingIndex
      ]?.detailArray?.length

    this.$store.getters.pageInfo.Items = this.pageInfo.Items

    this.init()
  },

  mounted() {
    this.hasChanges = true
    this.hasEquipSettingNew = true
    this.$store.state.equip.equipEvent.hasChangeNotSave = true
  }, 

  computed: {
    ...mapGetters({
      getEquip: 'getEquip',
    }),
    editName() {
      return this.localEditName
    },
    deltaSave() {
      return this.saveEnd - this.saveStart
    },
  },

  beforeUnmount() {
    const options = {
      hasEquipSettingEdit: false,
    }
    this.$store.commit('setEquip', options)
    this.$emitter.off('set-params-equip-setting:action')

    this.$store.state.equip.equipEvent.hasChangeSave = false
    this.$store.state.equip.equipEvent.hasExistDateSet = false

    this.$store.state.equip.equipEvent.hasChangeNotSave = false
  },

  methods: {
    async set(options) {
      this.$store.state.equip.equipSettingTable.action = options.action
      this.localAction = options.action
      this.localItemNames = options.itemNames
    },

    init() {
      this.localEquipSettingSorted = this.getEquip.equipSetting
        .slice()
        .sort((a, b) => new Date(a.timeStart) - new Date(b.timeStart))

      this.localEquipSettingId =
        this.localEquipSettingSorted[this.getEquip.equipSettingIndex]?.id

      this.localTimeStart = new Date()
      this.localProperties = 0

      this.currentName = this.getCurrentDate(this.localTimeStart)
      setTimeout(() => {
        this.hasExist = this.localItemNames.includes(this.currentName)
      }, 200)

      const options = {
        equipSettingTable: {
          id: this.localEquipSettingId,
          timeStart: this.localTimeStart,
          properties: this.localProperties,
        },
      }

      this.$store.commit('setEquip', options)
    },

    onChangePage(page, size) {
      this.pageInfo.Size = size
      this.pageInfo.Page = page
    },

    handleEquipSettingDate(event, i) {
      this.localTimeStart = new Date(event)
      if (this.localTimeStart.getFullYear() < 1970) {
        this.localTimeStart.setFullYear(1970)
      }
      this.localTimeStart.setMinutes(0, 0, 0)

      this.currentName = this.getCurrentDate(this.localTimeStart)
      setTimeout(() => {
        this.hasExist = this.localItemNames.includes(this.currentName)
      }, 200)

      this.setEquipSettingTable(i, this.localTimeStart, this.localProperties)

      const changedValues = this.localTimeStart
      this.$emitter.emit('set-params-equip-setting:update', changedValues)
    },
    handlePassSettingCheck(event, i) {
      this.localProperties = event
      this.setEquipSettingTable(i, this.localTimeStart, this.localProperties)

      const changedValues = this.localProperties
      this.$emitter.emit('set-params-equip-setting:update', changedValues)
    },
    setEquipSettingTable(i, timeStart, properties) {
      const equipSettingTable = {
        equipSettingId: this.localEquipSettingId,
        timeStart,
        properties,
        action: this.localAction,
      }

      const options = {
        equipSettingIndex: i,
        equipSettingTable,
      }
      this.$store.commit('setEquip', options)
      this.hasChanges = true
    },

    async save() {
      if (!this.$store.state.equip.equipTopNav.hasSetting) {
        return
      }

      if (this.hasExist) {
        this.$store.commit('notification', {
          title: 'Настройки прибора',
          type: 'error',
          text: 'Настройки прибора с заданной датой начала уже существуют.',
        })
        return
      }

      try {
        this.saving = true
        this.error = {}

        await this.equipSetting.save()

        this.hasChanges = false
        this.hasEquipSettingNew = false

        this.$store.state.equip.equipEvent.hasChangeSave = true
        this.$emitter.emit(
          'set-params-equip-setting:hasChanges',
          this.hasChanges
        )
      } catch (error) {
        if (error.response.status === 551) {
          this.error = error.response.data
        } else {
          this.$store.commit('error', error)
        }
      } finally {
        this.saving = false
      }
    },
    change(changedValues) {
      if (changedValues) {
        this.hasChanges = true
      }
    },
    getCurrentDate(now) {
      const day = String(now.getDate()).padStart(2, '0')
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const year = now.getFullYear()
      const hours = String(now.getHours()).padStart(2, '0')

      return `${day}-${month}-${year} ${hours}`
    },
  }, // end methods
}
</script>

<style scoped>
.table-grid {
  grid-template-columns: 38px 380px minmax(max-content, 1fr);
}
.header-date,
.header-name,
.header-value,
.header-pass-check {
  justify-content: center;
}
.caption {
  width: 640px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}
.cog {
  font-size: 21px;
}

/* setting */
.setting-container {
  display: flex;
  flex-direction: row;
  margin-bottom: 2px;
}
.setting-item-1 {
  align-self: center;
  justify-self: center;
  margin-left: 10px;
  margin-right: 5px;
}
.setting-item-2 {
  align-self: center;
  justify-self: center;
  margin-right: 20px;
}
.setting-item-3 {
  align-self: center;
  justify-self: center;
  margin-right: 5px;
  margin-left: 10px;
}
.setting-item-4 {
  align-self: center;
  justify-self: center;
  margin-right: 0px;
  margin-left: 5px;
}
.check-box {
  display: flex;
  align-items: center;
  justify-content: end;
}
.clickable-label {
  cursor: pointer;
}
.check-box input {
  cursor: pointer;
}
</style>
