import throttle from './throttle.js'

export default class Idle {
  constructor (timeout, onAway) {
    this.events = ['click', 'mousemove', 'mouseenter', 'keydown', 'scroll', 'mousewheel', 'touchmove', 'touchstart']
    this.timeout = 1000
    this.timestamp = new Date().getTime()
    this.onAway = null
    this.timer = null
    this.started = false

    if (timeout && Number.isInteger(timeout) && timeout > 0) {
      this.timeout = timeout * 1000 * 60
    }
    if (onAway) {
      this.onAway = onAway
    }

    this.throttle = throttle(() => {
      this.timestamp = new Date().getTime()

      if (this.timer !== null) {
        clearTimeout(this.timer)
      }
      this.timer = setTimeout(() => this.checkAway(), this.timeout)
    }, 200)
  }

  start () {
    if (!this.started) {
      for (let event of this.events) {
        window.addEventListener(event, this.throttle)
      }
      this.timestamp = new Date().getTime()
      this.timer = setTimeout(() => this.checkAway(), this.timeout)
      this.started = true
    }
  }

  stop () {
    if (this.timer) {
      clearTimeout(this.timer)
    }

    if (this.started) {
      for (let event of this.events) {
        window.removeEventListener(event, this.throttle)
      }
    }
    this.started = false
  }

  checkAway () {
    if (this.timestamp + this.timeout < new Date().getTime()) {
      clearTimeout(this.timer)
      for (let event of this.events) {
        window.removeEventListener(event, this.throttle)
      }
      if (this.onAway) {
        return this.onAway()
      }
    }
  }
}
