<template>
  <ul class="header-wrapper" :style="styleColors">
    <li>
      <a class="brand" :href="link"><img :src="image"/></a>
    </li>
    <div :class="[{ collapse: show === false }, 'menu-bar']">
      <div class="menu-wrapper">
        <slot></slot>
      </div>
      <div class="menu-wrapper">
        <slot name="right"></slot>
      </div>
    </div>
    <div class="toggle-wrapper">
      <div class="toggle" :style="toggleColors" @click.prevent="toggle">
        <a href="#" :class="['toggle', { 'toggle-cross': show }]">
          <span></span>
        </a>
      </div>
    </div>
  </ul>
</template>

<script>
export default {
  props: {
    link: String,
    image: String
  },
  data() {
    return {
      show: false
    }
  },
  computed: {
    styleColors() {
      return this.$store.getters.styleColors
    },
    toggleColors() {
      return {
        color: this.$store.state.colors.fill,
        'background-color': this.$store.state.colors.text
      }
    }
  },
  methods: {
    toggle() {
      this.show = !this.show
    }
  }
}
</script>

<style>
.header-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  font-size: 14px;
  padding-inline-start: 0;
  padding: 0 5px;
  margin: 0;
  list-style-type: none;
  user-select: none;
}

.header-wrapper li {
  display: flex;
}

.header-wrapper .brand {
  display: inline-flex;
  text-decoration: none;
}

.header-wrapper .toggle-wrapper {
  padding: 3px;
}

.header-wrapper .toggle {
  display: flex;
  width: 22px;
  height: 22px;
  cursor: pointer;
  border-radius: 50%;
  position: relative;
}

.header-wrapper a,
.header-wrapper a:hover {
  color: inherit;
}

.header-wrapper .toggle span,
.header-wrapper .toggle span::before,
.header-wrapper .toggle span::after {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 2px;
  margin-top: -1px;
  margin-left: -6px;
  background-color: currentColor;
}

.header-wrapper .toggle span::before,
.header-wrapper .toggle span::after {
  content: '';
  transition: 0.2s;
}

.header-wrapper .toggle span::before {
  transform: translateY(-4px);
}

.header-wrapper .toggle span::after {
  transform: translateY(4px);
}

.header-wrapper .toggle-cross span {
  height: 0;
}

.header-wrapper .toggle-cross span::before {
  transform: translateY(1px) rotate(45deg);
}

.header-wrapper .toggle-cross span::after {
  transform: translateY(1px) rotate(-45deg);
}

.menu-bar {
  display: flex;
  flex: 1;
  justify-content: space-between;
  background-color: inherit;
  color: inherit;
  min-height: 29px;
}

.menu-bar .menu-wrapper {
  display: inline-flex;
  color: inherit;
}

@media all and (max-width: 768px) {
  .menu-bar {
    display: block;
    z-index: 9999;
    position: absolute;
    top: 100%;
    right: 0;
    transition: all 0.2s;
  }

  .menu-bar .menu-wrapper {
    display: block;
  }
}

.collapse {
  display: none;
}

@media all and (min-width: 768px) {
  .collapse {
    display: flex;
  }

  .header-wrapper .toggle {
    display: none;
  }
}
</style>
