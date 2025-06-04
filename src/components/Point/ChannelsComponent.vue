<template>
  <div
    class="channels-wrapper"
    v-if="point.channels.length > 0 || Object.keys(point.groups).length > 0"
  >
    <expantion
      ref="expantion"
      caption="Соответствие каналов точки учета приборным"
      :staticHeight="false"
      :opened="false"
      :largeWidth="true"
    >
      <table ref="table" class="table-params">
        <thead>
          <tr class="header" :style="$store.getters.styleColors">
            <th>Канал точки учета</th>
            <th
              v-for="key in Object.keys(point.groups)"
              :key="point.groups[key].number"
            >
              {{ point.groups[key].text }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="channel in point.channels" :key="channel.id">
            <td>{{ channel.name }}</td>
            <td
              v-for="(r, index) in channel.equipChannelValues"
              :key="index"
              v-on:click.stop="channelClick(r, $event)"
              :style="getEquipChannelStyle(r)"
            >
              {{ r.text }}
            </td>
          </tr>
        </tbody>
      </table>
      <select
        ref="select"
        v-show="show"
        v-model="equipChannel"
        @change="channelChange(equipChannel)"
        @blur="show = false"
        style="position: absolute"
      >
        <option v-for="(r, index) in equipChannels" :key="index" :value="r">
          {{ r.text }}
        </option>
      </select>
    </expantion>
    <params
      v-bind="{
        groups: point.groups,
        params: point.params,
        channels: point.channels,
        system: point.system,
      }"
    />
  </div>
</template>

<script>
import * as api from './api.js'
import { Point } from '../../classes/point'

import Params from './ParamsComponent.vue'
import Expantion from '../ExpantionPanel.vue'

export default {
  components: {
    Params,
    Expantion,
  },
  props: {
    point: {
      type: Object,
      default: () => new Point({}),
    },
  },
  data() {
    return {
      equipChannels: [],
      equipChannel: null,
      currentChannel: null,
      show: false,
    }
  },
  methods: {
    getEquipChannelStyle(equipChannel) {
      return equipChannel.editable ? null : api.nonEditableStyle
    },
    channelChange(value) {
      this.show = false
      this.point.channels.forEach((channel) => {
        if (!channel.equipChannelValues.includes(this.currentChannel)) {
          let found = channel.equipChannelValues.find(
            (r) =>
              r.group === this.currentChannel.group &&
              r.channel !== this.currentChannel.channel &&
              r.value === value.value
          )
          if (found) {
            if (found.editable) {
              found.text = '(Нет)'
              found.value = null
              channel.rows
                .filter((r) => r.archive)
                .forEach((r) => {
                  r.archive.value = r.archive.values.find(
                    (f) => f.value === null
                  )
                })
              channel.rows
                .filter((r) => r.current)
                .forEach((r) => {
                  r.current.value = r.current.values.find(
                    (f) => f.value === null
                  )
                })
            } else {
              return
            }
          }
        } else {
          channel.rows
            .filter((r) => r.archive)
            .forEach((r) => {
              r.archive.value = r.archive.values.find((f) =>
                value.value === null
                  ? f.value === null
                  : f.channel === value.value
              )
            })
          channel.rows
            .filter((r) => r.current)
            .forEach((r) => {
              r.current.value = r.current.values.find((f) =>
                value.value === null
                  ? f.value === null
                  : f.channel === value.value
              )
            })
        }
      })

      this.currentChannel.text = value.text
      this.currentChannel.value = value.value
    },
    channelClick(channel, event) {
      if (channel.editable) {
        this.currentChannel = channel
        const type = this.point.channels.find(
          (r) => r.id === channel.channel
        ).type
        this.equipChannels = this.point.groups[channel.group].channels.filter(
          (r) => r.value === null || r.types.includes(type)
        )
        this.equipChannel = this.point.groups[channel.group].channels.find(
          (r) => r.value === channel.value
        )

        api.setPosition(
          event.target,
          this.$refs.expantion.$el,
          this.$refs.select
        )
        this.show = true
        this.$nextTick().then(() => this.$refs.select.focus())
      }
    },
  },
}
</script>

<style>
.channels-wrapper {
  display: flex;
  flex-direction: column;
  position: relative;
}
</style>
