<template>
  <div class="equip-list-filter">
    <label>Состояние:</label>
    <select v-model="localFilter.state" @change="onChange">
      <option v-for="[k, v] in localStatuses" :key="k" :value="k">
        {{ v }}
      </option>
    </select>
    <label>Прибор:</label>
    <input v-model="localFilter.equip" type="text" @input="onChange" />
    <label>Объект учета:</label>
    <input v-model="localFilter.node" type="text" @input="onChange" />
    <label>Порт подключения:</label>
    <input v-model="localFilter.port" type="text" @input="onChange" />
    <label>Ручной сбор:</label>
    <select v-model="localFilter.pollSource" @change="onChange">
      <option :value="undefined">(Все)</option>
      <option :value="256">Нет</option>
      <option :value="512">Да</option>
    </select>
    <label>Дата:</label>
    <select v-model="localFilter.column" @change="onChange">
      <option v-for="[k, v] in localColumnTypes" :key="k" :value="k">
        {{ v }}
      </option>
    </select>
    <label>с:</label>
    <div class="equip-list-filter">
      <date-picker
        v-model="localFilter.periodStart"
        format="DD.MM.YYYY"
        clearable
        style="width: 90px"
        @update:modelValue="onChange"
      />
      <div class="equip-list-filter">
        по:<date-picker
          v-model="localFilter.periodEnd"
          format="DD.MM.YYYY"
          clearable
          style="width: 90px"
          @update:modelValue="onChange"
        />
      </div>
    </div>
    <label>Системы точек учета:</label>
    <select v-model="localFilter.type" @change="onChange">
      <option v-for="[k, v] in localTypes" :key="k" :value="k">{{ v }}</option>
    </select>
  </div>
</template>

<script lang="ts">
import { CommonStatusEnum } from '@/classes/enum/CommonStatusEnum'
import { SchemeSystemTypeEnum } from '@/classes/enum/SchemeSystemTypeEnum'
import { ColumnTypeEnum, Filter } from '@/classes/equipList'
import { defineComponent, PropType, ref } from 'vue'

import DatePicker from '../Inputs/DatePicker.vue'

const collator = new Intl.Collator(['en-US', 'ru-RU'])

function getSystemText(systemType: SchemeSystemTypeEnum) {
  switch (systemType) {
    case SchemeSystemTypeEnum.SO:
      return 'СО'
    case SchemeSystemTypeEnum.GVS:
      return 'ГВС'
    case SchemeSystemTypeEnum.HVS:
      return 'ХВС'
    case SchemeSystemTypeEnum.ES:
      return 'Электроэнергия'
    case SchemeSystemTypeEnum.GS:
      return 'Газ'
    case SchemeSystemTypeEnum.PS:
      return 'Пар'
    case SchemeSystemTypeEnum.MS:
      return 'Мазут'
    case SchemeSystemTypeEnum.Refill:
      return 'Подпитка'
    case SchemeSystemTypeEnum.SV:
      return 'Вентиляция'
    case SchemeSystemTypeEnum.Level:
      return 'Уровень'
    case SchemeSystemTypeEnum.Pressure:
      return 'Давление'
    case SchemeSystemTypeEnum.Temperature:
      return 'Температура'
    case SchemeSystemTypeEnum.STV:
      return 'Сточные воды'

    case SchemeSystemTypeEnum.SO_GVS:
      return 'СО+ГВС'
    case SchemeSystemTypeEnum.SO_Refill:
      return 'СО+Подпитка'
    case SchemeSystemTypeEnum.GVS_Refill:
      return 'ГВС+Подпитка'
    case SchemeSystemTypeEnum.SO_GVS_Refill: 
      return 'СО+ГВС+Подпитка'
    case SchemeSystemTypeEnum.SO_GVS_HVS:
      return 'СО+ГВС+ХВС'
    case SchemeSystemTypeEnum.SO_GVS_Refill_HVS:
      return 'СО+ГВС+Подпитка+ХВС'
    case SchemeSystemTypeEnum.SV_Refill:
      return 'Вентиляция+Подпитка'
    case SchemeSystemTypeEnum.SO_Refill_HVS:
      return 'СО+Подпитка+ХВС'
    case SchemeSystemTypeEnum.GVS_Refill_HVS: 
      return 'ГВС+Подпитка+ХВС'
    case SchemeSystemTypeEnum.PS_GVS: 
      return 'ГВС+Пар'

    case SchemeSystemTypeEnum.All:
      return 'Все системы'

    default:
      break
  }

  return 'Неизвестная система'
}

export default defineComponent({
  name: 'equipListFilter',
  components: {
    DatePicker,
  },
  props: {
    filter: {
      type: Object as PropType<Filter>,
      default: () => {},
    },
    types: {
      type: Array as PropType<Array<SchemeSystemTypeEnum>>,
      default: () => [],
    },
  },
  setup(props, { emit }) {
    const localFilter = ref(new Filter(props.filter))
    const localColumnTypes = [
      [undefined, '(Все)'],
      [ColumnTypeEnum.ArchiveHourTime, 'Часовой архив'],
      [ColumnTypeEnum.ArchiveDayTime, 'Суточный архив'],
      [ColumnTypeEnum.ArchiveMonthTime, 'Месячный архив'],
      [ColumnTypeEnum.PollCurrentTime, 'Данные наборов'],
      [ColumnTypeEnum.TimeCreate, 'Прибор создан'],
      [ColumnTypeEnum.TimeLastEdit, 'Прибор изменен'],
    ]
    const localStatuses = [
      [undefined, '(Все)'],
      [CommonStatusEnum.Ok, 'Работает нормально'],
      [CommonStatusEnum.NoControl, 'Контроль архивов отключен'],
      [CommonStatusEnum.NoData, 'Нет архива'],
      [CommonStatusEnum.Warning, 'Нештатная ситуация'],
      [CommonStatusEnum.Error, 'Критическая ошибка'],
    ]
    const localTypes = [
      [undefined, '(Все)'],
      ...props.types
        .map((r) => [r, getSystemText(r)])
        .sort((a, b) => {
          return collator.compare(
            (a[1] as string).toLowerCase(),
            (b[1] as string).toLowerCase()
          )
        }),
    ]

    function onChange() {
      emit('changed', localFilter.value)
    }

    function sort(a: string, b: string) {
      return collator.compare(a.toLowerCase(), b.toLowerCase())
    }

    return {
      localColumnTypes,
      localFilter,
      localStatuses,
      localTypes,
      onChange,
      sort,
    }
  },
})
</script>

<style scoped>
.equip-list-filter {
  display: grid;
  grid-gap: 5px 3px;
  grid-template-columns: 1fr auto;
}

.equip-list-filter label {
  text-align: right;
}

.equip-list-filter select {
  width: fit-content;
}
</style>
