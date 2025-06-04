<template>
  <div class="component-detail">
    <tool-bar v-if="$store.state.user?.userRights.loRaServerEdit">
      <div :class="['button', 'fas', 'fa-plus-circle']" title="Добавить..." @click="addClick" />
      <div :class="['button', 'fas', 'fa-times-circle', { disabled: !hasSelected }]" title="Удалить" @click="deleteClick" />
    </tool-bar>
    <div class="table-grid" :style="{ 'grid-template-columns': `repeat(${$store.state.user?.userRights.loRaServerEdit ? 5 : 4}, max-content)` }">
      <header class="header" v-if="$store.state.user?.userRights.loRaServerEdit"><input type="checkbox" v-model="all" @change="changeAll" /></header>
      <header class="header" />
      <header class="header">Наименование</header>
      <header class="header">Оператор</header>
      <header class="header">Адрес сервера</header>
      <div v-for="(r, index) in localItems" :key="index" class="table-row">
        <span class="cell" v-if="$store.state.user?.userRights.loRaServerEdit">
          <input type="checkbox" v-model="r.checked" />
        </span>
        <span class="cell icon">
          <span :class="`fas ${r.image} clickable-icon`" title="Просмотр..." @click="viewClick(r)" />
        </span>
        <span class="cell">{{ r?.name }}</span>
        <span class="cell">{{ loraTypes[r.operator]?.name }}</span>
        <span class="cell">{{ r.networkAddress }}</span>
      </div>
    </div>
    <pager-component v-bind="pageInfo" @go="onChangePage" />
    <transition-group>
      <props-component
        v-if="component"
        v-bind="{ uuid: component.item.uuid, image: component.item.image, text: `LoRa-сервер: ${component.item?.name}` }"
        :key="0"
      >
        <lora-server-component v-bind="component" @saved="onSaved" @changed="onChanged" />
      </props-component>
      <wizard v-if="wizard" v-bind="wizard" @cancel="onWizardCancel" @end="onWizardEnd" :key="1" />
    </transition-group>
  </div>
</template>

<script lang="ts">
import { LoraServer, LoraServerError, loraTypes } from '@/classes/loraServer'
import { setup } from '../Base/listComponent'
import { defineComponent, PropType, provide, reactive, watch } from 'vue'

import PagerComponent from '../PagerComponent.vue'
import PropsComponent from '../PropsComponent.vue'
import LoraServerComponent from './LoraServer.vue'
import ToolBar from '../ToolBar.vue'
import Wizard from '../Wizard.vue'

const wizardAdd = (item: LoraServer, error: LoraServerError) => {
  return {
    name: 'add',
    component: {
      text: 'Создание LoRa-сервера:',
      component: 'loraServerProps',
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
      text: 'Вы действительно хотите удалить выбранные серверы?'
    }
  }
})

export default defineComponent({
  components: {
    PagerComponent,
    PropsComponent,
    LoraServerComponent,
    ToolBar,
    Wizard,
  },
  props: {
    items: {
      type: Array as PropType<Array<LoraServer>>,
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
      loraServers: props.items
    })

    provide('loraServers', provider)

    watch(
      () => props.items,
      value => {
        dataItems.value = value.map(r => new LoraServer(r))
        provider.loraServers = dataItems.value
      },
      { deep: true }
    )

    function addClick() {
      wizard.value = wizardAdd(new LoraServer({}), new LoraServerError({}))
    }

    function deleteClick() {
      wizard.value = wizardRemove()
    }

    return {
      addClick,
      all,
      changeAll,
      component,
      deleteClick,
      hasSelected,
      localItems,
      loraTypes,
      onChanged,
      onChangePage,
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
