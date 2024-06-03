<template>
  <div class="carousel-container">
    <!-- <transition-group name="carousel-fade" mode="out-in">
      <div v-for="(slide, index) in slides" :key="index" class="slide" :style="[slide.image ? { background: 'url(' + slide.image + ')  no-repeat fixed center' } : '']">{{ slide.image ? '' : 'Слайд ' + (index + 1) }}</div>
    </transition-group> -->
    <transition-group name="carousel-fade">
      <div v-for="(slide, index) in slides" :key="index" class="slide" :style="[slide.image ? { background: 'url(' + slide.image + ')  no-repeat fixed center' } : '']">{{ slide.image ? '' : 'Слайд ' + (index + 1) }}</div>
    </transition-group>
    <div class="button-left">
      <transition name="carousel-button-click_effect">
        <div v-if="animateLeft" class="animate-button"></div>
      </transition>
      <div class="button fas fa-chevron-left" @click="throttledDirectionClick(-1)"></div>
    </div>
    <div class="button-right">
      <transition name="carousel-button-click_effect">
        <div v-if="animateRight" class="animate-button"></div>
      </transition>
      <div class="button fas fa-chevron-right" @click="throttledDirectionClick(1)"></div>
    </div>
    <div class="footer">
      <div v-for="(slide, index) in slides" :key="index" class="button" @click="pointClick(index)">
        <div :class="['point', { active: currentIndex === index }]"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    slides: {
      type: Array,
      required: true
    },
    interval: {
      type: Number,
      default: 5000
    }
  },
  data() {
    return {
      throttledDirectionClick: this.throttle(this.directionClick, 500),
      currentIndex: 0,
      animateLeft: false,
      animateRight: false,
      timer: 0
    }
  },
  mounted() {
    this.timer = setInterval(() => this.setIndex(1), this.interval)
  },
  methods: {
    throttle(fn, interval) {
      let lastTime
      return function () {
        let timeSinceLastExecution = Date.now() - lastTime
        if (!lastTime || timeSinceLastExecution >= interval) {
          fn.apply(this, arguments)
          lastTime = Date.now()
        }
      }
    },
    pointClick(index) {
      this.currentIndex = index
      clearInterval(this.timer)
      this.timer = setInterval(() => this.setIndex(1), this.interval)
    },
    setIndex(direction) {
      let index = this.currentIndex + direction
      if (index > this.slides.length - 1) {
        index = 0
      } else if (index < 0) {
        index = this.slides.length - 1
      }
      this.currentIndex = index
    },
    directionClick(direction) {
      clearInterval(this.timer)
      this.setIndex(direction)
      if (direction < 0) {
        this.animateLeft = !this.animateLeft
      } else {
        this.animateRight = !this.animateRight
      }

      this.timer = setInterval(() => this.setIndex(1), this.interval)
    }
  }
}
</script>

<style>
.carousel-container {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
  overflow: hidden;
}

.carousel-container .slide {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex: 1;
}

.carousel-container .button-left {
  left: 5px;
}

.carousel-container .button-right {
  right: 5px;
}

.carousel-container .button-left,
.carousel-container .button-right {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 30px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  width: 48px;
  height: 48px;
}

.carousel-container .footer {
  display: flex;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  height: 50px;
  align-items: center;
  justify-content: center;
}

.carousel-container .button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  background-color: transparent;
  border-radius: 50%;
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.carousel-container .button-left .button,
.carousel-container .button-right .button {
  width: 48px;
  height: 48px;
  color: white;
}

.carousel-container .footer .button {
  width: 28px;
  height: 28px;
  margin: 0 8px;
}

.carousel-container .animate-button {
  content: '';
  background-color: white;
  border-radius: 50%;
  display: inline-flex;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: scale(0.001, 0.001);
}

.carousel-container .button:hover {
  background-color: rgba(255, 255, 255, 0.12);
}

.carousel-container .footer .button:hover .point {
  background-color: rgba(255, 255, 255, 1);
}

.carousel-container .footer .point {
  display: inline-flex;
  cursor: inherit;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  width: 14px;
  height: 14px;
  transition: background-color 0.5s ease;
}

.carousel-container .footer .active {
  background-color: white;
  width: 16px;
  height: 16px;
}

.carousel-fade-enter-active,
.carousel-fade-leave-active {
  transition: opacity 0.4s ease;
}

.carousel-fade-enter,
.carousel-fade-leave-to {
  opacity: 0;
}

.carousel-button-click_effect-enter-active {
  animation: carousel-button-click_effect 0.5s ease-out;
}

.carousel-button-click_effect-leave-active {
  animation: carousel-button-click_effect 0.5s ease-out;
}

@keyframes carousel-button-click_effect {
  50% {
    transform: scale(1.2, 1.2);
    opacity: 0;
  }
  99% {
    transform: scale(0.001, 0.001);
    opacity: 0;
  }
  100% {
    transform: scale(0.001, 0.001);
    opacity: 1;
  }
}
</style>
