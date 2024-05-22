<template>
  <div class="component-detail">
    <preserver-component
      v-bind="{
        readOnly: !$store.state.user?.userRights.equipTypeEdit,
        saving,
        disabled: !hasChanges || loading || modificationEdit,
        loading,
      }"
      @saveClick="onSaveClick()"
    >
      <tabs>
        <tab text="Параметры">
          <equip-type-props
            v-bind="Object.assign(equipType, { error })"
            @change="onChangeProps"
          />
        </tab>
        <tab text="Исполнения">
          <modifications-list
            v-bind="{
              items: equipType.modifications,
              isPressure: equipType.isPressure,
              isTemperature: equipType.isTemperature,
              isVolume: equipType.isVolume,
              isWeight: equipType.isWeight,
            }"
            @edit="onEditModification"
            @add="onAddModification"
            @remove="onRemoveModification"
          />
        </tab>
      </tabs>
    </preserver-component>
    <transition-group>
      <wizard
        v-if="wizard"
        v-bind="wizard"
        @cancel="cancelWizard"
        @end="onWizardEnd"
        key="0"
      />
      <spinner :show="loading" :text="'Загрузка...'" key="1" />
    </transition-group>
  </div>
</template>

<script>
import EquipType from '../../classes/equipType'

import BaseComponent from '../Base/BaseComponent.vue'
import EquipTypeProps from './EquipTypeProps.vue'
import ModificationsList from './ModificationsList.vue'
import PreserverComponent from '../PreserverComponent.vue'
import Tab from '../Tabs/Tabx.vue'
import Tabs from '../Tabs/Tabs.vue'

export default {
  components: {
    EquipTypeProps,
    ModificationsList,
    PreserverComponent,
    Tab,
    Tabs,
  },
  extends: BaseComponent,
  data() {
    return {
      modificationEdit: false,
      equipType: new EquipType({}),
    }
  },
  async mounted() {
    try {
      await this.equipType.init(this.id)
    } catch (error) {
      store.commit('error', error)
    } finally {
      this.loading = false
    }
  },
  methods: {
    onChangeProps(prop, value) {
      this.equipType[prop] = value

      if (
        ['isTemperature', 'isPressure', 'isVolume', 'isWeight'].includes(prop)
      ) {
        this.equipType.modifications.forEach((r) => (r[prop] = value))
      }

      this.hasChanges = true
    },
    onEditModification(value) {
      this.modificationEdit = value
      this.hasChanges = true
    },
    onAddModification(modification) {
      this.equipType.addModification(modification)
      this.hasChanges = true
    },
    onRemoveModification(modifications) {
      this.equipType.removeModifications(modifications)
      this.hasChanges = true
    },
    async save() {
      try {
        this.saving = true

        this.error = {}

        await this.equipType.save()

        this.hasChanges = false
      } catch (error) {
        if (error.response.status === 551) {
          this.error = error.response.data
        } else {
          this.$store.commit('error', error)
        }
      } finally {
        this.saving = false
      }
    },
  },
}
</script>

<style></style>
