<template>
  <label class="fit"> 
    <expantion caption="Основные параметры" :largeWidth="true"> 
      <div class="point-grid">
        <label>Наименование:</label>
        <input
          v-model.trim="name"
          type="text"
          maxlength="200"
          @input="onChange('name', name)"
          :class="{ 'validation-error': localError.name }"
          :title="localError.name"
        />
        <label>Примечание:</label>
        <input
          v-model.trim="note"
          type="text"
          maxlength="200"
          @input="onChange('note', note)"
        />
        <label>Дата ввода в эксплуатацию:</label>
        <div style="display: flex; justify-content: space-between">
          <date-picker
            v-model="timeStart"
            format="DD.MM.YYYY"
            clearable
            style="width: 90px"
            @input="onChange('timeStart', timeStart)"
            :class="{ 'validation-error': localError.timeStart }"
            :title="localError.timeStart"
          />
          <div
            style="
              display: grid;
              gap: 5px 3px;
              grid-template-columns: auto min-content;
            "
          >
            <label>Дата вывода из эксплуатации:</label>
            <date-picker
              v-model="timeEnd"
              format="DD.MM.YYYY"
              clearable
              style="width: 90px"
              @input="onChange('timeEnd', timeEnd)"
              :class="{ 'validation-error': localError.timeEnd }"
              :title="localError.timeEnd"
            />
          </div>
        </div>
        <label>Прибор:</label>
        <select v-model="equipId" @change="onChangeEquip(equipId)">
          <option v-for="r in sortedEquips" :key="r.id" :value="r.id">
            {{ r.name }}
          </option>
        </select>
        <label>Измеряемая система прибора:</label>
        <select
          v-model="system"
          @change="onChangeSystemNumber(system)"
          :disabled="!equipId"
        >
          <option v-for="r in sortedSystems" :key="r.number" :value="r.number">
            {{ r.name }}
          </option>
        </select>
        <label>Схема подключения:</label>
        <select
          v-model="schemaId"
          @change="onChangeSchema(schemaId)"
          :class="{ 'validation-error': localError.schemaId }"
          :title="localError.schemaId"
        >
          <option v-for="r in sortedSchemas" :key="r.id" :value="r.id">
            {{ r.name }}
          </option>
        </select>
      </div>
    </expantion>
    <channels v-bind="{ point }" />
    <expantion
      v-if="point.customProps && point.customProps.length > 0"
      caption="Пользовательские параметры"
      :opened="false"
      :largeWidth="true" 
    >
      <object-props
        v-bind="{ customProps: point.customProps }"
        @changed="onChange"
      />
    </expantion>
  </label>
</template>

<script>
import { Point } from '../../classes/point'
import DatePicker from '../Inputs/DatePicker.vue'
import Channels from './ChannelsComponent.vue'
import Expantion from '../ExpantionPanel.vue'
import ObjectProps from '../CustomProps/ObjectProps.vue'

export default {
  components: {
    Channels,
    DatePicker,
    Expantion,
    ObjectProps,
  },
  props: {
    point: Object,
    error: {
      type: Object,
      default: () => ({
        name: null,
        timeStart: null,
        timeEnd: null,
        schemaId: null,
      }),
    },
  },
  data() {
    return {
      nodeId: this.point.nodeId,
      name: this.point.name,
      note: this.point.note,
      timeStart: this.point.timeStart,
      timeEnd: this.point.timeEnd,
      equipId: this.point.equipId,
      system: this.point.system,
      schemaId: this.point.schemaId,
      localError: JSON.parse(JSON.stringify(this.error)),
    }
  },
  created() {
    [
      'name',
      'note',
      'timeStart',
      'timeEnd',
      'equipId',
      'system',
      'schemaId',
    ].forEach((r) => {
      this.$watch(
        () => this.point[r],
        (value) => (this[r] = value)
      )
    })

    this.$watch(
      () => this.error,
      (value) => (this.localError = JSON.parse(JSON.stringify(value))),
      { deep: true }
    )

    this.$watch(
      () => this.schemaId,
      (value, old) => {
        if (old) {
          if (
            this.schemaId &&
            (!this.name ||
              this.$store.state.env.schemas[old].name === this.name)
          ) {
            this.name = this.$store.state.env.schemas[value].name
          }
        } else {
          if (this.schemaId && !this.name) {
            this.name = this.$store.state.env.schemas[value].name
          }
        }
      }
    )
  },
  computed: {
    sortedEquips() {
      return Object.values(this.point.equips).sort((a, b) =>
        this.$store.state.collator.compare(a.name, b.name)
      )
    },
    sortedSystems() {
      let result = []
      if (this.equipId) {
        result = this.point.equips[this.equipId.toString()].systems
          .slice(0)
          .sort((a, b) => this.$store.state.collator.compare(a.name, b.name))
      }
      return result
    },
    sortedSchemas() {
      return Object.values(this.$store.state.env.schemas)
        .filter((r) =>
          this.equipId
            ? (this.point.equips[this.equipId.toString()].systemType &
                r.systemType) ===
              r.systemType
            : true
        )
        .sort((a, b) => this.$store.state.collator.compare(a.name, b.name))
    },
  },
  methods: {
    onChange(name, value) {
      this.$emit('changed', name, value)
    },
    onChangeEquip(equipId) {
      const systems = this.point.equips[equipId].systems

      this.onChange('equipId', equipId)
      this.onChange('system', systems[systems.length > 1 ? 1 : 0].number)
      this.onChange('groups', {})
      this.onChange('channels', [])
      this.onChange('params', [])
      this.onChange('schemaId', null)
    },
    onChangeSystemNumber(system) {
      this.onChange('system', system)
      this.onChange('groups', {})
      this.onChange('channels', [])
      this.onChange('params', [])
      this.onChange('schemaId', null)
    },
    async onChangeSchema(schemaId) {
      try {
        if (this.point.id !== null) {
          const { groups, channels, params } = await this.point.getParams(
            schemaId
          )

          this.onChange('groups', groups)
          this.onChange('channels', channels)
          this.onChange('params', params)
          this.onChange('schemaId', schemaId)
        }
      } catch (error) {
        this.$store.commit('error', error)
      }
    },
    async save() {
      try {
        this.localError = {}

        const point = new Point({
          nodeId: this.nodeId,
          name: this.name,
          note: this.note,
          timeStart: this.timeStart,
          timeEnd: this.timeEnd,
          equipId: this.equipId,
          system: this.system,
          schemaId: this.schemaId,
        })

        await point.save()

        return true
      } catch (error) {
        if (error.response?.status !== 552) {
          if (error.response?.status === 551) {
            this.localError = error.response.data
          } else {
            this.$store.commit('error', error)
          }
        }
      }
    },
  },
}
</script>

<style>
.point-grid {
  display: grid;
  grid-gap: 5px 3px;
  grid-template-columns: auto 1fr;
  min-width: 450px;
}

.point-grid > label {
  text-align: right;
}
</style>
