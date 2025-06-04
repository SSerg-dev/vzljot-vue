<template>
  <div :guid="item.Guid" :title="item.ToolTip" :style="item.getStyle()">
    <div :style="item.getImgStyle()"/>
    <div :style="item.getTextStyle()">{{ item && item.x ? item.x.text : null }}</div>
    <div v-if="item.LinkEquip >= 0 && item.LinkSchemaType >= 0 && item.LinkSchema >= 0" title="Перейти..." class="fas fa-project-diagram icon" @click="$emit('open', item)"></div>
  </div>
</template>

<script>

export default {
  name: 'imageComponent',
  props: {
    item: {
      type: Object,
      default: null
    }
  }
}
</script>

<style scoped>
.icon {
  position: absolute;
  left: 0;
  color: #666;
  padding: 2px;
  cursor: pointer;
}
</style>
