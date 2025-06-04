<template>
  <div class="tabs-container">
    <template v-if="this.currentTab !== null">
      <div class="tabs">
        <div
          v-for="(tab, index) in tabs"
          :key="index"
          :class="['tab', { active: currentTab === tab }]"
          @click="click(tab)"
        >
          {{ tab.text }}
        </div>
      </div>
      <transition mode="out-in">
        <keep-alive>
          <div class="component-detail">
            <component
              :is="currentComponent"
              v-bind="currentData"
              :key="currentKey"
              @componentEvent="onComponentEvent"
            ></component>
          </div>
        </keep-alive>
      </transition>
    </template>
    <div v-else></div>
  </div>
</template>

<script>
import { asyncImport } from '../plugins/api'

export default {
  components: {
    StateList: asyncImport(() => import('./States/StateList.vue')),
    Report: asyncImport(() => import('./Report/ReportComponent.vue')),
    ReportFileList: asyncImport(() =>
      import('./ReportFile/ReportFileList.vue')
    ),
    Journal: asyncImport(() => import('./Journal/JournalList.vue')),
    Archive: asyncImport(() => import('./Archive/ArchiveComponent.vue')),
    EquipSetList: asyncImport(() => import('./Equip/EquipSetList.vue')),
    ReportMoek: asyncImport(() => import('./Report/ReportMoek.vue')),
    EquipSchemaList: asyncImport(() => import('./Equip/EquipSchemaList.vue')),
    FileList: asyncImport(() => import('./FileList/FileList.vue')),
    Wizard: asyncImport(() => import('./Wizard.vue')),
    EquipForms: asyncImport(() => import('./Equip/EquipForms.vue')),
    Equip: asyncImport(() => import('./Equip/EquipComponent.vue')),
    GroupConnection: asyncImport(() =>
      import('./GroupConnection/GroupConnection.vue')
    ),
    SystemMessages: asyncImport(() =>
      import('./SystemMessages/SystemMessages.vue')
    ),
  },
  props: {
    tabs: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      currentTab: this.tabs.length === 0 ? null : this.tabs[0],
    }
  },
  computed: {
    currentComponent() {
      return this.currentTab === null ? null : this.currentTab.component
    },
    currentKey() {
      return this.currentTab === null
        ? null
        : this.currentTab.key
        ? this.currentTab.key
        : null
    },
    currentData() {
      return this.currentTab === null ? null : this.currentTab.data
    },
  },
  watch: {
    tabs(newVal) {
      if (newVal.length > 0) {
        this.currentTab = this.tabs[0]
      } else {
        this.currentTab = null
      }
    },
  },
  methods: {
    onComponentEvent(event, name, data) {
      this.$emit('componentEvent', event, name, data)
    },
    click(tab) {
      if (this.currentTab !== tab) {
        this.currentTab = tab
      }
    },
  },
}
</script>
