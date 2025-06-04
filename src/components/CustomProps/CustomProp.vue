<template>
  <div class="component-detail fit">
    <expantion-panel caption="Основные параметры" :resizable="false">
      <div class="custom-prop">
        <label>Наименование:</label>
        <input
          v-model.trim="localName"
          type="text"
          @input="onChange('name', localName)"
          maxlength="50"
          :class="{ 'validation-error': localError.name }"
          :title="localError.name"
        />
        <label>Код:</label>
        <input
          v-model.trim="localCode"
          type="text"
          @input="onChange('code', localCode)"
          maxlength="50"
          :class="{ 'validation-error': localError.code }"
          :title="localError.code"
        />
        <label>Тип данных:</label>
        <select
          v-model="localDataType"
          @change="onChange('dataType', localDataType)"
          :class="{ 'validation-error': localError.dataType }"
          :title="localError.dataType"
        >
          <option :value="CustomPropertyTypeEnum.String">Строка</option>
          <option :value="CustomPropertyTypeEnum.Integer">Целое число</option>
          <option :value="CustomPropertyTypeEnum.Double">
            Вещественное число
          </option>
          <option :value="CustomPropertyTypeEnum.DateTime">Дата и время</option>
          <option :value="CustomPropertyTypeEnum.Boolean">
            Логическое значение
          </option>
        </select>
        <label>Тип объекта:</label>
        <select
          v-model="localObjectType"
          @change="onChange('objectType', localObjectType)"
          :class="{ 'validation-error': localError.objectType }"
          :title="localError.objectType"
        >
          <option :value="CustomPropertyObjectTypeEnum.Equip">Прибор</option>
          <option :value="CustomPropertyObjectTypeEnum.MeasureScheme">
            Точка учета
          </option>
          <option :value="CustomPropertyObjectTypeEnum.EquipAndMeasureScheme">
            Прибор и точка учета
          </option>
        </select>
        <label>Отображение:</label>
        <div>
          <check-box
            :trueLabel="CustomPropertyDisplayInEnum.List"
            :falseLabel="0"
            v-model="localDisplayIn.list"
            @update:modelValue="onChangeDisplayInList($event)"
            >Списки</check-box
          >
          <check-box
            :trueLabel="CustomPropertyDisplayInEnum.Counter"
            :falseLabel="0"
            v-model="localDisplayIn.counter"
            @update:modelValue="onChangeDisplayInCounter($event)"
            >Показания счетчиков</check-box
          >
          <check-box
            :trueLabel="CustomPropertyDisplayInEnum.TGA"
            :falseLabel="0"
            v-model="localDisplayIn.analyze"
            @update:modelValue="onChangeDisplayInAnalyze($event)"
            :disabled="localObjectType === CustomPropertyObjectTypeEnum.Equip"
            >Анализ температурных графиков</check-box
          >
        </div>
      </div>
    </expantion-panel>
  </div>
</template>

<script lang="ts">
import { CustomProp, CustomPropError } from '@/classes/customProp'
import ExpantionPanel from '../ExpantionPanel.vue'
import CheckBox from '../Inputs/CheckBox.vue'
import { defineComponent, PropType, ref, watch } from 'vue'
import { store } from '@/store/store'
import axios, { AxiosError } from 'axios'
import { CustomPropertyTypeEnum } from '@/classes/enum/CustomPropertyTypeEnum'
import { CustomPropertyObjectTypeEnum } from '@/classes/enum/CustomPropertyObjectTypeEnum'
import { CustomPropertyDisplayInEnum } from '@/classes/enum/CustomPropertyDisplayInEnum'

function displayIn(value: number) {
  return {
    list: value & CustomPropertyDisplayInEnum.List,
    counter: value & CustomPropertyDisplayInEnum.Counter,
    analyze: value & CustomPropertyDisplayInEnum.TGA,
  }
}

