<template>
  <div class="component-detail">
    <preserver-component v-bind="{ readOnly: code !== 'unknown', saving, disabled: !hasChanges || loading, loading }" @saveClick="save()">
      <tabs>
        <tab text="Параметры">
          <user-group-props v-bind="{ group: localItem, error: localError }" @change="onChanged" />
        </tab>
        <tab text="Права доступа">
          <user-rights v-bind="{ userRights: getRights(), disabled: disabled }" @changeAllow="onChangeAllow" @changeDeny="onChangeDeny" />
        </tab>
      </tabs>
    </preserver-component>
    <transition-group>
      <wizard v-if="wizard" v-bind="wizard" @cancel="onWizardCancel" @end="onWizardEnd" key="0" />
      <spinner :show="loading" :text="'Загрузка...'" key="1" />
    </transition-group>
  </div>
</template>

<script lang="ts">
import { store } from '@/store/store'
import { computed, defineComponent, PropType } from 'vue'

import { UserGroup, UserGroupError } from '@/classes/userGroup'

import PreserverComponent from '../PreserverComponent.vue'
import UserGroupProps from './UserGroupProps.vue'
import Tabs from '../Tabs/Tabs.vue'
import Tab from '../Tabs/Tab.vue'
import UserRights from './UserRights.vue'
import Wizard from '../Wizard.vue'
import { setupComponent } from '../Base/baseComponent'

export default defineComponent({
  components: {
    PreserverComponent,
    UserGroupProps,
    UserRights,
    Tabs,
    Tab,
    Wizard
  },
  props: {
    id: {
      type: Number as PropType<number>,
      required: true
    },
    code: {
      type: String as PropType<string>,
      required: true
    },
    uuid: {
      type: String as PropType<string>,
      required: true
    }
  },
  setup(props, { emit }) {
    const { hasChanges, loading, localItem, localError, onChanged, onWizardCancel, onWizardEnd, save, saving, wizard } = setupComponent<
      UserGroup,
      UserGroupError
    >(new UserGroup({ id: props.id, uuid: props.uuid }), new UserGroupError({}), emit)

    const disabled = computed(() => (localItem.value ? localItem.value.code !== 'unknown' : true))
    const isModerator = computed(() => (localItem.value === null ? false : localItem.value.code === 'admin' || localItem.value.code === 'moderator'))

    function getRights() {
      if (localItem.value.rights) {
        const keys = Object.keys(localItem.value.rights).filter(r => {
          switch (r) {
            case 'userEdit':
              return isModerator.value
            case 'dataExport':
              return isModerator.value
            case 'schemeEdit':
              return store.state.user?.userRights.allowSchemes
            case 'redirectEndpointEdit':
              return store.state.user?.userRights.redirectEndpointEdit
            case 'loRaServerEdit':
              return store.state.user?.userRights.allowLoRa
            default:
              return true
          }
        })

        return Object.assign({}, ...keys.map(r => ({ [r]: localItem.value.rights ? localItem.value.rights[r] : undefined })))
      }
    }

    function onChangeAllow(key: string | undefined, value: boolean): void {
      if (localItem.value.rights && key) {
        if (value === true) {
          const parent = localItem.value.rights[key].parent
          if (parent) {
            if (!localItem.value.rights[parent].allow) {
              onChangeAllow(parent, true)
            }
          }

          localItem.value.rights[key].deny = false
        }
        localItem.value.rights[key].allow = value
        hasChanges.value = true
      }
    }

    function onChangeDeny(key: string | undefined, value: boolean) {
      if (localItem.value.rights && key) {
        if (value === false) {
          const parent = localItem.value.rights[key].parent
          if (parent) {
            if (localItem.value.rights[parent].deny) {
              onChangeDeny(parent, false)
            }
          }
        } else {
          localItem.value.rights[key].allow = false
          Object.values(localItem.value.rights)
            .filter(r => r.parent === key)
            .forEach(r => {
              r.deny = true
              r.allow = false
            })
        }
        localItem.value.rights[key].deny = value

        hasChanges.value = true
      }
    }

    return {
      disabled,
      getRights,
      hasChanges,
      isModerator,
      loading,
      localError,
      localItem,
      onChangeAllow,
      onChangeDeny,
      onChanged,
      onWizardCancel,
      onWizardEnd,
      saving,
      save,
      wizard
    }
  }
})
</script>
