<template>
  <div class="component-detail">
    <tabs>
      <tab v-if="$store.state.user?.userRights.measureScheme" text="Точки учета">
        <point-list  v-bind="{ id: 0, type: 5 }"/>
      </tab>
      <tab v-if="$store.state.user?.userRights.reportFile" text="Сформированные отчеты">
        <report-file-list v-bind="{ id: 0, type: 5 }" />
      </tab>
    </tabs>
  </div>
</template>

<script>
  import PointList from './PointList.vue'
  import ReportFileList from '../ReportFile/ReportFileList.vue'
  import Tab from '../Tabs/Tab.vue'
  import Tabs from '../Tabs/Tabs.vue'

  export default {
    components: {
      PointList,
      ReportFileList,
      Tab,
      Tabs
    }
  }



</script>
