export default class Task {
  constructor({ id = null, running = false, name = null, text = null, err = 0}) {
    this.id = id
    this.name = name
    this.running = running,
    this.text = text
    this.err = err

    this.class = {
      fas: true,
      'fa-cog': true,
      pollTask: true,
      running,
    }

    this.style = {
      color: this.err === 0 ? 'lightslategray': 'crimson',
    }
  }

  start() {
    this.class.running = true
    this.style.color = 'lightslategray'
  }

  success() {
    this.style.color = 'mediumseagreen'
  }

  error() {
    this.style.color = 'crimson'
  }

  stop() {
    this.class.running = false
    this.style.color = 'lightslategray'
  }
}
