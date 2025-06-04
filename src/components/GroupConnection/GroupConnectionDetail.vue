<template>
  <div class="fit">
    <expantion-panel caption="Основные параметры" :resizable="false">
      <div class="group-connection-grid">
        <label>Наименование:</label>
        <input
          v-model="localGroup.name"
          type="text"
          @input="onChange('name', localGroup.name)"
          maxlength="80"
          :class="{ 'validation-error': localError.name }"
          :title="localError.name"
        />
        <connection-type
          v-bind="groupConnectionData"
          @typeChanged="onChange"
          @groupChanged="onGroupChanged"
          style="grid-column: span 2"
        />
      </div>
    </expantion-panel>
  </div>
</template>

<script>
import { GroupConnection } from '@/classes/groupConnection'

import ConnectionType from './ConnectionType.vue'
import ExpantionPanel from '../ExpantionPanel.vue'

export default {
  components: {
    ConnectionType,
    ExpantionPanel,
  },
  props: {
    group: {
      type: Object,
      default: () => new GroupConnection({}),
    },
    error: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      localGroup: new GroupConnection(this.group),
      localError: JSON.parse(JSON.stringify(this.error)),
    }
  },
  created() {
    this.$watch(
      () => this.group,
      (value) => (this.localGroup = new GroupConnection(value)),
      { deep: true }
    )

    this.$watch(
      () => this.error,
      (value) => (this.localError = value)
    )
  },
  computed: {
    groupConnectionData() {
      return {
        groupType: this.localGroup.groupType,
        connectionTypes: this.localGroup.connectionTypes,
        error: this.localError.component,
      }
    },
  },
  mounted() {
    try {
      if (this.localGroup.systemNode) {
        this.localGroup.create()
      }
    } catch (error) {
      this.$store.commit('error', error)
    }
  },
  methods: {
    onChange(prop, value) {
      this.localGroup[prop] = value
      this.$emit('changed', prop, value)
    },
    onGroupChanged() {
      this.$emit('changed')
    },
    async save() {
      try {
        await this.localGroup.save()

        return true
      } catch (error) {
        if (error.response?.status !== 552) {
          if (error.response?.status === 551) {
            this.localError = error.response.data
          } else {
            this.$store.commit('error', error)
          }
        }
      }
    },
  },
}
</script>

<style scoped>
.group-connection-grid {
  display: grid;
  grid-gap: 5px 3px;
  grid-template-columns: auto 1fr;
  min-width: 450px;
}

.group-connection-grid > label {
  text-align: right;
}
</style>
