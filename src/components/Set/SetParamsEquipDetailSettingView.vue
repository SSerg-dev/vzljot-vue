<template>
  <div class="component-detail">
    <preserver-component
      v-bind="{
        readOnly: !$store.state.user?.userRights.equipEdit,
        saving,
        disabled: !hasChanges,
      }"
      @saveClick="onSaveClick()"
    >
      <div class="setting-container">
        <span class="setting-item-1">Дата ввода</span>

        <span class="cell date-picker setting-item-2">
          <date-picker
            v-model="localTimeStart"
            :format="dateFormat"
            clearable
            @update:modelValue="
              handleEquipSettingDate($event, this.getEquip.equipSettingIndex)
            "
          />
        </span>

        <span class="cell check-box setting-item-3">
          <check-box
            v-model="localProperties"
            @update:modelValue="
              handlePassSettingCheck($event, this.getEquip.equipSettingIndex)
            "
          ></check-box>
        </span>

        <span class="setting-item-4"
          >Разрешить пропускать проверку настроек</span
        >
      </div>

      <div class="table-grid">
        <header class="header"></header>
        <header class="header header-date">Наименование</header>
        <header class="header header-date">Значение</header>

        <div
          v-for="(r, i) in getEquip.equipSetting[getEquip.equipSettingIndex]
            .detailArray"
          :key="i"
          class="table-row"
          :ref="(el) => (rowsElement[r.id] = el)"
        >
          <span class="cell icon clickable-icon" title="Редактирование...">
            <div :class="['fas', 'fa-cog', 'cog']" />
          </span>

          <span class="cell" style="justify-content: start">{{
            r.caption
          }}</span>
          <span class="cell" style="justify-content: end"
            ><EquipSettingValue :param="r" :editName="editName" />
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
        <props-component v-if="edit" v-bind="componentData" @close="close">
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
  name: 'SetComponentEquipDetailSettingView',
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

      dateFormat: 'DD.MM.YYYY',
      localTimeStart: null,
      localProperties: null,
      localEquipSettingId: null,

      equipSetting: new EquipSetting({}),
    }
  },

  created() {
    this.$emitter.on('message', this.processMessage)
    this.$emitter.on('equip-setting-value:update', this.change)

    this.pageInfo.Items =
      this.getEquip.equipSetting[
        this.getEquip.equipSettingIndex
      ].detailArray.length

    this.$store.getters.pageInfo.Items = this.pageInfo.Items
  },

  async mounted() {
    const options = {
      equipSettingHeight:
        this.getEquip.equipSetting[this.getEquip.equipSettingIndex].detailArray
          .length,
    }

    this.$store.commit('setEquip', options)
    this.hasChanges = false

    this.localEquipSettingId =
      this.getEquip.equipSetting[this.getEquip.equipSettingIndex].id

    this.localTimeStart =
      this.getEquip.equipSetting[this.getEquip.equipSettingIndex].timeStart

    this.localProperties = this.getEquip.equipSetting[
      this.getEquip.equipSettingIndex
    ].properties
      ? true
      : false
  },

  computed: {
    ...mapGetters({
      getEquip: 'getEquip',
    }),
    editName() {
      return this.localEditName
    },
  },

  beforeUnmount() {},

  methods: {
    onChangePage(page, size) {
      this.pageInfo.Size = size
      this.pageInfo.Page = page
    },
    handleEquipSettingDate(event, i) {
      this.localTimeStart = new Date(event)
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
      }

      const options = {
        equipSettingIndex: i,
        equipSettingTable,
      }

      this.$store.commit('setEquip', options)
      this.hasChanges = true
    },

    async save() {
      try {
        this.saving = true
        this.error = {}

        await this.equipSetting.save()

        this.hasChanges = false
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
      if (changedValues) this.hasChanges = true
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
}
.setting-item-4 {
  align-self: center;
  justify-self: center;
  margin-right: 0px;
}
.date-picker {
  width: 100px;
}
.check-box {
  display: flex;
  align-items: center;
  justify-content: end;
}
</style>
