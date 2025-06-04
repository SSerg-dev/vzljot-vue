<template>
  <div class="params-wrapper" v-if="channels.length > 0 || params.length > 0">
    <expantion ref="expantion" caption="Соответствие параметров точки учета приборным" :staticHeight="false" :opened="false" :largeWidth="true">
      <table ref="table" class="table-params">
        <thead>
          <tr class="header" :style="$store.getters.styleColors">
            <th>Параметры</th>
            <th>Архивный</th>
            <th>Текущий</th>
            <th>Датчик</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="channel in channels" :key="channel.id">
            <tr class="channel">
              <td colspan="4">{{ channel.name }}</td>
            </tr>
            <tr v-for="(r, index) in channel.rows" :key="`${channel.id}_${index}`" class="channel-params">
              <td style="padding: 3px 3px 5px 20px;">{{ r.name }}</td>
              <td :style="getStyle(r.archive)" v-on:click.stop="channelParamClick(r.archive, channel, measureType.archive, index, $event)">{{ r.archive && r.archive.value ? r.archive.value.text : '' }}</td>
              <td :style="getStyle(r.current)" v-on:click.stop="channelParamClick(r.current, channel, measureType.current, index, $event)">{{ r.current && r.current.value ? r.current.value.text : '' }}</td>
              <td :style="getStyle(r.sensor)" v-on:click.stop="sensorClick(r.sensor, $event)">{{ r.sensor ? r.sensor.value.name : '' }}</td>
            </tr>
          </template>
          <tr v-for="p in params" :key="p.type">
            <td>{{ p.name }}</td>
            <td :style="getStyle(p.archive)" v-on:click.stop="paramClick(p.archive, measureType.archive, $event)">{{ p.archive ? p.archive.value.text : '' }}</td>
            <td :style="getStyle(p.current)" v-on:click.stop="paramClick(p.current, measureType.current, $event)">{{ p.current ? p.current.value.text : '' }}</td>
            <td :style="getStyle(p.sensor)" v-on:click.stop="sensorClick(p.sensor, $event)">{{ p.sensor ? p.sensor.value.name : '' }}</td>
          </tr>
        </tbody>
      </table>
      <select ref="paramSelect" v-show="param.value" v-model="param.value" @blur="param = empty" @change="paramChange(param.value)" v-on:click.stop style="position: absolute;">
        <option v-for="item in paramValues" :key="item.name" :value="item">{{ item.text }}</option>
      </select>
      <select ref="sensorSelect" v-show="sensor.value" v-model="sensor.value" @blur="sensor = {}" @change="$refs.sensorSelect.blur()" v-on:click.stop style="position: absolute;">
        <option v-for="item in sensors" :key="item.id" :value="item">{{ item.name }}</option>
      </select>
    </expantion>
  </div>
</template>

