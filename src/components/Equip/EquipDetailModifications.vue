<template>
  <div>
    <spinner :show="loading" :text="'Загрузка...'" key="1" />
    <div class="equip-grid three-container">
      <div class="three-item-1">
        <label>Исполнение:</label>
      </div>
      <div class="three-item-2">
        <select
          style="width: 100%"
          @change="handleOptionChange"
          :key="getCard.modifications.length"
        >
          <option
            v-for="(item, index) in getCard.modifications"
            :key="index"
            :value="item.description"
            :data-id="item.id"
            :selected="item.selected"
          >
            {{ item.name }}
          </option>
        </select>
      </div>
      <div class="three-item-3">
        <label>Последняя поверка:</label>
      </div>
      <div class="three-item-4 date-picker">
        <date-picker
          v-model="timeLastChecking"
          :format="dateFormat"
          clearable
          @update:modelValue="handleLastCheckingChange"
        />
      </div>
      <div class="three-item-5">
        <label>Следующая поверка:</label>
      </div>
      <div class="three-item-6 date-picker">
        <date-picker
          v-model="timeNextChecking"
          :format="dateFormat"
          clearable
          @update:modelValue="handleNextCheckingChange"
        />
      </div>
      <div class="three-item-7">
        <button
          @click="onFillClick"
          :disabled="!(timeLastChecking && interval)"
          style="justify-self: right; margin-bottom: 1px"
        >
          Заполнить
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import BaseComponent from '@/components/Base/BaseComponent.vue'
import DatePicker from '@/components/Inputs/DatePicker.vue'
import EquipType from '@/classes/equipType'
import { mapGetters } from 'vuex'

