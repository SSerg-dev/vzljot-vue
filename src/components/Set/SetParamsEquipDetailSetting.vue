<template>
  <div>
    <tool-bar v-if="$store.state.user?.userRights.setEdit">
      <div
        :class="['button', 'fas', 'fa-plus-circle', { disabled: true }]"
        title="Добавить..."
        @click="onAddClick()"
      />
      <div
        :class="['button', 'fas', 'fa-times-circle', { disabled: true }]"
        title="Удалить"
        @click="onRemoveClick()"
      />
    </tool-bar>

    <div class="container">
      <div class="item-1">
        <div class="table-grid">
          <header class="header"></header>
          <header class="header header-date">Наименование</header>
          <div
            v-for="(r, i) in localItemsSorted"
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

            <span class="cell caption">{{
              `${r.name.replace(' 12', ' 12')}`
            }}</span>
          </div>
        </div>
      </div>

      <div class="item-2">
        <div class="pager-component-position">
          <pager-component v-bind="pageInfo" @go="onChangePage" />
        </div>
      </div>
    </div>

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
  </div>
</template>

<script>
let cancel = null

import { asyncImport } from '@/plugins/api.js'
import { Set } from '@/classes/set'

import ListComponent from '@/components/ListComponent.vue'
import PagerComponent from '@/components/PagerComponent.vue'
import PropsComponent from '@/components/PropsComponent.vue'

import ToolBar from '@/components/ToolBar.vue'
import Wizard from '@/components/Wizard.vue'

import DatePicker from '@/components/Inputs/DatePicker.vue'
import CheckBox from '@/components/Inputs/CheckBox.vue'

import // wizardAdd,
// wizardRemove,
// cancelWizard,
// onWizardEnd
'@/plugins/wizardComponents/wizardEquipSetting'

import { mapGetters } from 'vuex'

export default {
  name: 'SetParamsEquipDetailSettingView',
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
    Wizard,
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

      localItemsSorted: [],

      localTimeStart: null,
      localProperties: null,

      wizardEquipSetting: null,
    }
  },
  created() {
    this.currentDate = this.getCurrentDate()
    this.load()
  },
  mounted() {},
  computed: {
    ...mapGetters({
      getEquip: 'getEquip',
      getCard: 'getCard',
    }),
  },
  beforeUnmount() {
    if (cancel) this.cancel()
  },
  methods: {
    onChangePage(page, size) {
      this.pageInfo.Size = size
      this.pageInfo.Page = page
    },
    setEquipSettingTable(i, timeStart, properties) {
      const equipSettingTable = {
        id: this.dataItems[i].id,
        equipId: this.$store.state.equip.id,
        timeStart,
        properties,
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

      this.localTimeStart = this.localItemsSorted[i].timeStart
      this.localProperties = this.localItemsSorted[i].properties

      const options = {
        hasEquipSettingEdit: true,
      }
      this.$store.commit('setEquip', options)

      this.setEquipSettingTable(i, this.localTimeStart, this.localProperties)

      const obj = new Set(r)
      this.componentData = {
        component: 'set-component',
        uuid: null, //obj.uuid,
        image: obj.image,
        text: `Настройки: ${r.name.replace(' 12', ' 12')}`,
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
    onSaved(data) {
      this.componentData.text = `${'Настройки'}: ${data.name}`
    },
    close() {
      this.edit = false
    },
    async load() {
      this.wait = true

      try {
        const { data } = await this.$http.get('equip/equipSettings', {
          params: { equipId: this.getCard.selectedNodeId },
        })

        this.dataItems = data.data.values.map((r) => {
          return Object.assign(r, {
            checked: r.properties === 1 ? true : false,
          })
        })

        this.localItemsSorted = this.localItems
          .slice()
          .sort((a, b) => new Date(a.timeStart) - new Date(b.timeStart))

        // $$
        if (typeof this.localItemsSorted[0]?.detailArray === 'object') {
          const versionIndex = this.localItemsSorted[0].detailArray?.findIndex(
            (item) => item.name === 'Version'
          )
          if (versionIndex !== -1) {
            const versionItem = this.localItemsSorted[0].detailArray?.find(
              (item) => item.name === 'Version'
            )

            const newParamValues = {}
            const newParamKeys = {}

            if (versionItem && versionItem.paramValues) {
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
            this.localItemsSorted[0].detailArray[versionIndex].paramValues =
              newParamValues
          }
        }
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.wait = false
      }
    },
    async onAddClick() {
      // this.wizardEquipSetting = wizardAdd('AAAAAA')
      /*
      this.setEquipSettingTable(0, (new Date()), 0) 
      
      const r = this.localItemsSorted[0]

      const obj = new Set(r)
      this.componentData = {
        component: 'set-component-new', 
        uuid: null,
        image: obj.image,
        text: `Создать: ${this.currentDate}`,
        data: {
          uuid: obj.uuid,
          id: r.id,
          purposeGroup: r.setType,
          equipId: this.id,
          equipTypeId: this.equipTypeId,
        },
      }
      this.edit = true
      */
    },
    onRemoveClick() {
      // this.wizardEquipSetting = wizardRemove('BBBBBB')
    },
    getCurrentDate() {
      const now = new Date()
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
  /* grid-template-columns: 38px repeat(2, max-content) minmax(max-content, 1fr); */
  grid-template-columns: 38px 240px;
}
.header-date,
.header-name,
.header-value,
.header-pass-check {
  justify-content: center;
}
.caption {
  justify-content: end;
}

.pager-component-position {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background-color: #ecf0f6;

  width: 100%;
  position: absolute;
  bottom: 0;
}
.container,
.item-1,
.item-2 {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>
