<template>
  <div>
    <tool-bar v-if="$store.state.user?.userRights.setEdit">
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
          { disabled: !hasSelected },
        ]"
        title="Удалить"
        @click="onRemoveClick()"
      />
    </tool-bar>

    <div class="table-grid" :key="deltaFetch">
      <header class="header"></header>
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
            v-show="r.name !== ''"
            :class="`fas fa-tasks-alt clickable-icon`"
            @click="viewClick(r, i)"
            title="Просмотр..."
          />
        </span>

        <span class="cell box">
          <check-box
            v-show="r.name !== ''"
            type="checkbox"
            v-model="r.checked"
            :disabled="false"
            @update:modelValue="handleCheckBox(i, $event)"
          >
          </check-box>
        </span>

        <span class="cell caption">{{ `${r.name}` }}</span>
      </div>

      <div class="pager-component-position">
        <pager-component v-bind="pageInfo" @go="onChangePage" />
      </div>
    </div>

    <transition-group>
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
import { Set as _Set } from '@/classes/set'
import EquipSetting from '@/classes/equipSetting'

import ListComponent from '@/components/ListComponent.vue'
import PagerComponent from '@/components/PagerComponent.vue'
import PropsComponent from '@/components/PropsComponent.vue'

import ToolBar from '@/components/ToolBar.vue'
import Wizard from '@/components/Wizard.vue'

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

      action: null,
      equipSetting: new EquipSetting({}),
      remove: new Set(),

      localItemNames: [],
      delay: Object.freeze(200),
      deltaDebounce: Object.freeze(200), 

      fetchStart: 0,
      fetchEnd: 200,
    }
  },
  created() {
    this.$emitter.on('props-component:close', this.load)

    this.currentDate = this.getCurrentDate()
    this.load()
  },
  mounted() {},

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
    deltaFetch() {
      return this.fetchEnd - this.fetchStart
    },
  },
  beforeUnmount() {
    if (cancel) this.cancel()
  },
  methods: {
    handleCheckBox(index, event) {
      const id = this.localItemsSorted[index].id

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
    onChangePage(page, size) {
      this.pageInfo.Size = size
      this.pageInfo.Page = page
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

      this.localTimeStart = this.localItemsSorted[i]?.timeStart ?? new Date()
      this.localProperties = this.localItemsSorted[i]?.properties ?? 0

      const options = {
        hasEquipSettingEdit: true,
      }
      this.$store.commit('setEquip', options)

      this.setEquipSettingTable(i, this.localTimeStart, this.localProperties)

      const obj = new _Set(r)
      this.componentData = {
        component: 'set-component',
        uuid: null, //obj.uuid,
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
      this.action = this.localItemsSorted[0].name ? 'add' : 'create'

      if (this.action === 'add' || this.action === 'create') {
        this.localItemNames = this.localItems.map((item) => item.name)
      }

      this.localTimeStart = new Date()
      this.localProperties = 0
      this.localTimeStart.setMinutes(0, 0, 0)

      this.setEquipSettingTable(0, this.localTimeStart, this.localProperties)

      const detailArray = this.localItemsSorted[0].detailArray.map((item) => {
        if (item.value !== '') {
          item.value = ''
        }
        return item
      })

      this.localItemsSorted[0].timeStart = this.localTimeStart
      this.localItemsSorted[0].properties = this.localProperties
      this.localItemsSorted[0].name = ''
      this.localItemsSorted[0].detailArray = detailArray
      const newEquipSetting = { ...this.localItemsSorted[0] }

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
    async onRemoveClick() {
      await this.equipSetting.remove(this.removeIds)
      this.load()
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
        this.fetchStart = new Date()

        if (this.deltaFetch > 0 && this.deltaFetch < this.deltaDebounce) {
          return
        }
        const { data } = await this.$http.get('equip/equipSettings', {
          params: { equipId: this.getCard.selectedNodeId },
        })
        this.fetchEnd = new Date()

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

        this.localItemsSorted = this.localItems
          .slice()
          .sort((a, b) => new Date(a.timeStart) - new Date(b.timeStart))

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
.table-grid {
  grid-template-columns: repeat(2, 38px) 240px;
}
.header-date,
.header-name,
.header-value,
.header-pass-check {
  justify-content: center;
}

.box {
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
</style>
