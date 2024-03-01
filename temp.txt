<template>
  <div>
    <expantion-panel caption="Средства измерений" :opened="true">
      <div class="equip-grid three-container">
        <div class="three-item-1">
          <label>Исполнение:</label>
        </div>
        <div class="three-item-2">
          <select style="width: 100%" @change="handleOptionChange">
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
      </div>
    </expantion-panel>
  </div>
</template>

<script>
import BaseComponent from '@/components/Base/BaseComponent.vue'
import ExpantionPanel from '@/components/ExpantionPanel.vue'
import DatePicker from '@/components/Inputs/DatePicker.vue'
import EquipType from '@/classes/equipType'
// import Equip from '@/classes/equip'
import { mapGetters } from 'vuex'

export default {
  name: 'EquipDetailModifications',
  components: {
    ExpantionPanel,
    DatePicker,
  },
  extends: BaseComponent,
  data() {
    return {
      dateFormat: 'DD.MM.YYYY',

      equipType: new EquipType({}),
      modifications: [],

      timeLastChecking: null,
      timeNextChecking: null,
      equipTypeModificationId: null,

      localData: null,

      firstModifications: {
        id: -1,
        name: '<Нет>',
        selected: false,
      },
      nodeChange: null,
    }
  },
  computed: {
    ...mapGetters({
      getCard: 'getCard',
    }),
  },
  watch: {
    getCard(newVal) {
      // this.localData = newVal
      if (newVal.nodeChange) {
        this.equipType = newVal.nodeChange.equipType
        this.timeLastChecking = newVal.nodeChange.timeLastChecking
        this.timeNextChecking = newVal.nodeChange.timeNextChecking
        this.equipTypeModificationId = newVal.nodeChange.equipTypeModificationId
        
        this.changeNode(newVal.nodeChange.id)
        // console.log('$$ getCard', JSON.stringify(data),JSON.stringify(newVal.nodeChange))
      }
    },
  },
  created() {},

  mounted() {
    if (this.$store.getters.getCard.selectedNodeId) {
      this.changeNode(this.$store.getters.getCard.selectedNodeId)
    }
  },
  methods: {
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
    },
    handleNextCheckingChange(event) {
      let changedNextChecking = new Date(event).getTime()
      this.$emit('next-checking-updated', changedNextChecking)
    },

    async changeNode(id) {
      try {
          const { data } = await this.$http.get('equip/equip', { params: { id } })

          await this.equipType.init(data.equipType, 'code')
          // await this.equipType.init(data.equipType)

          this.timeLastChecking = data.timeLastChecking
            ? new Date(data.timeLastChecking)
            : null

          this.timeNextChecking = data.timeNextChecking
            ? new Date(data.timeNextChecking)
            : null

          /*
         if (this.timeLastChecking && !this.timeNextChecking) {
          let currentDate = {...this.timeLastChecking}
          currentDate.setFullYear(
            currentDate.getFullYear() + this.equipType.interval
          )
          this.timeNextChecking = currentDate
        } else {
          this.timeNextChecking = data.timeNextChecking
        }
        */

          this.equipTypeModificationId = data.equipTypeModificationId

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
            selectedLastNodeId: id,
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

.three-item-1,
.three-item-3,
.three-item-5 {
  justify-self: end;
}

.three-item-2,
.three-item-4,
.three-item-6 {
  grid-column: 2 / span 2;
}

.date-picker {
  width: 20%;
}
</style>
