<template>
  <div class="group-connection-type-grid">
    <expantion-panel
      v-show="component != 'None'"
      caption="Обработка архивных данных приборов"
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

    <div class="group-connection-type-grid">
      <check-box
        v-model="localNotMakeDelta"
        @update:modelValue="onChanged($event)"
        style="margin-left: 15px"
      >
        Не вычислять значение потребления из интегратора, если пустая предыдущая
        запись
      </check-box>
    </div>
  </div>
</template>

<script>
import ExpantionPanel from '@/components/ExpantionPanel.vue'
import CheckBox from '@/components/Inputs/CheckBox.vue'

export default {
  components: {
    ExpantionPanel,
    CheckBox,
  },
  props: {
    notMakeDelta: Boolean,
    error: Object,
  },
  data() {
    return {
      localNotMakeDelta: this.notMakeDelta,
    }
  },
  created() {},
  mounted() {},
  computed: {
    component() {
      return null
    },
    componentData() {
      return null
    },
  },
  watch: {
    notMakeDelta(value) {
      this.localNotMakeDelta = value
    },
    localNotMakeDelta(value) {
      this.$emit('changeConnectionGroupType', value)
    },
  },
  methods: {
    getData() {
      return this.componentData ? this.componentData.timeZone : null
    },
    onChanged(value) {
      this.$emit('onChangedNotMakeDelta', value)
    },
  },
}
</script>

<style>
.group-connection-type-grid {
  display: grid;
  gap: 0px 3px;
}
</style>
