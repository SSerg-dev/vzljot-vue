<template>
  <div class="component-detail">
    <tabs>
      <tab v-if="$store.state.user?.userRights.reportFile" text="Сформированные отчеты">
        <report-file-list v-bind="{ id: 0, type: 4 }" />
      </tab>
    </tabs>
  </div>
</template>

<script>
  import ReportFileList from '../ReportFile/ReportFileList.vue'
  import Tab from '../Tabs/Tab.vue'
  import Tabs from '../Tabs/Tabs.vue'

  export default {
    components: {
      ReportFileList,
      Tab,
      Tabs
    }
  }

</script>
