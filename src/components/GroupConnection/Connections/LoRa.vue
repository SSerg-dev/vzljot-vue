<template>
  <div class="connection-type">
    <div class="connection-type two">
      <label>Сервер LoRa:</label>
      <select
        @change="onChange('serverLoRa', $event.target.value)"
        v-model="localServerLoRa"
        :class="{ 'validation-error': localError.serverLoRa }"
        :title="localError.serverLoRa"
      >
        <option v-for="r in group.loraServers" :key="r.id" :value="r.id">
          {{ r.name }}
        </option>
      </select>
    </div>

    <div class="connection-type two">
      <label>Идентификатор DevEUI (hex):</label> 
      <input
        @input="onChange('adapter', $event.target.value)"
        v-model="localAdapter"
        type="text"
        :class="{ 'validation-error': localError.adapter }"
        :title="localError.adapter"
        maxlength="16"
        style="width: 150px"
      />
    </div>

    <div class="connection-type two">
      <label>Тайм-аут:</label>
      <div
        class="connection-type"
        style="
          grid-template-columns: repeat(8, min-content);
          white-space: nowrap;
          align-items: baseline;
        "
      >
        <number-box
          @update:modelValue="
            onChange(
              'timeOut',
              (($event * 24 + localHours) * 60 + localMinutes) * 60 +
                localSeconds
            )
          "
          v-model="localDays"
          style="width: 30px"
          :min="0"
          :max="31"
          :class="{ 'validation-error': localError.timeOut }"
          :title="localError.timeOut"
        />
        <label>д.</label>
        <number-box
          @update:modelValue="
            onChange(
              'timeOut',
              ((localDays * 24 + $event) * 60 + localMinutes) * 60 +
                localSeconds
            )
          "
          v-model="localHours"
          style="width: 30px"
          :min="0"
          :max="23"
          :class="{ 'validation-error': localError.timeOut }"
          :title="localError.timeOut"
        />
        <label>ч.</label>
        <number-box
          @update:modelValue="
            onChange(
              'timeOut',
              ((localDays * 24 + localHours) * 60 + $event) * 60 + localSeconds
            )
          "
          v-model="localMinutes"
          style="width: 30px"
          :min="0"
          :max="59"
          :class="{ 'validation-error': localError.timeOut }"
          :title="localError.timeOut"
        />
        <label>мин.</label>
        <number-box
          @update:modelValue="
            onChange(
              'timeOut',
              ((localDays * 24 + localHours) * 60 + localMinutes) * 60 + $event
            )
          "
          v-model="localSeconds"
          style="width: 30px"
          :min="0"
          :max="59"
          :class="{ 'validation-error': localError.timeOut }"
          :title="localError.timeOut"
        />
        <label>сек.</label>
      </div>
    </div>
  </div>
</template>

<script>
import NumberBox from '../../Inputs/NumberBox.vue'

export default {
  components: {
    NumberBox,
  },
  props: {
    group: Object,
    error: Object,
  },
  data() {
    const { days, hours, minutes, seconds } = this.getTime(this.group.timeOut)

    return {
      localServerLoRa: this.group.serverLoRa,
      localAdapter: this.group.adapter,
      localDays: days,
      localHours: hours,
      localMinutes: minutes,
      localSeconds: seconds,
      localError: {
        adapter: null,
        timeOut: null,
        serverLoRa: null,
      },
    }
  },
  watch: {
    'group.serverLoRa'(value) {
      this.localServerLoRa = value
    },
    'group.adapter'(value) {
      if (value) {
        this.localAdapter = value
      }
    },
    '$store.state.equip.devEUI'(value) {
      if (value && +value !== -1) {
        this.localAdapter = value

        this.onChange('adapter', value)
      }
    },
    'group.timeOut'(value) {
      const { days, hours, minutes, seconds } = this.getTime(value)

      this.localDays = days
      this.localHours = hours
      this.localMinutes = minutes
      this.localSeconds = seconds
    },
    error(value) {
      Object.keys(this.localError).forEach((r) => (this.localError[r] = null))
      if (value) {
        Object.entries(value).forEach(([k, v]) => (this.localError[k] = v))
      }
    },
  },
  methods: {
    onChange(prop, value) {
      this.$emit('changed', prop, value)
    },
    getTime(value) {
      const days = Math.trunc(value / 60 / 60 / 24)
      const hours = Math.trunc(value / 60 / 60 - days * 24)
      const minutes = Math.trunc(value / 60 - hours * 60 - days * 24 * 60)
      const seconds = value - ((days * 24 + hours) * 60 + minutes) * 60

      return {
        days,
        hours,
        minutes,
        seconds,
      }
    },
  },
}
</script>
