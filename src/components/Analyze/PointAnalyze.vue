<template>
  <div class="wrapper">
    <div class="content">
      <component v-if="component" :is="component.name" v-bind="component.data">
        <template v-slot:choice v-if="analyzeTypes.length > 1">
          <div :class="['button', 'fas', 'fa-list-ul']" title="Выбор анализа..." @click="onSettingsClick()" />
        </template>
      </component>
      <transition>
        <wizard v-if="wizard" v-bind="wizard" @cancel="onWizardCancel" @end="onWizardEnd" :cancellable="localCancellable" />
      </transition>
    </div>
  </div>
</template>

<script>
import { store } from '@/store/store'

import Analyze from './AnalyzeComponent.vue'
import Temperature from './TemperatureComponent.vue'
import TemperatureQualityHws from './TemperatureQualityHws.vue'
import Wizard from '../Wizard.vue'

const wizard = analyzeTypes => ({
  name: 'analyzeWizard',
  component: {
    text: 'Выберите тип анализа:',
    component: 'selector-option',
    event: 'selectionChanged',
    data: {
      options: analyzeTypes.map(r => store.state.env.analyzeTypes[r]),
      defaultOption: store.state.env.analyzeTypes[analyzeTypes[0]]
    }
  }
})

export default {
  components: {
    Analyze,
    Temperature,
    TemperatureQualityHws,
    Wizard
  },
  props: {
    id: Number,
    archiveTypes: {
      type: Array,
      default: () => []
    },
    analyzeTypes: {
      type: Array,
      default: () => []
    },
    pollDataType: Number,
    schemaEvent: String,
    schemaEvents: {
      type: Array,
      default: () => []
    },
    cancellable: Boolean
  },
  data() {
    let component = null

    if (this.analyzeTypes.length === 1) {
      const type = this.$store.state.env.analyzeTypes[this.analyzeTypes].type
      component = {
        name: type,
        data: {
          id: this.id,
          timeStart: new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate()),
          timeEnd: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59, 59)
        }
      }

      if (type === 'analyze') {
        component.data.pollDataType = this.pollDataType
        component.data.archiveTypes = this.archiveTypes
        component.data.schemaEvent = this.schemaEvent
        component.data.schemaEvents = this.schemaEvents
      }
    }

    return {
      component,
      wizard: this.analyzeTypes.length > 1 ? wizard(this.analyzeTypes) : null,
      localCancellable: this.cancellable
    }
  },
  methods: {
    onWizardCancel() {
      this.wizard = false
    },
    onWizardEnd(data) {
      this.wizard = false

      const component = {
        name: data,
        data: {
          id: this.id,
          timeStart: new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate()),
          timeEnd: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59, 59)
        }
      }

      if (data === 'analyze') {
        component.data.pollDataType = this.pollDataType
        component.data.archiveTypes = this.archiveTypes
        component.data.schemaEvent = this.schemaEvent
        component.data.schemaEvents = this.schemaEvents
      }

      this.component = component
    },
    onSettingsClick() {
      this.localCancellable = true
      this.wizard = wizard(this.analyzeTypes)
    }
  }
}
</script>

<style scoped>
.wrapper {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: auto;
}

.content {
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: auto;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>
