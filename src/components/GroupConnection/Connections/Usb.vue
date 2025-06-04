<template>
  <div class="connection-type">
    <div class="connection-type two">
      <label>Устройство:</label>
      <select
        @change="onChange('vspUsbDevice', localUsbDevice)"
        v-model="localUsbDevice"
        :class="{ 'validation-error': localError.vspUsbDevice }"
        :title="localError.vspUsbDevice"
      >
        <option
          v-for="(item, index) in localUsbDevices"
          :key="index"
          :value="item"
        >
          {{ item.text }}
        </option>
      </select>
    </div>
    <div class="connection-type two">
      <label>Тайм-аут (c):</label>
      <number-box
        @update:modelValue="onChange('timeOut', $event)"
        v-model="localTimeOut"
        style="width: 60px"
        :max="1000"
      />
    </div>
  </div>
</template>

<script>
import NumberBox from '@/components/Inputs/NumberBox.vue'
import { matchType } from '@/plugins/api'

export default {
  name: 'UsbDevice',
  props: {
    group: Object,
    error: Object,
  },
  components: { NumberBox },
  data() {
    return {
      localUsbDevices: this.group.vspUsbDevices,
      localUsbDevice: this.group.vspUsbDevice,

      selectedUsbDevice: this.group.vspUsbDevice,
      localTimeOut: this.group.timeOut,
      connectionTypes: matchType(this.$store.state.env.connectionTypes),
      localError: {
        vspUsbDevice: null,
      },
    }
  },
  watch: {
    'group.vspUsbDevices'(value) {
      this.localUsbDevices = value
    },
    'group.timeOut'(value) {
      this.localTimeOut = value
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

      if (prop === 'type') {
        this.$emit('changeConnectionType', value)
      }
    },
    getSelectedUsbDeviceIndex() {
      const usbDevices = this.localUsbDevices ?? []
      const selectedUsbDevice = this.localUsbDevice ?? {}

      return usbDevices.findIndex(
        (r) =>
          r.vspUsbDevice.name === selectedUsbDevice.vspUsbDevice?.name &&
          r.vspUsbDevice.vid === selectedUsbDevice.vspUsbDevice?.vid &&
          r.vspUsbDevice.pid === selectedUsbDevice.vspUsbDevice?.pid &&
          r.vspUsbDevice.serialNumber ===
            selectedUsbDevice.vspUsbDevice?.serialNumber
      )
    },
  },
  mounted() {
    const index = this.getSelectedUsbDeviceIndex()
    if (this.localUsbDevices[index]) {
      this.localUsbDevice = this.localUsbDevices[index]
    }
  },
}
</script>
