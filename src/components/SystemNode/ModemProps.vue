<template>
  <expantion-panel caption="Основные параметры" :resizable="false" class="fit">
    <form class="grid" autocomplete="off">
      <label>Наименование:</label>
      <input
        v-focus
        v-model.trim="localModem.name"
        @input="onChange('name', localModem.name)"
        type="text"
        maxlength="80"
        :class="{ 'validation-error': localError.name }"
        :title="localError.name"
      />
      <label>Порт:</label>
      <select
        v-model="localModem.comPort"
        @change="onChange('comPort', localModem.comPort)"
        :class="{ 'validation-error': localError.port }"
        :title="localError.port"
      >
        <option
          v-for="port in localPorts"
          :key="port.number"
          :value="port.number"
        >
          {{ port.name }}
        </option>
      </select>
      <label>Скорости обмена:</label>
      <div style="display: grid; gap: 3px">
        <div style="display: grid; grid-template-columns: auto auto; gap: 10px">
          <radio
            :label="true"
            v-model="allSpeeds"
            @update:modelValue="onAllSpeedsChange"
            >все</radio
          >
          <radio
            :label="false"
            v-model="allSpeeds"
            @update:modelValue="onAllSpeedsChange"
            >выделенные</radio
          >
        </div>
        <div :class="{ 'grid-speed': true, error: localError.speed }">
          <label 
            class="grid-speed-row clickable-label"
            v-for="(r, i) in comPortSpeeds"
            :key="i"
            :title="localError.speed"
          >
            <input
              v-model="localModem.comSpeeds"
              @change="onSpeedsChange"
              :value="r"
              :disabled="allSpeeds"
              type="checkbox"
            />

            <span class="speed-caption" :disabled="allSpeeds">{{ r }}</span>
          </label>

        </div>
      </div>
      <label>Строка инициализации модема:</label>
      <input
        v-model.trim="localModem.modemInitString"
        @input="onChange('modemInitString', localModem.modemInitString)"
        type="text"
        maxlength="255"
      />
    </form>
  </expantion-panel>
</template>

<script lang="ts">
import { Modem, ModemError } from '@/classes/modem'
import { Port } from '@/classes/systemNode'
import { defineComponent, inject, PropType, ref, Ref, watch } from 'vue'

import ExpantionPanel from '../ExpantionPanel.vue'
import Radio from '../Inputs/Radio.vue'

export default defineComponent({
  components: {
    ExpantionPanel,
    Radio,
  },
  props: {
    modem: {
      type: Object as PropType<Modem>,
      required: true,
    },
    error: {
      type: Object as PropType<ModemError>,
      required: true,
    },
    modems: {
      type: Array as PropType<Array<Modem>>,
    },
  },
  setup(props, { emit }) {
    const comPortSpeeds = inject<Ref<Array<number>>>('comPortSpeeds')
    const serialPort = inject<Ref<number>>('serialPort')
    const serialPorts = inject<Ref<Array<Port>>>('serialPorts')

    const localModem = ref(new Modem(props.modem))
    const localError = ref(new ModemError(props.error))

    const localPorts: Array<Port> = JSON.parse(
      JSON.stringify(serialPorts?.value)
    )

    if (!localPorts.some((r) => r.number === localModem.value.comPort)) {
      localPorts.push({
        name: `COM${localModem.value.comPort} (н/д)`,
        number: localModem.value.comPort,
      })
      localPorts.sort((a, b) => {
        if (a.number < b.number) return -1
        if (a.number > b.number) return 1
        return 0
      })
    }

    const allSpeeds = ref(localModem.value.comSpeeds === undefined)

    if (serialPort && !localModem.value.comPort) {
      localModem.value.comPort = serialPort.value
    }

    watch(
      () => props.modem,
      (value) => (localModem.value = new Modem(value)),
      { deep: true }
    )

    watch(
      () => props.error as ModemError,
      (value) => (localError.value = new ModemError(value)),
      { deep: true }
    )

    const onChange = (prop: string, value: any) => {
      emit('changed', prop, value)
    }

    const onAllSpeedsChange = (value: boolean) => {
      localModem.value.comSpeeds = value ? undefined : []
      onChange('comSpeeds', localModem.value.comSpeeds)
    }

    const onSpeedsChange = () => {
      onChange('comSpeeds', localModem.value.comSpeeds)
    }

    function save() {
      localError.value = localModem.value.validate(props.modems)

      if (Object.keys(localError.value).length === 0) {
        emit('changed', localModem.value)
        return true
      }
      return false
    }

    return {
      allSpeeds,
      comPortSpeeds,
      localModem,
      localError,
      localPorts,
      onAllSpeedsChange,
      onChange,
      onSpeedsChange,
      save,
    }
  },
})
</script>

<style scoped>
.grid {
  display: grid;
  gap: 5px 3px;
  grid-template-columns: auto 1fr;
}

.grid label {
  text-align: left;
}

.grid select {
  width: fit-content;
}

.grid-speed,
.grid-speed-row {
  display: grid;
  gap: 3px 5px;
  align-items: center;
  user-select: none;
}

.grid-speed-row {
  grid-template-columns: auto 1fr;
}

.grid-speed.error {
  color: #f00;
}

.grid-speed .speed-caption[disabled='true'] {
  opacity: 0.5;
}
.grid-speed input[type='checkbox'] {
  cursor: pointer;
}

.grid-speed .speed-caption[disabled='true']:hover {
  background-color: #ecf0f6; 
  cursor: not-allowed; 
}
.clickable-label {
  cursor: pointer;
}
.clickable-label:hover {
  background-color: #ecf0f6;
  cursor: pointer;
}
.check-box input {
  cursor: pointer;
}
</style>
