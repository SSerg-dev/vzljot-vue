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
              {{ `${item.id}  ` }}
              <!-- {{ current }} -->
              {{ item.name }}

            </option>
          </select>
        </div>
        <div class="three-item-3">
          <label>Последняя поверка:</label>
        </div>
        <div class="three-item-4 date-picker">
          <date-picker v-model="timeLastChecking" :format="dateFormat" @update:modelValue="handleLastCheckingChange"/>
        </div>
        <div class="three-item-5">
          <label>Следующая поверка:</label>
        </div>
        <div class="three-item-6 date-picker">
          <date-picker v-model="timeNextChecking" :format="dateFormat" @update:modelValue="handleNextCheckingChange"/>
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
      localTimeStart: this.timeStart,
      localTimeEnd: this.timeEnd,
      dateFormat: 'DD.MM.YYYY',

      equipType: new EquipType({}),
      modifications: [],
      
      timeLastChecking: null, 
      timeNextChecking: null,  // new Date(),
      equipTypeModificationId: null,

      // selectedNodeId: null,
      // current: 22
    }
  },
  computed: {
    ...mapGetters({
      getCard: 'getCard',
    }),
  },
  watch: {
    // selectedNodeId(newVal) {
    //   console.log('$$ newVal', newVal)
    // },
    // current(numberId) {
    //   console.log('$$ current', numberId)
    // }
  },
  async created() {
     
    //this.selectedNodeId = this.$store.getters.getCard.selectedNodeId
    //if (this.selectedNodeId) {
    await this.changeNode(this.$store.getters.getCard.selectedNodeId)
    //}
    this.$emitter.on('tree-component:change-node', (id) => {
      this.changeNode(id)
    })

    // this.current = this.selectedNodeId
  },

  async mounted() {
    
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
      const changedLastChecking = event
      this.$emit('last-checking-updated', changedLastChecking)
    },
    handleNextCheckingChange(event) {
      const changedNextChecking = event
      this.$emit('next-checking-updated', changedNextChecking)
    },

    async changeNode(id) {
      try {
        const { data } = await this.$http.get('equip/equip', { params: { id } })
        
        await this.equipType.init(data.equipType, 'code') 
        // await this.equipType.init(data.equipType)

        this.timeLastChecking = data.timeLastChecking
        this.timeNextChecking = data.timeNextChecking
        this.equipTypeModificationId = data.equipTypeModificationId

        // console.log('$$ this.equipTypeModificationId', this.equipTypeModificationId)
        //this.current = this.equipTypeModificationId

        if (this.timeLastChecking && !this.timeNextChecking) {
          let currentDate = {...this.timeLastChecking}
          currentDate.setFullYear(
            currentDate.getFullYear() + this.equipType.interval
          )
          this.timeNextChecking = currentDate
        } else {
          this.timeNextChecking = data.timeNextChecking
        }
        
        this.modifications = this.equipType.modifications.map((item) => ({
          id: item.id,
          name: item.name,
          selected: this.equipTypeModificationId === item.id ? true : false
        }))
        // console.log('$$ this.modifications', JSON.stringify(this.modifications))

        const options = {
          modifications: this.modifications,
        }
        this.$store.commit('setCard', options)
        

      } catch (error) {
        store.commit('error', error)
      }
    },
  },
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
