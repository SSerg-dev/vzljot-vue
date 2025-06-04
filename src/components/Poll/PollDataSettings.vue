<template>
  <div class="poll-data-settings-grid">
    <check-box v-model="value.useSystem" @update:modelValue="onChange()"
      >Использовать параметры автоматического сбора данных</check-box
    >
    <div class="poll-data-settings-grid two">
      <label :disabled="disabled">Данные:</label>
      <div
        style="
          display: grid;
          gap: 5px 3px;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        "
      >
        <template
          v-for="[k, v] in Object.entries($store.state.env.pollDataTypes)"
        >
          <check-box
            v-if="value[v.type] !== null"
            :key="k"
            v-model="value[v.type]"
            :disabled="disabled"
            @update:modelValue="onChange()"
            :class="{ 'validation-error': error.data.value }"
            :title="error.data.title"
            >{{ v.text }}</check-box
          >
        </template>
      </div>
    </div>
    <div class="poll-data-settings-grid two">
      <label :disabled="disabled">Диапазон сбора:</label>
      <div class="poll-data-settings-grid two">
        <select
          :disabled="disabled"
          v-model="value.timeType"
          @change="onChange()"
        >
          <option
            v-for="key in Object.keys($store.state.env.pollDataTimeTypes)"
            :key="key"
            :value="parseInt(key)"
          >
            {{ $store.state.env.pollDataTimeTypes[key].text }}
          </option>
        </select>
        <div class="poll-data-settings-grid" style="min-width: 250px">
          <div
            v-if="value.timeType === pollDataTimeTypes.onDepth"
            class="poll-data-settings-grid two"
          >
            <number-box
              :disabled="disabled"
              v-model="value.timeDepth"
              @update:modelValue="onChange()"
              style="width: 30px"
              :min="1"
              :max="999"
            />
            <label :disabled="disabled">дн</label>
          </div>
          <div
            v-else
            style="
              display: grid;
              align-items: center;
              grid-gap: 5px 3px;
              grid-template-columns: auto auto auto 1fr;
            "
          >
            <date-picker
              :disabled="disabled"
              v-model="value.timeFrom"
              @update:modelValue="onChange()"
              format="DD.MM.YYYY"
              :class="{ 'validation-error': error.time.value }"
              :title="error.time.title"
            />
            <check-box
              :disabled="disabled"
              v-model="value.isTimeTo"
              @update:modelValue="onChange()"
            />
            <label :disabled="disabled || !value.isTimeTo">по</label>
            <date-picker
              :disabled="disabled || !value.isTimeTo"
              @update:modelValue="onChange()"
              v-model="value.timeTo"
              format="DD.MM.YYYY"
              :class="{ 'validation-error': error.time.value }"
              :title="error.time.title"
            />
          </div>
        </div>
      </div>
    </div>
    <check-box
      v-model="value.forcePollEquipSettings"
      @update:modelValue="onChange()"
      :disabled="forcePollEquipSettingsDisabled"
      >Выполнить сбор приборных настроек</check-box
    >
    <check-box
      v-model="value.allowOutOfRange"
      @update:modelValue="onChange()"
      :disabled="allowOutOfRangeDisabled"
      >Разрешить сбор отсутствующих данных вне диапазона</check-box
    >
    <check-box
      v-model="value.rewrite"
      @update:modelValue="onRewriteChange()"
      :disabled="rewriteDisabled"
      >Перезаписать ранее полученные архивные данные</check-box
    >
    <check-box
      v-model="value.rewriteMissing"
      @update:modelValue="onRewriteMissingChange()"
      :disabled="rewriteDisabled"
      >Перезаписать данные, которые отсутствовали у прибора во время
      сбора</check-box
    >
  </div>
</template>

<script>
import { matchType } from '../../plugins/api.js'

import CheckBox from '../Inputs/CheckBox.vue'
import DatePicker from '../Inputs/DatePicker.vue'
import NumberBox from '../Inputs/NumberBox.vue'

export default {
  components: {
    CheckBox,
    DatePicker,
    NumberBox,
  },
  props: {
    settings: Object,
  },
  data() {
    return {
      dateFormat: 'DD.MM.YYYY',
      error: {
        time: {
          value: false,
          title: '',
        },
        data: {
          value: false,
          title: '',
        },
      },
      value: JSON.parse(JSON.stringify(this.settings)),
    }
  },
  computed: {
    disabled() {
      return this.value.useSystem
    },
    archiveOptionSelected() {
      return (
        this.value.archiveHour ||
        this.value.archiveDay ||
        this.value.archiveMonth
      )
    },
    otherOptionSelected() {
      return (
        this.value.setParams ||
        this.value.equipEvents ||
        this.value.equipCustomizing ||
        this.value.setDataColdWater ||
        this.value.coldWater ||
        this.value.equipDatabaseParams
      )
    },
    forcePollEquipSettingsDisabled() {
      return (
        this.disabled ||
        !(this.archiveOptionSelected || this.otherOptionSelected)
      )
    },
    allowOutOfRangeDisabled() {
      return this.disabled || !this.archiveOptionSelected
    },
    rewriteDisabled() {
      return this.disabled || !this.archiveOptionSelected
    },
    pollDataTimeTypes() {
      return matchType(this.$store.state.env.pollDataTimeTypes)
    },
  },
  watch: {
    settings: {
      handler(value) {
        this.value = JSON.parse(JSON.stringify(value))
      },
      deep: true,
    },
  },
  methods: {
    onChange() {
      this.$emit('changed', this.value)
    },
    onRewriteChange() {
      if (this.value.rewrite && this.value.rewriteMissing) {
        this.value.rewriteMissing = false
      }

      this.$emit('changed', this.value)
    },
    onRewriteMissingChange() {
      if (this.value.rewriteMissing && this.value.rewrite) {
        this.value.rewrite = false
      }

      this.$emit('changed', this.value)
    },
    validate() {
      Object.keys(this.error).forEach(
        (r) => (this.error[r] = { value: false, title: '' })
      )

      if (
        !(
          this.archiveOptionSelected ||
          this.otherOptionSelected ||
          this.value.timeSync
        ) &&
        !this.disabled
      ) {
        this.error.data.value = true
        this.error.data.title = 'Необходимо выбрать хотя бы один тип данных.'
      }

      if (this.value.timeType === this.pollDataTimeTypes.fromTime) {
        if (
          this.value.isTimeTo &&
          new Date(this.value.timeFrom).getTime() >
            new Date(this.value.timeTo).getTime()
        ) {
          this.error.time.value = true
          this.error.time.title =
            'Дата окончания не может быть меньше даты начала.'
        }
      }

      return !Object.keys(this.error).some((r) => this.error[r].value === true)
    },
  },
}
</script>

<style scoped>
.poll-data-settings-grid {
  display: grid;
  gap: 10px 3px;
  grid-template-columns: auto;
  grid-template-rows: max-content;
}

.poll-data-settings-grid.two {
  grid-template-columns: auto 1fr;
}

.poll-data-settings-grid select {
  width: fit-content;
}

.poll-data-settings-grid .datepicker {
  width: 90px;
}
</style>
