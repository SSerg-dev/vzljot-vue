<template>
  <div class="group-connection-type-grid">
    <expantion-panel
      v-show="component != 'None'"
      caption="Настройки синхронизации времени"
      :staticHeight="false"
      :resizable="false"
    >
      <transition name="group-connection-fade" mode="out-in">
        <component
          :is="component"
          v-bind="Object.assign({}, componentData, { error })"
        />
      </transition>
    </expantion-panel>

    <div class="group-connection-type-grid two">
      <label>Часовой пояс прибора:</label>
      <select
        v-model="localTimeZoneType"
        @change="onChanged(localTimeZoneType)"
      >
        <option v-for="r in localTimeZones" :key="r.Id" :value="r.Id">
          {{ r.Description }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
import ExpantionPanel from '@/components/ExpantionPanel.vue'

export default {
  components: {
    ExpantionPanel,
  },
  props: {
    timeZones: Array,
    timeZonesType: Number,
    error: Object,
  },
  data() {
    return {
      localTimeZoneType: this.timeZonesType,

      firstTimeZone: {
        Id: -1,
        Description: 'Использовать системные настройки',
      },
      secondTimeZone: {
        Id: 0,
        Description: 'Совпадает с часовым поясом сервера БД',
      },
    }
  },
  created() {},
  mounted() {},
  computed: {
    localTimeZones() {
      return [this.firstTimeZone, this.secondTimeZone, ...this.timeZones]
    },

    component() {
      if (this.timeZones !== null && this.localTimeZoneType) {
        const type = this.timeZones.find(
          (r) => r.type === this.localTimeZoneType
        )

        if (type) {
          return type.component
        }
      }

      return null
    },
    componentData() {
      if (this.timeZones !== null && this.localTimeZoneType) {
        const type = this.timeZones.find(
          (r) => r.type === this.localTimeZoneType
        )
        if (type) {
          return type.data
        }
      }
      return null
    },
  },
  watch: {
    timeZonesType(value) {
      this.localTimeZoneType = value
    },
    localTimeZoneType(value) {
      this.$emit('changeConnectionGroupType', value)
    },
  },
  methods: {
    getData() {
      return this.componentData ? this.componentData.timeZone : null
    },
    onChanged(value) {
      this.$emit('onChangedTimeZoneType', value)
    },
  },
}
</script>

<style>
.group-connection-type-grid {
  display: grid;
  gap: 5px 3px;
}

.group-connection-type-grid .two {
  grid-template-columns: auto 1fr;
}

.group-connection-type-grid > label {
  text-align: right;
}

.group-connection-fade-enter-active,
.group-connection-fade-leave-active {
  transition: opacity 0.2s ease;
}

.group-connection-fade-enter,
.group-connection-fade-leave-to {
  opacity: 0;
}

.connection-type {
  display: grid;
  gap: 5px 3px;
  grid-template-rows: max-content;
}

.connection-type.two {
  grid-template-columns: max-content max-content;
}

.connection-type select { 
  width: fit-content;
}
</style>
