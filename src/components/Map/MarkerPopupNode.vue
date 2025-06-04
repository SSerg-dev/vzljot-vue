<template>
  <div class="popup-content">
    <a v-on:click="loadNode(marker.id)" href="#">{{ marker.name }}</a>
    <template v-if="marker.points.length > 0">
      <div>Точки учета:</div>
      <div style="overflow-y: auto; max-height: 130px; border: 1px solid #666; padding: 2px;">
        <div v-for="(item, index) in marker.points" :key="index">
          <div :class="store.state.env.statuses[item.state].image" style="margin-right: 3px;"></div>
          <a v-on:click="loadPoint(item.id)" href="#">{{ item.name }}</a>
        </div>
      </div>
    </template>
    <div>Состояние: {{ store.state.env.statuses[marker.state].text }}</div>
  </div>
</template>

<script>
  export default {
    props: {
      marker: Object,
      store: Object
    },
    methods: {
      loadNode(id) {
        window.open(`${window.props.baseUrl}Node/NodeDetailAlone/${id}`, '_blank')
      },
      loadPoint(id) {
        window.open(`${window.props.baseUrl}Point/PointDetailAlone/${id}`, '_blank')
      }
    }
  }

</script>

<style scoped>
  .map-container .popup-content {
    display: flex;
    flex-direction: column;
  }

</style>
