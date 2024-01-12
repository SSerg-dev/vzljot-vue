<template>
  <div class="notifications" :style="styles">
    <transition-group name="list">
      <div v-for="r in list" :class="['notification', r.type]" @click="destroy(r)" :key="r.id">
        <div v-if="r.title" class="title" v-html="r.title"/>
        <div class="content" v-html="r.text"/>
      </div>
    </transition-group>
  </div>
</template>

<script>
  const id = (i => () => i++)(0)

  export default {
    props: {
      width: {
        type: [Number, String],
        default: 300
      },
      reverse: {
        type: Boolean,
        default: false
      },
      position: {
        type: Object,
        default() {
          return {
            x: 'right',
            y: 'bottom'
          }
        }
      },
      max: {
        type: Number,
        default: Infinity
      }
    },
    data() {
      return {
        list: [],
        duration: 3000,
        speed: 500
      }
    },
    created() {
      this.$watch(
        () => this.notification,
        value => this.add(value)
      )
    },
    computed: {
      actualWidth() {
        return { type: 'px', value: this.width }
      },
      styles() {
        return {
          width: this.actualWidth.value + this.actualWidth.type,
          [this.position.y]: '0px',
          [this.position.x]: '0px'
        }
      },
      botToTop() {
        return Object.prototype.hasOwnProperty.call(this.styles, 'bottom')
      },
      notification() {
        return this.$store.state.notification
      }
    },
    methods: {
      add(event) {
        let type = event.type

        if (!isNaN(type)) {
          if (this.$store.state.env) {
            type = this.$store.state.env.resultTypes[type].type
          } else {
            type = type === 0 ? 'success' : 'error'
          }
        }

        const item = {
          id: id(),
          title: event.title,
          text: event.text,
          type,
          speed: this.speed,
          length: this.duration + 2 * this.speed
        }

        if (this.duration >= 0) {
          item.timer = setTimeout(() => this.destroy(item), item.length)
        }
        let direction = this.reverse ? !this.botToTop : this.botToTop
        let indexToDestroy = -1
        if (direction) {
          this.list.push(item)
          if (this.list.length > this.max) {
            indexToDestroy = 0
          }
        } else {
          this.list.unshift(item)
          if (this.list.length > this.max) {
            indexToDestroy = this.list.length - 1
          }
        }
        if (indexToDestroy !== -1) {
          this.destroy(this.list[indexToDestroy])
        }
      },
      destroy(item) {
        clearTimeout(item.timer)
        this.list.splice(this.list.indexOf(item), 1)
      }
    }
  }

</script>

<style scoped>
  .notifications {
    position: absolute;
    overflow: hidden;
    z-index: 10001;
  }

  .title {
    font-weight: 600;
  }

  .notification {
    padding: 10px;
    margin: 5px 0 0 0;
    background: white;
    border: 1px solid #eee;
    border-left: 5px solid #ccc;
  }

  .notification.info {
    color: #31708f;
    background: #d9edf7;
    border-color: #bce8f1;
    border-left-color: #31708f;
  }

  .notification.warning {
    color: #8a6d3b;
    background: #fcf8e3;
    border-color: #faebcc;
    border-left-color: #8a6d3b;
  }

  .notification.error {
    color: #a94442;
    background: #f2dede;
    border-color: #ebccd1;
    border-left-color: #a94442;
  }

  .notification.success {
    color: #3c763d;
    background: #DBF0D8;
    border-color: #d6e9c6;
    border-left-color: #3c763d;
  }

  .list-enter-active, .list-leave-active {
    transition: all .5s;
  }

  .list-enter-from, .list-leave-to {
    transform: translateX(100%);
  }

  .list-move {
    transition: all .5s;
  }

</style>
