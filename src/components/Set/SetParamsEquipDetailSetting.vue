<template>
  <div class="component-detail" :style="{ height: computedHeight }">
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
    <div class="table-grid" style="width: 100%">
      <header class="header"></header>
      <header class="header header-date">Наименование</header>
      <header class="header header-date">Дата ввода</header>
      <header class="header header-pass-check">
        Разрешить пропускать проверку настроек
      </header>

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

        <span class="cell" style="justify-content: center">{{ r.name }}</span>

        <span class="cell date-picker">
          <date-picker
            v-model="r.timeStart"
            :format="dateFormat"
            clearable
            @update:modelValue="handleEquipSettingDate($event)"
          />
        </span>

        <span class="cell check-box">
          <check-box
            v-model="r.checked"
            @update:modelValue="handlePassSettingCheck($event)"
          ></check-box>
        </span>
      </div>
    </div>

    <pager-component v-bind="pageInfo" @go="onChangePage" />
    <spinner :show="wait" :text="'Загрузка настроек...'" />

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

import { mapGetters } from 'vuex'

export default {
  name: 'SetParamsEquipDetailSettingView',
  components: {
    PagerComponent,
    SetComponent: asyncImport(() =>
      import('@/components/Set/SetParamsEquipDetailSettingView.vue')
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
      currentDate: new Date()
    }
  },
  created() {
    this.$emitter.on('message', this.processMessage)
  },
  async mounted() {
    await this.load()
  },
  computed: {
    ...mapGetters({
      getEquip: 'getEquip',
    }),
    computedHeight() {
      const minHeight = 88
      const itemHeight = 34
      const itemCount = this.localItems.length
      const coeff = 24

      return `calc(${minHeight}px + ${
        itemCount * itemHeight + this.getEquip.equipSettingHeight * coeff
      }px)`
    },
    localItemsSorted() {
      return this.localItems.slice().sort((a, b) => {
        return new Date(a.timeStart) - new Date(b.timeStart)
      })
    },
  },
  beforeUnmount() {
    if (cancel) this.cancel()
  },
  methods: {
    onChangePage(page, size) {
      this.pageInfo.Size = size
      this.pageInfo.Page = page
    },
    handleEquipSettingDate(event) {
      event
      // let changedEquipSettingDate = new Date(event)
    },
    handlePassSettingCheck(event) {
      event
      // console.log('$$ event', event)
    },
    viewClick(r, i) {
      const options = {
        equipSettingIndex: i,
      }
      this.$store.commit('setEquip', options)

      const obj = new Set(r)
      this.componentData = {
        component: 'set-component',
        uuid: null, //obj.uuid,
        image: obj.image,
        text: `Настройка прибора: ${r.name}`,
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
      this.componentData.text = `${'Настройка прибора'}: ${data.name}`
    },
    close() {
      this.edit = false
    },
    async load() {
      this.wait = true

      try {
        const { data } = await this.$http.get('equip/equipSettings', {
          params: { equipId: this.getEquip.id },
        })

        this.dataItems = data.data.values.map((r) => {
          return Object.assign(r, {
            checked: r.properties === 1 ? true : false,
          })
        })

        const options = {
          equipSetting: this.dataItems,
        }
        this.$store.commit('setEquip', options)
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.wait = false
      }
    },
  }, // end methods
}
</script>

<style scoped>
.table-grid {
  grid-template-columns: 38px repeat(2, max-content) minmax(max-content, 1fr);
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
.date-picker {
  width: 100px;
}
.check-box {
  display: flex;
  align-items: center;
  justify-content: end;
}
</style>
