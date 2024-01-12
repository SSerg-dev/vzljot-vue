<template>
  <div :style="item.getStyle()">
    <div style="display:flex; height: 100%;">
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="width: 0; height: 0;">
        <defs>
          <clipPath :id="item.Guid">
            <path :d="item.getPath()" />
          </clipPath>
        </defs>
      </svg>
      <div :style="item.getItemStyle()" :title="item.ToolTip"/>
      <div v-if="item.DefaultText && item.UseDefaultText" :style="item.getTextStyle()">{{ item.DefaultText }}</div>
    </div>
  </div>

</template>

<script>
  export default {
    name: 'coneComponent',
    props: {
      item:  {
        type: Object,
        default: null
      }
    }
  }
</script>
