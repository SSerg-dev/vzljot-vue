<template>
  <div class="component-detail">
    <preserver-component
      v-bind="{
        readOnly: modification.isSystem,
        disabled: !hasChanges,
        saving,
      }"
      @saveClick="onSaveClick()"
    >
      <modification-props v-bind="localModification" @changed="onChange" />
    </preserver-component>
  </div>
</template>

<script>
import ModificationProps from './ModificationProps.vue'
import PreserverComponent from '../PreserverComponent.vue'

export default {
  components: {
    ModificationProps,
    PreserverComponent,
  },
  props: {
    modification: Object,
  },
  data() {
    return {
      saving: false,
      hasChanges: false,
      localModification: JSON.parse(JSON.stringify(this.modification)),
    }
  },
  watch: {
    modification: {
      handler(value) {
        this.localModification = JSON.parse(JSON.stringify(value))
      },
      deep: true,
    },
  },
  methods: {
    onChange(name, value) {
      this.localModification[name] = value
      this.hasChanges = true
    },
    onSaveClick() {
      this.saving = true

      this.$emit('changed', this.localModification)

      this.saving = false
      this.hasChanges = false
    },
  },
}
</script>
