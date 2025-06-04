<template>
  <expantion-panel caption="Основные параметры" :resizable="false" class="fit">
    <form class="grid" autocomplete="off">
      <label>Наименование:</label>
      <input v-focus v-model.trim="localSipAccount.name" @input="onChange('name', localSipAccount.name)" type="text" maxlength="80" :class="{ 'validation-error': localError.name }" :title="localError.name" />
      <label>SIP-сервер:</label>
      <input v-model.trim="localSipAccount.registrarServer" @input="onChange('registrarServer', localSipAccount.registrarServer)" type="text" maxlength="80" :class="{ 'validation-error': localError.registrarServer }" :title="localError.registrarServer" />
      <label>SIP-прокси:</label>
      <input v-model.trim="localSipAccount.proxyServer" @input="onChange('proxyServer', localSipAccount.proxyServer)" type="text" maxlength="80" />
      <label>Имя пользователя:</label>
      <input v-model.trim="localSipAccount.userName" @input="onChange('userName', localSipAccount.userName)" type="text" maxlength="80" :class="{ 'validation-error': localError.userName }" :title="localError.userName" />
      <label>Имя регистрации:</label>
      <input v-model.trim="localSipAccount.authenticationName" @input="onChange('authenticationName', localSipAccount.authenticationName)" type="text" autocomplete="name" maxlength="80" :class="{ 'validation-error': localError.authenticationName }" :title="localError.authenticationName" />
      <label>Пароль:</label>
      <input v-model.trim="localSipAccount.password" @input="onChange('password', localSipAccount.password)" type="password" autocomplete="new-password" maxlength="80" />
      <label>Домен:</label>
      <input v-model.trim="localSipAccount.domain" @input="onChange('domain', localSipAccount.domain)" type="text" maxlength="80" />
      <label>STUN-сервер:</label>
      <input v-model.trim="localSipAccount.stunServer" @input="onChange('stunServer', localSipAccount.stunServer)" type="text" maxlength="80" />
      <label>Количество запросов:</label>
      <number-box v-model="localSipAccount.countThread" @update:modelValue="onChange('countThread', $event)" :min="1" />
      <label>Протокол:</label>
      <select v-model="localSipAccount.protocol" @change="onChange('protocol', localSipAccount.protocol)">
        <option :value="0">TCP</option>
        <option :value="1">UDP</option>
      </select>
      <label>Тайм-аут регистрации:</label>
      <number-box v-model="localSipAccount.expires" @update:modelValue="onChange('expires', $event)" :min="0" />
    </form>
  </expantion-panel>
</template>

<script lang="ts">
import { defineComponent, inject, ref, watch } from 'vue'

import { ISipAccountsProps, SipAccount, SipAccountError } from '../../classes/sipAccount'

import ExpantionPanel from '../ExpantionPanel.vue'
import NumberBox from '../Inputs/NumberBox.vue'

export default defineComponent({
  components: {
    ExpantionPanel,
    NumberBox
  },
  props: {
    item: {
      type: Object,
      required: true
    },
    error: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const sipAccounts = inject<ISipAccountsProps>('sipAccounts')
    const localSipAccount = ref(new SipAccount(props.item))
    const localError = ref(new SipAccountError(props.error))

    watch(
      () => props.item as SipAccount,
      value => localSipAccount.value = new SipAccount(value),
      { deep: true }
    )

    watch(
      () => props.error as SipAccountError,
      value => localError.value = new SipAccountError(value),
      { deep: true }
    )

    return {
      sipAccounts,
      localSipAccount,
      localError
    }
  },
  methods: {
    onChange(prop: string, value: any) {
      this.$emit('changed', prop, value)
    },
    save() {
      this.localError = this.localSipAccount.validate(this.sipAccounts?.items)
      if (!Object.keys(this.localError).some(k => this.localError[k as keyof SipAccountError])) {
        this.$emit('changed', this.localSipAccount)
        return true
      }
      return false
    }
  }
})
</script>

<style scoped>
.grid {
  display: grid;
  gap: 5px 3px;
  grid-template-columns: auto 1fr;
}

.grid label {
  text-align: right;
}

.grid select {
  width: fit-content;
}

.grid .numberbox {
  width: 60px;
}
</style>
