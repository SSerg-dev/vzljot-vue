<template>
  <div class="wrapper">
    <div class="component-detail">
      <tool-bar v-if="$store.state.user?.userRights.redirectEndpointEdit">
        <div :class="['button', 'fas', 'fa-plus-circle']" title="Добавить..." @click="addClick" />
        <div :class="['button', 'fas', 'fa-times-circle', { disabled: !hasSelected }]" title="Удалить" @click="deleteClick" />
      </tool-bar>
      <div
        class="table-grid"
        :style="{ 'grid-template-columns': `repeat(${$store.state.user?.userRights.redirectEndpointEdit ? 5 : 4}, max-content)` }"
      >
        <header class="header" v-if="$store.state.user?.userRights.redirectEndpointEdit">
          <input type="checkbox" v-model="all" @change="changeAll" />
        </header>
        <header class="header" />
        <header class="header">Наименование</header>
        <header class="header">Сетевой адрес</header>
        <header class="header">Порт</header>
        <div v-for="(r, index) in localItems" :key="index" class="table-row">
          <span class="cell" v-if="$store.state.user?.userRights.redirectEndpointEdit">
            <input type="checkbox" v-model="r.checked" />
          </span>
          <span class="cell icon">
            <span :class="`fas ${r.image} clickable-icon`" title="Просмотр..." @click="viewClick(r)" />
          </span>
          <span class="cell">{{ r.name }}</span>
          <span class="cell">{{ r.host }}</span>
          <span class="cell">{{ r.port }}</span>
        </div>
      </div>
      <pager-component v-bind="pageInfo" @go="onChangePage" />
      <transition-group>
        <props-component
          v-if="component"
          v-bind="{ uuid: component.item.uuid, image: component.item.image, text: `Конечная точка перенаправления: ${component.item.name}` }"
          :key="0"
        >
          <redirect-end-point-component v-bind="component" @saved="onSaved" @changed="onChanged" />
        </props-component>
        <wizard v-if="wizard" v-bind="wizard" @cancel="onWizardCancel" @end="onWizardEnd" :key="1" />
      </transition-group>
    </div>
    <expantion-panel caption="Настройки перенаправления" :resizable="false" class="fit">
      <div class="redirect">
        <label>Включить перенаправление для известных:</label>
        <select v-model="localRedirectEndPointProperties.redirectEndPointIdKnown" @change="onEndPointPropertiesChanged">
          <option :value="undefined">(Нет)</option>
          <option v-for="(r, index) in items" :key="index" :value="r.uuid">{{ r.name }}</option>
        </select>
        <label>Включить перенаправление для неизвестных:</label>
        <select v-model="localRedirectEndPointProperties.redirectEndPointIdUnknown" @change="onEndPointPropertiesChanged">
          <option :value="undefined">(Нет)</option>
          <option v-for="(r, index) in items" :key="index" :value="r.uuid">{{ r.name }}</option>
        </select>
      </div>
    </expantion-panel>
  </div>
</template>

<script lang="ts">
import { RedirectEndPoint, RedirectEndPointError } from '@/classes/redirectEndPoint'
import { RedirectEndPointProperties } from '@/classes/redirectEndPointProperties'
import { setup } from '../Base/listComponent'
import { defineComponent, PropType, provide, reactive, ref, watch } from 'vue'

import ExpantionPanel from '../ExpantionPanel.vue'
import PagerComponent from '../PagerComponent.vue'
import PropsComponent from '../PropsComponent.vue'
import RedirectEndPointComponent from './RedirectEndPoint.vue'
import ToolBar from '../ToolBar.vue'
import Wizard from '../Wizard.vue'

const wizardAdd = (item: RedirectEndPoint, error: RedirectEndPointError) => {
  return {
    name: 'add',
    component: {
      text: 'Создание точки перенаправления:',
      component: 'redirectEndPointProps',
      event: 'changed',
      data: {
        item,
        error
      }
    }
  }
}

const wizardRemove = () => ({
  name: 'remove',
  component: {
    text: 'Удаление точки перенаправления:',
    component: 'message',
    data: {
      text: 'Вы действительно хотите удалить выбранные точки?'
    }
  }
})

export default defineComponent({
  components: {
    ExpantionPanel,
    PagerComponent,
    PropsComponent,
    RedirectEndPointComponent,
    ToolBar,
    Wizard,
  },
  props: {
    items: {
      type: Array as PropType<Array<RedirectEndPoint>>,
      required: true
    },
    redirectEndPointProperties: {
      type: Object as PropType<RedirectEndPointProperties>,
      required: true
    }
  },
  setup(props, { emit }) {
    const {
      all,
      changeAll,
      component,
      dataItems,
      hasSelected,
      localItems,
      onChanged,
      onChangePage,
      onSaved,
      onWizardCancel,
      onWizardEnd,
      pageInfo,
      viewClick,
      wizard
    } = setup(props.items, emit)
    
    const provider = reactive({
      redirectEndPoints: props.items
    })

    provide('redirectEndPoints', provider)

    const localRedirectEndPointProperties = ref(new RedirectEndPointProperties(props.redirectEndPointProperties))

    watch(
      () => props.items,
      value => {
        dataItems.value = value.map(r => new RedirectEndPoint(r))
        provider.redirectEndPoints = dataItems.value
      },
      { deep: true }
    )

    watch(
      () => props.redirectEndPointProperties,
      value => (localRedirectEndPointProperties.value = new RedirectEndPointProperties(value)),
      { deep: true }
    )

    function addClick() {
      wizard.value = wizardAdd(new RedirectEndPoint({}), new RedirectEndPointError({}))
    }

    function deleteClick() {
      wizard.value = wizardRemove()
    }

    function onEndPointPropertiesChanged() {
      emit('endPointPropertiesChanged', localRedirectEndPointProperties.value)
    }

    return {
      addClick,
      all,
      changeAll,
      component,
      deleteClick,
      hasSelected,
      localItems,
      localRedirectEndPointProperties,
      onChanged,
      onChangePage,
      onEndPointPropertiesChanged,
      onSaved,
      onWizardCancel,
      onWizardEnd,
      pageInfo,
      viewClick,
      wizard
    }
  }
})
</script>

<style scoped>
.wrapper {
  position: relative;
  display: grid;
  gap: 3px;
  grid-template-rows: 1fr min-content;
  overflow: auto;
  flex: 1;
}

.redirect {
  display: grid;
  gap: 3px 5px;
  grid-template-columns: max-content 1fr;
}

.redirect label {
  text-align: end;
}
</style>
