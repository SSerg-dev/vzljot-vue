<template>
  <div class="component-detail">
    <tabs>
      <tabx
        text="Списки приборов"
      >
        <info-equips-list /> 
      </tabx>
      <tabx
        text="Списки точек учета"
      >
        <h4>info-points-list</h4>
      </tabx>
    </tabs>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { onBeforeMount } from 'vue'

import Tabx from '@/components/Tabs/Tabx.vue'
import Tabs from '@/components/Tabs/Tabs.vue'

import InfoEquipsList from '@/components/InfoList/InfoEquip/InfoEquipsList.vue'

export default defineComponent({
  components: {
    Tabx,
    Tabs,
    InfoEquipsList,
  },
  setup() {
    onBeforeMount(() => {
    })
    return {
    }
  },
})
</script>
