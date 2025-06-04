<template>
  <div class="card">
    <div class="title" :style="styleColors">{{ title }}</div>
    <div class="content">
      <slot></slot>
    </div>
    <div class="footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      title: String
    },
    computed: {
      styleColors() { return this.$store.getters.styleColors }
    }
  }

</script>

<style>
  .card {
    display: flex;
    flex: 1;
    flex-direction: column;
    margin: 15px;
    box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
    transition: all 0.3s cubic-bezier(.25,.8,.25,1);
    border: 1px #ccc solid;
    position: relative;
  }

  .card:hover {
    box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
  }

  .card .title {
    padding: 10px;
    font-size: 16px;
    font-family: monospace;
  }

  .card .content {
    display: flex;
    flex: 1;
    padding: 5px;
    border-top: 1px #ccc solid;
  }

  .card .footer {
    position: absolute;
    right: 0;
    bottom: 0;
  }

</style>
