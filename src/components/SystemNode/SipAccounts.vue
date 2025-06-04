<template>
  <div class="component-detail">
    <tool-bar v-if="$store.state.user?.userRights.sipAccountEdit">
      <div :class="['button', 'fas', 'fa-plus-circle']" title="Добавить..." @click="onAddClick" />
      <div :class="['button', 'fas', 'fa-times-circle', { disabled: !hasSelected }]" title="Удалить" @click="onDeleteClick" />
    </tool-bar>
    <div class="table-grid" :style="{ 'grid-template-columns': `repeat(${$store.state.user?.userRights.sipAccountEdit ? 12 : 11}, max-content)` }">
      <header class="header" v-if="$store.state.user?.userRights.sipAccountEdit"><input type="checkbox" v-model="all" @change="changeAll" /></header>
      <header class="header" />
      <header class="header">Наименование</header>
      <header class="header">SIP-сервер</header>
      <header class="header">SIP-прокси</header>
      <header class="header">Имя пользователя</header>
      <header class="header">Имя регистрации</header>
      <header class="header">Домен</header>
      <header class="header">STUN-сервер</header>
      <header class="header">Количество запросов</header>
      <header class="header">Протокол</header>
      <header class="header">Тайм-аут регистрации</header>
      <div v-for="(r, index) in localItems" :key="index" class="table-row">
        <span class="cell" v-if="$store.state.user?.userRights.sipAccountEdit">
          <input type="checkbox" v-model="r.checked" />
        </span>
        <span class="cell icon">
          <span :class="`fas ${r.image} clickable-icon`" title="Просмотр..." @click="viewClick(r)" />
        </span>
        <span class="cell">{{ r.name }}</span>
        <span class="cell">{{ r.registrarServer }}</span>
        <span class="cell">{{ r.proxyServer }}</span>
        <span class="cell">{{ r.userName }}</span>
        <span class="cell">{{ r.authenticationName }}</span>
        <span class="cell">{{ r.domain }}</span>
        <span class="cell">{{ r.stunServer }}</span>
        <span class="cell">{{ r.countThread }}</span>
        <span class="cell">{{ r.protocol ? 'UDP' : 'TCP' }}</span>
        <span class="cell">{{ r.expires }}</span>
      </div>
    </div>
    <pager-component v-bind="pageInfo" @go="onChangePage" />
    <transition-group>
      <props-component
        v-if="component"
        v-bind="{ uuid: component.item.uuid, image: component.item.image, text: `SIP-аккаунт: ${component.item.name}` }"
        :key="0"
      >
        <sip-account-component v-bind="component" @saved="onSaved" @changed="onChanged" />
      </props-component>
      <wizard v-if="wizard" v-bind="wizard" @cancel="onWizardCancel" @end="onWizardEnd" :key="1" />
    </transition-group>
  </div>
</template>

<script lang="ts">
import { SipAccount, SipAccountError } from '@/classes/sipAccount'
import { defineComponent, PropType, provide, watch } from 'vue'
import { setup } from '../Base/listComponent'

import PagerComponent from '../PagerComponent.vue'
import PropsComponent from '../PropsComponent.vue'
import ToolBar from '../ToolBar.vue'
import Wizard from '../Wizard.vue'
import SipAccountComponent from './SipAccount.vue'


const wizardAdd = (item: SipAccount, error: SipAccountError) => {
  return {
    name: 'add',
    component: {
      text: 'Создание SIP-аккаунта:',
      component: 'sipAccountProps',
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
    text: 'Удаление SIP-аккаунта:',
    component: 'message',
    data: {
      text: 'Вы действительно хотите удалить выбранные SIP-аккаунты?'
    }
  }
})

export default defineComponent({
  components: {
    PagerComponent,
    PropsComponent,
    SipAccountComponent,
    ToolBar,
    Wizard,
  },
  props: {
    items: {
      type: Array as PropType<Array<SipAccount>>,
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

    watch(
      () => props.items,
      value => (dataItems.value = value.map(r => new SipAccount(r))),
      { deep: true }
    )

    provide('sipAccounts', props)

    function onAddClick() {
      wizard.value = wizardAdd(new SipAccount({}), new SipAccountError({}))
    }

    function onDeleteClick() {
      wizard.value = wizardRemove()
    }

    return {
      all,
      changeAll,
      component,
      hasSelected,
      localItems,
      onAddClick,
      onChanged,
      onDeleteClick,
      onSaved,
      onWizardEnd,
      onWizardCancel,
      onChangePage,
      pageInfo,
      viewClick,
      wizard
    }
  }
})
</script>
