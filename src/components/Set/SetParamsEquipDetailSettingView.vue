<template>
  <div class="component-detail">
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
        <span class="cell icon">
          <div :class="['fas', 'fa-cog', 'cog']" />
        </span>

        <span class="cell" style="justify-content: start">{{ r.name }}</span>
        <span class="cell" style="justify-content: start">{{ r.value }}</span>
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

import ListComponent from '@/components/ListComponent.vue'
import PropsComponent from '@/components/PropsComponent.vue'
import ToolBar from '@/components/ToolBar.vue'
import Wizard from '@/components/Wizard.vue'

import { mapGetters } from 'vuex'

export default {
  name: 'SetComponentEquipDetailSettingView',
  components: {
    PropsComponent,
    ToolBar,
    Wizard,
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
    }
  },
  created() {
    this.$emitter.on('message', this.processMessage)
  },
  async mounted() {
    const options = {
      equipSettingHeight:
        this.getEquip.equipSetting[this.getEquip.equipSettingIndex].detailArray
          .length,
    }
    this.$store.commit('setEquip', options)
  },
  computed: {
    ...mapGetters({
      getEquip: 'getEquip',
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
    handleEquipSettingDate(event) {
      event
      // let changedEquipSettingDate = new Date(event)
    },
    handlePassSettingCheck(event) {
      event
      // console.log('$$ event', event)
    },
    onSaved(data) {
      this.componentData.text = `${'Настройка прибора'}: ${data.name}`
    },

    close() {
      this.edit = false
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
</style>
