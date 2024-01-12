export default class EventObserver {
  constructor () {
    this.observers = {}
  }

  on (event, fn) {
    if (!this.observers.hasOwnProperty(event)) {
      this.observers[event] = []
    }
    this.observers[event].push(fn)
  }

  off (event, fn) {
    this.observers[event] = this.observers[event].filter(subscriber => subscriber !== fn)
  }

  dispatch (event, data) {
    this.observers[event].forEach(subscriber => subscriber(data))
  }
}