export default {
  name: 'EquipDetailModifications',
  components: {
    DatePicker,
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

      equipType: new EquipType({}),
      modifications: [],

      timeLastChecking: null,
      timeNextChecking: null,
      equipTypeModificationId: null,

      localData: null,
      equipTypeId: null,

      firstModifications: {
        id: -1,
        name: '<Нет>',
        selected: false,
      },

      timeout: null,
      delay: 1000,

      isFillClick: true,
      interval: 0,

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
      if (newVal.nodeChange) {
        this.equipTypeId = newVal.nodeChange.equipType
        this.timeLastChecking = newVal.nodeChange.timeLastChecking ?? null
        this.timeNextChecking = newVal.nodeChange.timeNextChecking ?? null
        this.equipTypeModificationId = newVal.nodeChange.equipTypeModificationId
      }
    },
    // eslint-disable-next-line no-unused-vars
    equipTypeId(newVal) {
      this.$emitter.off(
        'equip-detail:change-equip-type',
        this.onChangeEquipType
      )
      this.$emitter.on('equip-detail:change-equip-type', this.onChangeEquipType)
    },
  },
  created() {
    this.loading = false
    this.$emitter.off('equip-detail:create-equip', this.onCreateEquip)
    this.$emitter.off('equip-detail:change-equip-type', this.onChangeEquipType)

    this.$emitter.on('equip-detail:create-equip', this.onCreateEquip)
    this.$emitter.on('equip-detail:change-equip-type', this.onChangeEquipType)

    this.$watch(
      () => this.equipType.interval,
      (value) => (this.interval = value),
      { deep: true }
    )
    
  },

  mounted() {
    this.timeout = setTimeout(() => {
      if (
        this.$store.getters.getCard.selectedNodeId &&
        this.$store.getters.getCard.nodeChange
      ) {
        this.changeNode()
        this.interval = this.equipType.interval
        this.loading = false
      }
    }, this.delay)
  },

  beforeUnmount() {
    clearTimeout(this.timeout)

    this.$emitter.off('equip-detail:create-equip', this.onCreateEquip)
    this.$emitter.off('equip-detail:change-equip-type', this.onChangeEquipType)
  },

  methods: {
    // eslint-disable-next-line no-unused-vars
    async changeTypeEquip(id) {
      try {
        await this.equipType.init(id, 'code')

        this.equipTypeModificationId =
          this.$store.getters.getCard.nodeChange.equipTypeModificationId

        this.modifications = this.equipType.modifications.map((item) => ({
          id: item.id,
          name: item.name,
          selected: this.equipTypeModificationId === item.id ? true : false,
        }))

        this.modifications.unshift(this.firstModifications)

        const options = {
          modifications: this.modifications,
        }
        this.$store.commit('setCard', options)
      } catch (error) {
        store.commit('error', error)
      }
    },

    // eslint-disable-next-line no-unused-vars
    onCreateEquip(type) {
      if (this.interval === 0) {
        this.interval = -1
      }
      this.createNode()
      this.$emitter.off('equip-detail:create-equip', this.onCreateEquip)
    },
    onChangeEquipType(id) {
      this.changeTypeEquip(id)
      this.$emitter.off(
        'equip-detail:change-equip-type',
        this.onChangeEquipType
      )
    },
    onChangeNode() {},
    setNextChecking() {
      let nextTime
      if (this.timeLastChecking) {
        nextTime = new Date(this.timeLastChecking)
        if (!this.equipType.interval) {
          timeLastChecking = 0
        }
        nextTime.setFullYear(nextTime.getFullYear() + this.equipType.interval)
        this.timeNextChecking = nextTime
        return nextTime
      }
      return
    },
    // eslint-disable-next-line no-unused-vars
    onFillClick(event) {
      // this.isFillClick = !!event.isTrusted
      const result = this.setNextChecking()
      if (result) {
        this.handleNextCheckingChange(result.getTime())
      }
    },

    handleOptionChange(event) {
      const selectedId =
        +event.target.options[event.target.selectedIndex].getAttribute(
          'data-id'
        )
      const selectedValue = event.target.value
      const changedModifications = { id: selectedId, name: selectedValue }

      this.$emit('modifications-updated', changedModifications)
    },
    handleLastCheckingChange(event) {
      let changedLastChecking = new Date(event).getTime()
      this.$emit('last-checking-updated', changedLastChecking)
      // this.timeLastChecking = changedLastChecking
    },
    handleNextCheckingChange(event) {
      let changedNextChecking = new Date(event).getTime()
      this.$emit('next-checking-updated', changedNextChecking)
    },

    // eslint-disable-next-line no-unused-vars
    async changeNode() {
      try {
        const equipTypeId = this.$store.getters.getCard.nodeChange.equipType
        if (equipTypeId) {
          await this.equipType.init(equipTypeId, 'code')
        }
        this.timeLastChecking = this.timeLastChecking
          ? new Date(this.timeLastChecking)
          : null

        this.timeNextChecking = this.timeNextChecking
          ? new Date(this.timeNextChecking)
          : null

        this.equipTypeModificationId =
          this.$store.getters.getCard.nodeChange.equipTypeModificationId

        this.modifications = this.equipType.modifications.map((item) => ({
          id: item.id,
          name: item.name,
          selected: this.equipTypeModificationId === item.id ? true : false,
        }))

        this.modifications.unshift(this.firstModifications)

        const options = {
          modifications: this.modifications,
          timeLastChecking: this.timeLastChecking,
          timeNextChecking: this.timeNextChecking,
          equipTypeModificationId: this.equipTypeModificationId,
        }
        this.$store.commit('setCard', options)
      } catch (error) {
        store.commit('error', error)
      }
    },
    // eslint-disable-next-line no-unused-vars
    async createNode() {
      try {
        const equipTypeId = this.$store.getters.getCard.nodeChange.equipType

        await this.equipType.init(equipTypeId, 'code')

        this.timeLastChecking = null
        this.timeNextChecking = null

        this.equipTypeModificationId =
          this.$store.getters.getCard.nodeChange.equipTypeModificationId

        this.modifications = this.equipType.modifications.map((item) => ({
          id: item.id,
          name: item.name,
          selected: false,
        }))

        this.modifications.unshift(this.firstModifications)

        const options = {
          modifications: this.modifications,
          timeLastChecking: this.timeLastChecking,
          timeNextChecking: this.timeNextChecking,
          equipTypeModificationId: this.equipTypeModificationId,
        }
        this.$store.commit('setCard', options)
      } catch (error) {
        store.commit('error', error)
      }
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

.equip-grid.three-container {
  grid-template-columns: auto auto 1fr;
  grid-template-rows: auto auto 1fr;
}

.three-item-1 {
  justify-self: end;
  align-self: center;
  grid-column: 1 / span 1;
  grid-row: 1 / span 1;
}

.three-item-3 {
  justify-self: end;
  align-self: center;
  grid-column: 1 / span 1;
  grid-row: 2 / span 1;
}
.three-item-5 {
  justify-self: end;
  align-self: center;
  grid-column: 1 / span 1;
  grid-row: 3 / span 1;
}

.three-item-2 {
  align-self: center;
  grid-column: 2 / span 3;
  grid-row: 1 / span 1;
}
.three-item-4 {
  align-self: center;
  grid-column: 2 / span 2;
  grid-row: 2 / span 1;
}
.three-item-6 {
  align-self: center;
  grid-column: 2 / span 2;
  grid-row: 3 / span 1;
  z-index: 1;
}

.three-item-7 {
  align-self: center;
  grid-column: 4 / span 1;
  grid-row: 3 / span 1;
}

.date-picker {
  width: 20%;
}
</style>