export default defineComponent({
  components: {
    CheckBox,
    ExpantionPanel,
  },
  props: {
    value: {
      type: Object as PropType<CustomProp>,
      required: true,
    },
    error: {
      type: Object as PropType<CustomPropError>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const localName = ref(props.value.name)
    const localCode = ref(props.value.code)
    const localDataType = ref(props.value.dataType)
    const localObjectType = ref(props.value.objectType)
    const localDisplayIn = ref(displayIn(props.value.displayIn))

    const localError = ref(new CustomPropError(props.error))

    watch(
      () => props.value.name,
      (value) => (localName.value = value)
    )

    watch(
      () => props.value.code,
      (value) => (localCode.value = value)
    )

    watch(
      () => props.value.dataType,
      (value) => (localDataType.value = value)
    )

    watch(
      () => props.value.objectType,
      (value) => (localObjectType.value = value)
    )

    watch(
      () => props.value.displayIn,
      (value) => (localDisplayIn.value = displayIn(value))
    )

    watch(
      () => props.error,
      (value) => (localError.value = new CustomPropError(value)),
      { deep: true }
    )

    function onChange(
      prop: keyof CustomProp,
      value: CustomProp[keyof CustomProp] 
    ) {
      if (props.value.editable) {
        if (
          prop === 'objectType' &&
          value === CustomPropertyObjectTypeEnum.Equip
        ) {
          onChangeDisplayInAnalyze(CustomPropertyDisplayInEnum.None)
          localDisplayIn.value.analyze = CustomPropertyDisplayInEnum.None
        }
        emit('changed', prop, value)
      }
    }

    function onChangeDisplayInList(value: number) {
      if (props.value.editable) {
        let displayIn = store.state.displayIn ?? 0
        if (value) {
          displayIn |= CustomPropertyDisplayInEnum.List
        } else {
          displayIn &= ~CustomPropertyDisplayInEnum.List
        }
        store.state.displayIn = displayIn
        emit('changed', 'displayIn', displayIn)
      }
    }

    function onChangeDisplayInCounter(value: number) {
      if (props.value.editable) {
        let displayIn = store.state.displayIn ?? 0
        if (value) {
          displayIn |= CustomPropertyDisplayInEnum.Counter
        } else {
          displayIn &= ~CustomPropertyDisplayInEnum.Counter
        }
        store.state.displayIn = displayIn
        emit('changed', 'displayIn', displayIn)
      }
    }

    function onChangeDisplayInAnalyze(value: number) {
      if (props.value.editable) {
        let displayIn = store.state.displayIn ?? 0
        if (value) {
          displayIn |= CustomPropertyDisplayInEnum.TGA
        } else {
          displayIn &= ~CustomPropertyDisplayInEnum.TGA
        }
        store.state.displayIn = displayIn
        emit('changed', 'displayIn', displayIn)
      }
    }

    async function save() {
      try {
        localError.value = new CustomPropError({})
        const customProp = new CustomProp({
          name: localName.value,
          code: localCode.value,
          dataType: localDataType.value,
          objectType: localObjectType.value,
          displayIn: store.state.displayIn ?? 0,
        })
        await customProp.save()

        return true
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const error = err as AxiosError
          if (error.response?.status !== 552) {
            if (error.response?.status === 551) {
              localError.value = error.response.data
            } else {
              store.commit('error', error)
            }
          }
        }
      }
    }

    return {
      CustomPropertyDisplayInEnum,
      CustomPropertyObjectTypeEnum,
      CustomPropertyTypeEnum,
      localCode,
      localDataType,
      localDisplayIn,
      localError,
      localName,
      localObjectType,
      onChange,
      onChangeDisplayInList,
      onChangeDisplayInCounter,
      onChangeDisplayInAnalyze,
      save,
    }
  },
})
</script>

<style scoped>
.custom-prop {
  display: grid;
  grid-gap: 5px 3px;
  grid-template-columns: max-content max-content;
}

.custom-prop label {
  text-align: right;
}

.custom-prop select {
  width: fit-content;
}

.custom-prop .checkbox-wrapper {
  padding-right: 15px;
}
</style>
