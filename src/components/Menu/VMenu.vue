<template>
  <li class="menu" @click="onClick()" :style="{ cursor }">
    <div class="wrapper">
      <span v-if="image" :class="['image', ...image.split(' ')]">
        <span v-if="count > 0" :style="signStyle">{{ count }}</span>
      </span>
      <span v-if="text">{{ text }}</span>
    </div>
  </li>
</template>

<script>
  export default {
    props: {
      name: String,
      text: String,
      image: {
        type: String,
        default: ''
      },
      count: Number,
      cursor: {
        type: String,
        default: 'pointer'
      }
    },
    data () {
      return {
        signStyle: {
          position: 'absolute',
          right: '100%',
          top: '-3px',
          fontSize: 'small',
          padding: '0 2px',
          fontWeight: 'bold',
          fontFamily: 'monospace',
          backgroundColor: this.$store.getters.styleColors.backgroundColor
        }
      }
    },
    methods: {
      onClick() {
        this.$emit('clicked', this.name)
      }
    }
  }

</script>

<style scoped>

  .menu {
    align-items: center;
    cursor: pointer;
    padding: 5px 10px;
    text-decoration: none;
    color: inherit;
    transition: background-color .2s ease, color .2s ease;
  }

  .menu:focus,
  .menu:hover {
    text-decoration: none;
  }

  .wrapper {
    display: flex;
    align-items: center;
    position: relative;
    color: currentColor;
  }

  .wrapper:after {
    position: absolute;
    background-color: currentColor;
    display: block;
    content: "";
    height: 2px;
    width: 0;
    left: 50%;
    transition: width .2s ease-in-out;
    transform: translateX(-50%);
    bottom: -2px;
  }

  .menu:hover .wrapper:after {
    width: 100%;
  }

  .image {
    position: relative;
    font-size: larger;
    margin-right: 5px;
  }

  @media all and (max-width:768px) {
    .menu {
      display: block;
    }

    .menu.right {
      margin-left: initial;
    }

    .menu .icon {
      margin-right: 0;
    }
  }

</style>