<script>
  import * as api from './api.js'

  import Expantion from '../ExpantionPanel.vue'

  let empty = {}

  export default {
    components: {
      Expantion
    },
    props: {
      groups: {
        type: Object,
        default: () => {}
      },
      channels: {
        type: Array,
        default: () => []
      },
      params: {
        type: Array,
        default: () => []
      },
      system: {
        type: Number,
        default: null
      }
    },
    data() {
      return {
        currentChannel: null,
        currentColumn: null,
        currentIndex: null,
        param: empty,
        empty: empty,
        sensor: {}
      }
    },
    computed: {
      measureType() {
        return this.$store.state.env.measureTypeEnum
      },
      reverseMeasureType() {
        return Object.assign({}, ...Object.keys(this.measureType).map(key => { return { [this.measureType[key]]: key } }))
      },
      paramValues() {
        let result = []
        if (this.param.values) {
          if (this.param.value && this.param.value.value) {
            result = this.param.values.filter(value => {
              return value.value === null || this.param.value.channel === value.channel
            })
          }
          else {
            result = this.param.values.filter(value => {
              if (value.value === null) {
                return true
              } else {
                if (this.currentChannel === null) {
                  return true
                } else {
                  let channelValue = this.currentChannel.equipChannelValues.find(item => { return item.group === value.group })
                  console.log('channelValue', value, this.currentChannel.equipChannelValues, channelValue);
                  if (channelValue.value === null) {
                    let found = this.channels.filter(channel => {
                      if (this.currentChannel !== channel) {
                        let channelValue = channel.equipChannelValues.find(item => { return item.group === value.group })
                        return channelValue.value === value.channel
                      } else {
                        return false
                      }
                    })
                    return found.length === 0
                  } else {
                    return channelValue.value === value.channel
                  }
                }
              }
            })
          }
        }
        return result
      },
      sensors() {
        return this.sensor.values ? this.sensor.values : []
      }
    },
    methods: {
      setChannelParam(channel) {
        let updateValue = obj => {
          if (obj && obj.value && obj.value.value) {
            let value = obj.values.find(r => {
              let equipChannelValues = channel.equipChannelValues.find(element => { return element.group === obj.value.group })
              return (r.channel === equipChannelValues.value && r.group === equipChannelValues.group && r.system === this.system)
                || (equipChannelValues.value === null && typeof r.channel === 'undefined')
            })
            obj.value = value
          }
        }
        channel.rows.forEach(row => {
          updateValue(row.archive)
          updateValue(row.current)
        })
      },
      paramChange (value) {
        const update = (param, value) => {
          if (param && value !== param.value && value.value === param.value.value) {
            param.value = param.values.find(r => r.value === null)
          }
        }

        if (this.currentChannel !== null) {
          if (this.currentIndex !== null) {
            let equipChannelValue = this.currentChannel.equipChannelValues.find(r => r.group === value.group)
            if (equipChannelValue) {
              let channelValue = this.groups[equipChannelValue.group].channels.find(r => r.value === value.channel)
              equipChannelValue.value = channelValue.value
              equipChannelValue.text = channelValue.text
            }

            this.currentChannel.rows.forEach(r => update(r[this.reverseMeasureType[this.currentColumn]], value))           
          }
        } else {
          this.params.forEach(r => update(r[this.reverseMeasureType[this.currentColumn]], value))
        }

        this.currentColumn = null
        this.currentChannel = null
        this.currentIndex = null

        this.$refs.paramSelect.blur()
      },
      getStyle(obj) {
        return obj ? null : api.nonEditableStyle
      },
      channelParamClick(p, channel, column, index, event) {
        if (p) {
          api.setPosition(event.target, this.$refs.expantion.$el, this.$refs.paramSelect)
          this.$nextTick().then(() => this.$refs.paramSelect.focus())
          this.param = p
          this.currentChannel = channel
          this.currentIndex = index
          this.currentColumn = column
        }
      },
      paramClick(p, column, event) {
        if (p) {
          api.setPosition(event.target, this.$refs.expantion.$el, this.$refs.paramSelect)
          this.$nextTick().then(() => this.$refs.paramSelect.focus())
          this.param = p
          this.currentColumn = column
        }
      },
      sensorClick(sensor, event) {
        if (sensor) {
          api.setPosition(event.target, this.$refs.expantion.$el, this.$refs.sensorSelect)
          this.$nextTick().then(() => this.$refs.sensorSelect.focus())
          this.sensor = sensor
        }
      }
    }
  }

</script>

<style>
  .params-wrapper {
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .table-params .header th {
    padding: 5px;
    font-weight: normal;
    text-align: left;
  }

  .table-params {
    width: 100%;
  }

  .table-params .header th:not(:first-child) {
    border-left: 1px solid white;
  }

  .table-params td:not(:first-child) {
    border-left: 1px solid #ddd;
  }

  .table-params td {
    padding: 3px 5px;
  }

  .table-params .channel {
    background-color: #ecf0f6;
  }
</style>
