export default class PollTask {
  constructor() {
    this.class = {
      fas: true,
      'fa-cog': true,
      pollTask: true,
      poll: false,
    }

    this.style = {
      color: 'lightslategray',
    }

    this.text = null
  }

  poll() {
    this.class.poll = true
    this.style.color = 'lightslategray'
    this.text = null
  }

  success(message) {
    this.class.poll = false
    this.style.color = 'mediumseagreen'
    this.text = message
  }

  warning(message) {
    this.class.poll = false
    this.style.color = 'coral'
    this.text = message
  }

  error(message) {
    this.class.poll = false
    this.style.color = 'crimson'
    this.text = message
  }

  stop(message) {
    this.class.poll = false
    this.style.color = 'lightslategray'
    if (message) {
      this.text = message
    }
  }
}
