<template>
  <div class="component-detail">
    <tabs>
      <tab text="Мнемосхема">
        <symbol-schema v-bind="{ id, purposeGroup, equipId }" />
      </tab>
      <tab v-if="purposeGroup === SetTypes.EquipGroup" text="Приборы">
        <preserver-component
          v-bind="{ readOnly: !$store.state.user?.userRights.setEdit || isSystem, saving, disabled: !hasChanges || loading, loading }"
          @saveClick="save()"
        >
          <symbol-schema-equips v-bind="{ items: localItem.equips }" @add="onAddEquipClick" @remove="onRemoveEquipClick" />
        </preserver-component>
        <transition>
          <wizard v-if="wizardEquip" v-bind="wizardEquip" @cancel="onWizardEquipCancel" @end="onWizardEquipEnd" />
        </transition>
      </tab>
      <tab text="Настройки">
        <preserver-component v-bind="{ readOnly, saving, disabled: !hasChanges || loading, loading }" @saveClick="save()">
          <symbol-schema-detail v-bind="{ schema: localItem, error: localError }" @changed="onChanged" />
        </preserver-component>
      </tab>
    </tabs>
    <transition-group>
      <wizard v-if="wizard" v-bind="wizard" @cancel="onWizardCancel" @end="onWizardEnd" key="0" />
      <spinner :show="loading" :text="'Загрузка...'" key="1" />
    </transition-group>
  </div>
</template>

<script lang="ts">
import { axios as http } from '../../plugins/axios'
import { store } from '@/store/store'
import { Schema, SchemaError } from '@/classes/schema'

import PreserverComponent from '../PreserverComponent.vue'
import SymbolSchema from './SymbolSchema.vue'
import SymbolSchemaDetail from './SymbolSchemaDetail.vue'
import SymbolSchemaEquips from './SymbolSchemaEquips.vue'
import Tab from '../Tabs/Tabx.vue'
import Tabs from '../Tabs/Tabs.vue'
import Wizard from '../Wizard.vue'
import { computed, defineComponent, PropType, ref } from 'vue'
import { setupComponent } from '../Base/baseComponent'
import { SetTypes } from '@/classes/enum/enum'

export default defineComponent({
  name: 'schemaComponent',
  components: {
    PreserverComponent,
    SymbolSchema,
    SymbolSchemaDetail,
    SymbolSchemaEquips,
    Tab,
    Tabs,
    Wizard
  },
  props: {
    uuid: {
      type: String as PropType<string>,
      required: true
    },
    id: {
      type: Number as PropType<number>,
      required: true
    },
    equipId: Number as PropType<number>,
    purposeGroup: Number as PropType<number>
  },
  setup(props, { emit }) {
    const { hasChanges, loading, localItem, localError, onChanged, onWizardCancel, onWizardEnd, save, saving, wizard } = setupComponent<Schema, SchemaError>(
      new Schema({ id: props.id, uuid: props.uuid }),
      new SchemaError({}),
      emit
    )

    const wizardEquip = ref<any>()

    const readOnly = computed(
      () => !store.state.user?.userRights.setEdit || (localItem.value.isSystem && localItem.value.purposeGroup === SetTypes.None)
    )

    function onAddEquipClick() {
      wizardEquip.value = {
        name: 'add',
        component: {
          text: 'Выберите прибор',
          component: 'selector',
          event: 'selectionChanged',
          data: {
            loader: async () => {
              const { data } = await http.get<Array<{ id: number; type: number; name: string; connectionGroupType: number; state: number }>>(
                'symbolSchema/equips'
              )
              return data.filter(r => !localItem.value.equips.map(r => r.id).includes(r.id))
            },
            searchColumn: 'name',
            columns: [
              {
                prop: 'name',
                text: 'Наименование'
              }
            ]
          }
        }
      }
    }

    function onRemoveEquipClick() {
      wizardEquip.value = {
        name: 'remove',
        component: {
          text: 'Удаление приборов:',
          component: 'message',
          data: {
            text: 'Вы действительно хотите удалить выбранные приборы?'
          }
        }
      }
    }

    function onWizardEquipCancel() {
      wizardEquip.value = null
    }

    function onWizardEquipEnd(data: Array<{ id: number; type: number; name: string; connectionGroupType: number; state: number }>, name: string) {
      wizardEquip.value = null

      if (name === 'remove') {
        localItem.value.equips = localItem.value.equips.filter(r => r.checked !== true)
      } else if (name === 'add') {
        data.forEach(r =>
          localItem.value.equips.push({
            id: r.id,
            type: r.type,
            name: r.name,
            state: r.state,
            connectionGroupType: r.connectionGroupType,
            checked: false
          })
        )
      }
    }

    return {
      hasChanges,
      loading,
      localError,
      localItem,
      onChanged,
      onAddEquipClick,
      onRemoveEquipClick,
      onWizardCancel,
      onWizardEnd,
      onWizardEquipCancel,
      onWizardEquipEnd,
      readOnly,
      saving,
      save,
      SetTypes,
      wizard,
      wizardEquip
    }
  }
})
</script>
