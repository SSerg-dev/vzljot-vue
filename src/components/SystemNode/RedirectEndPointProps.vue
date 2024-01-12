<template>
  <expantion-panel caption="Основные параметры" :resizable="false" class="fit">
    <div class="grid">
      <label>Наименование:</label>
      <input v-focus v-model.trim="localRedirectEndPoint.name" @input="onChange('name', localRedirectEndPoint.name)" type="text" maxlength="80" :class="{ 'validation-error': localError.name }" :title="localError.name" />
      <label>Сетевой адрес:</label>
      <input v-model.trim="localRedirectEndPoint.host" @input="onChange('host', localRedirectEndPoint.host)" type="text" maxlength="80" :class="{ 'validation-error': localError.host }" :title="localError.host" />
      <label>Порт:</label>
      <number-box v-model="localRedirectEndPoint.port" @update:modelValue="onChange('port', $event)" :min="0" :max="65535" />
    </div>
  </expantion-panel>
</template>

<script lang="ts">
import { defineComponent, inject, ref, watch } from 'vue'

import { RedirectEndPoint, RedirectEndPointError } from '../../classes/redirectEndPoint'

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
    const redirectEndPoints: { redirectEndPoints: Array<RedirectEndPoint> } | undefined = inject('redirectEndPoints')

    const localRedirectEndPoint = ref(new RedirectEndPoint(props.item))
    const localError = ref(new RedirectEndPointError(props.error))

    watch(
      () => props.item as RedirectEndPoint,
      value => localRedirectEndPoint.value = new RedirectEndPoint(value),
      { deep: true }
    )

    watch(
      () => props.error as RedirectEndPointError,
      value => localError.value = new RedirectEndPointError(value),
      { deep: true }
    )

    return {
      redirectEndPoints: redirectEndPoints?.redirectEndPoints,
      localRedirectEndPoint,
      localError
    }
  },
  methods: {
    onChange(prop: string, value: any) {
      this.$emit('changed', prop, value)
    },
    save() {
      this.localError = this.localRedirectEndPoint.validate(this.redirectEndPoints)
      if (!Object.keys(this.localError).some(k => this.localError[k as keyof RedirectEndPointError])) {
        this.$emit('changed', this.localRedirectEndPoint)
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
