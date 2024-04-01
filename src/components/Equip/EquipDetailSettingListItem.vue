<template>
  <div>
    <spinner :show="loading" :text="'Загрузка...'" key="1" />
    <div class="equip-grid equip-setting-container">
      <div class="equip-setting-item-1">Дата ввода:</div>

      <div class="equip-setting-item-2 date-picker">
        <date-picker
          v-model="currentDate"
          :format="dateFormat"
          clearable
          @update:modelValue="handleEquipSettingDate($event)"
        />
      </div>

      <div class="equip-setting-item-3">
        <check-box
          v-model="isPassSettingCheck"
          @update:modelValue="handlePassSettingCheck($event)"
        ></check-box>
      </div>

      <div class="equip-setting-item-4">
        Зазрешить пропускать проверку настроек
      </div>
    </div>
  </div>
</template>

<script>
import BaseComponent from '@/components/Base/BaseComponent.vue'
import DatePicker from '@/components/Inputs/DatePicker.vue'
import CheckBox from '@/components/Inputs/CheckBox.vue'

import { mapGetters } from 'vuex'

export default {
  name: 'EquipDetailSettingListItem',
  components: {
    DatePicker,
    CheckBox
    
  },
  extends: BaseComponent,
  props: {
    equip: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      dateFormat: 'DD.MM.YYYY',
      currentDate: new Date(),
      isPassSettingCheck: true,

      localData: null,

      timeout: null,
      delay: 1000,

      loading: true,
    }
  },
  computed: {
    ...mapGetters({
      getCard: 'getCard',
    }),
  },
  watch: {
    getCard(newVal) {
      newVal
    },
  },
  created() {
    this.loading = false
    // this.$watch()
  },

  // mounted() {},

  beforeUnmount() {
    clearTimeout(this.timeout)
  },

  methods: {
    handleEquipSettingDate(event) {
      event
      // let changedEquipSettingDate = new Date(event)
      // console.log('$$ changedEquipSettingDate', changedEquipSettingDate)
    },
    handlePassSettingCheck(event) {
      event
      // console.log('$$ event', event)
    },
  }, // end methods
}
</script>

<style scoped>
.equip-grid {
  display: grid;
  gap: 5px 3px;
  min-width: 450px;
}

/* equip-setting */
.equip-setting-container {
  display: flex;
  flex-direction: row;
  margin-bottom: 5px;
}
.equip-setting-item-1 {
  align-self: start;
  justify-self: center;
}
.equip-setting-item-2 {
  align-self: center;
  justify-self: center;
  margin-right: 10px;
}
.equip-setting-item-3 {
  align-self: end;
  justify-self: center;
  margin-right: 2px;
}
.equip-setting-item-4 {
  align-self: center;
  justify-self: center;
}
.date-picker {
  width: 13.2%;
}
</style>
