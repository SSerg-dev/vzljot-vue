<template>
  <expantion-panel caption="Основные параметры" :resizable="false" class="fit" style="min-width: 450px; max-width: 450px;">
    <form class="grid" autocomplete="off">
      <label>Наименование:</label>
      <input v-focus v-model.trim="localLoraServer.name" @input="onChange('name', localLoraServer.name)" type="text" maxlength="80" :class="{ 'validation-error': localError.name }" :title="localError.name" />
      <label>Оператор:</label>
      <select v-model="localLoraServer.operator" @change="onChangeOperator(localLoraServer.operator)" :class="{ 'validation-error': localError.operator }" :title="localError.operator">
        <option v-for="[k, v] in Object.entries(loraTypes)" :key="k" :value="k">{{ v.name }}</option>
      </select>
      <label>Адрес сервера:</label>
      <input v-model.trim="localLoraServer.networkAddress" @input="onChange('networkAddress', localLoraServer.networkAddress)" type="text" maxlength="200" :class="{ 'validation-error': localError.networkAddress }" :title="localError.networkAddress" />
      <template v-if="localLoraServer.operator !== 'vega'">
        <label>Токен авторизации:</label>
        <textarea v-model="localLoraServer.token" @input="onChange('token', localLoraServer.token)" cols="50" rows="10" placeholder="Введите токен авторизации"></textarea>
      </template>
      <template v-else>
        <label>Пользователь:</label>
        <input v-model.trim="localLoraServer.userName" @input="onChange('userName', localLoraServer.userName)" type="text" autocomplete="name" maxlength="80" :class="{ 'validation-error': localError.userName }" :title="localError.userName" />
        <label>Пароль:</label>
        <input v-model.trim="localLoraServer.password" @input="onChange('password', localLoraServer.password)" type="password" autocomplete="new-password" maxlength="80" />
      </template>
    </form>
  </expantion-panel>
</template>

<script lang="ts">
import { LoraServer, LoraServerError, loraTypes } from '@/classes/loraServer'
import { defineComponent, inject, PropType, ref, watch } from 'vue'

import ExpantionPanel from '../ExpantionPanel.vue'

export default defineComponent({
  components: {
    ExpantionPanel
  },
  props: {
    item: {
      type: Object as PropType<LoraServer>,
      required: true
    },
    error: {
      type: Object as PropType<LoraServerError>,
      required: true
    }
  },
  setup(props, { emit }) {
    const provider = inject<{ loraServers: Array<LoraServer> }>('loraServers')

    const localLoraServer = ref(new LoraServer(props.item))
    const localError = ref(new LoraServerError(props.error))

    let operator = localLoraServer.value.operator

    watch(
      () => props.item as LoraServer,
      value => (localLoraServer.value = new LoraServer(value)),
      { deep: true }
    )

    watch(
      () => props.error as LoraServerError,
      value => (localError.value = new LoraServerError(value)),
      { deep: true }
    )

    function save(): boolean {
      localError.value = localLoraServer.value.validate(provider?.loraServers)
      if (!Object.keys(localError.value).some(k => localError.value[k as keyof LoraServerError])) {
        emit('changed', localLoraServer.value)
        return true
      }
      return false
    }

    function onChangeOperator(value: keyof(typeof loraTypes)) {
      if (localLoraServer.value.networkAddress === loraTypes[operator].url) {
        localLoraServer.value.networkAddress = loraTypes[value].url
        emit('changed', 'networkAddress', loraTypes[value].url)
      }

      emit('changed', 'operator', value)

      operator = value
    }  
    
    function onChange(prop: string, value: any) {
      emit('changed', prop, value)
    }

    return {
      loraTypes,
      localLoraServer,
      localError,
      onChange,
      onChangeOperator,
      save
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
