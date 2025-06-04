<template>
  <div
    :class="[
      'datepicker',
      { 'datepicker-clearable': clearable && text && !disabled },
    ]"
  >
    <input
      ref="input"
      type="text"
      @keydown="keydown"
      :value="text"
      :class="[show ? 'focus' : '', inputClass]"
      :disabled="disabled"
      :placeholder="placeholder"
      :name="name"
    />
    <span
      class="datepicker-icon fas fa-calendar-alt"
      @click="onIconClick"
      :disabled="disabled"
    />
    <span
      class="datepicker-close fas fa-times"
      @click.stop="cls"
      :disabled="disabled"
    />
    <transition name="datepicker-anim">
      <div
        class="datepicker-popup"
        :class="[popupClass]"
        tabindex="-1"
        v-if="show"
      >
        <date-picker-calendar
          v-model:value="date"
          v-bind="{ disabledDate, format, local }"
          @input="ok"
        />
      </div>
    </transition>
  </div>
</template>

<script>
import DatePickerCalendar from './DatePickerCalendar.vue'

export default {
  components: { DatePickerCalendar },
  props: {
    name: [String],
    inputClass: [String],
    popupClass: [String],
    modelValue: {
      type: [Date, Array, String, Number],
      default: () => new Date(),
    },
    disabled: [Boolean],
    clearable: {
      type: Boolean,
      default: false,
    },
    placeholder: [String],
    disabledDate: {
      type: Function,
      default: () => {
        return false
      },
    },
    format: {
      type: String,
      default: 'DD.MM.YYYY',
    },
    local: {
      type: Object,
      default() {
        return {
          dow: 1, // Monday is the first day of the week
          hourTip: 'Выберите час', // tip of select hour
          minuteTip: 'Выберите минуту', // tip of select minute
          secondTip: 'Выберите секунду', // tip of select second
          yearSuffix: '',
          monthsHead:
            'Январь_Февраль_Март_Апрель_Май_Июнь_Июль_Август_Сентябрь_Октябрь_Ноябрь_Декабрь'.split(
              '_'
            ), // months of head
          months: 'Янв_Фев_Мар_Апр_Май_Июн_Июл_Авг_Сен_Окт_Ноя_Дек'.split('_'), // months of panel
          weeks: 'Пн_Вт_Ср_Чт_Пт_Сб_Вс'.split('_'), // weeks
        }
      },
    },
  },
  data() {
    return {
      show: false,
      date: this.vi(this.modelValue),
    }
  },
  emits: ['update:modelValue', 'input'],
  provide() {
    return {
      toFormat: this.toFormat,
      disabledDate: this.disabledDate,
    }
  },
  computed: {
    text() {
      return this.modelValue ? this.toFormat(this.date) : ''
    },
  },
  watch: {
    modelValue() {
      this.date = this.vi(this.modelValue)
    },
  },
  methods: {
    keydown(event) {
      if (event.key === 'F5') {
        window.location.reload()
      }
      event.preventDefault()
      switch (event.key) {
        case 'Up':
        case 'ArrowUp':
          this.setNextDate(new Date(this.modelValue), 1)
          break
        case 'Down':
        case 'ArrowDown':
          this.setNextDate(new Date(this.modelValue), -1)
          break
        case 'Left':
        case 'ArrowLeft':
          this.setSelection(
            new Date(this.modelValue),
            this.getCursorPosition(this.$refs.input),
            -1
          )
          break
        case 'Right':
        case 'ArrowRight':
          this.setSelection(
            new Date(this.modelValue),
            this.getCursorPosition(this.$refs.input),
            1
          )
          break
      }
    },
    setSelection(value, position, direction) {
      if (!value) return

      const symbols = 'YDMHhmsS'.split('')
      const positions = {}
      const mask = this.getMask(value, this.format)

      symbols.forEach((symbol) => {
        let pos = mask.indexOf(symbol)
        if (pos > -1) {
          positions[symbol] = { start: pos, end: mask.lastIndexOf(symbol) + 1 }
        }
      })

      const reduced = {}

      this.format.split('').forEach((symbol) => {
        let pos = symbols.indexOf(symbol)
        if (pos > -1) {
          reduced[symbol] = true
          reduced[symbol] = Object.keys(reduced).length - 1
        }
      })

      const reducedArray = []

      for (let property in reduced) {
        reducedArray[reduced[property]] = property
      }

      let maskLength = mask.length
      let char = mask.charAt(
        maskLength === position ? (maskLength += -1) : position
      )
      let groupPosition = reduced[char] + direction

      switch (groupPosition) {
        case -1:
          char = reducedArray[reducedArray.length - 1]
          break
        case reducedArray.length:
          char = reducedArray[0]
          break
        default:
          char = reducedArray[groupPosition]
          break
      }
      if (char !== '') {
        if (
          this.$refs.input.selectionStart ||
          this.$refs.input.selectionStart === 0
        ) {
          this.$refs.input.selectionStart = positions[char]?.start
          this.$refs.input.selectionEnd = positions[char]?.end
        }
      }
    },
    setNextDate(value, diff) {
      if (!value) return

      const mask = this.getMask(value, this.format)
      let position = this.getCursorPosition(this.$refs.input)
      let maskLength = mask.length

      let year = value.getFullYear()
      let month = value.getMonth()
      let day = value.getDate()
      let hour = value.getHours()
      let minutes = value.getMinutes()
      let seconds = value.getSeconds()
      let milliseconds = value.getMilliseconds()

      const dayInMonth = [
        31,
        (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31,
      ]

      switch (
        mask.charAt(maskLength === position ? (maskLength += -1) : position)
      ) {
        case 'Y':
          if (year < 1970) {
            year = 1970
          }
          year += diff
          break
        case 'M':
          month += diff
          if (month > 11) month = 0
          if (month < 0) month = 11
          if (day > dayInMonth[month]) day = dayInMonth[month]
          break
        case 'D':
          day += diff
          if (day > dayInMonth[month]) day = 1
          if (day < 1) day = dayInMonth[month]
          break
        case 'H':
        case 'h':
          hour += diff
          if (hour > 23) hour = 0
          if (hour < 0) hour = 23
          break
        case 'm':
          minutes += diff
          if (minutes > 59) minutes = 0
          if (minutes < 0) minutes = 59
          break
        case 's':
          seconds += diff
          if (seconds > 59) seconds = 0
          if (seconds < 0) seconds = 59
          break
        case 'S':
          milliseconds += diff
          if (milliseconds > 999) milliseconds = 0
          if (milliseconds < 0) milliseconds = 999
          break
      }

      const date = new Date(
        year,
        month,
        day,
        hour,
        minutes,
        seconds,
        milliseconds
      )

      this.$emit('update:modelValue', date)
      this.$emit('input', date)

      const $this = this
      setTimeout(() => {
        $this.setSelection(this.modelValue, position, 0)
      })
    },
    getCursorPosition(element) {
      let position = 0

      if (element.selectionStart || element.selectionStart === 0) {
        position = element.selectionStart
      }

      return position
    },
    cls() {
      this.$emit('update:modelValue', null)
      this.$emit('input', null)
    },
    vi(val) {
      let date = val ? new Date(val) : new Date()

      return date
    },
    ok(date) {
      this.$emit('update:modelValue', date)
      this.$emit('input', date)
      this.show = false
    },
    getMap(time) {
      if (typeof time === 'number') {
        time = new Date(time)
      }
      const year = time.getFullYear()
      const month = time.getMonth()
      const day = time.getDate()
      const hours24 = time.getHours()
      const hours = hours24 % 12 === 0 ? 12 : hours24 % 12
      const minutes = time.getMinutes()
      const seconds = time.getSeconds()
      const milliseconds = time.getMilliseconds()
      const dd = (t) => ('0' + t).slice(-2)
      return {
        YYYY: year,
        MM: dd(month + 1),
        MMM: this.local.months[month],
        MMMM: this.local.monthsHead[month],
        M: month + 1,
        DD: dd(day),
        D: day,
        HH: dd(hours24),
        H: hours24,
        hh: dd(hours),
        h: hours,
        mm: dd(minutes),
        m: minutes,
        ss: dd(seconds),
        s: seconds,
        S: ('000' + milliseconds).slice(-3),
      }
    },
    getMask(time, format) {
      const mask = (str, s) => {
        let text = ''
        for (let i = 0; i < str.toString().length; i++) {
          text += s
        }
        return text
      }
      const map = this.getMap(time)

      return (format || this.format).replace(
        /Y+|M+|D+|H+|h+|m+|s+|S+/g,
        (str) => mask(map[str], str.toString()[0])
      )
    },
    toFormat(time, format) {
      const map = this.getMap(time)
      return (format || this.format).replace(
        /Y+|M+|D+|H+|h+|m+|s+|S+/g,
        (str) => map[str]
      )
    },
    hide(e) {
      if (!this.$el.contains(e.target)) {
        this.show = false
      }
    },
    async onIconClick() {
      this.show = !this.show && !this.disabled
    },
  },
  mounted() {
    document.addEventListener('click', this.hide)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.hide)
  },
}
</script>

<style scoped>
.datepicker {
  display: inline-block;
  position: relative;
}

.datepicker-icon,
.datepicker-close {
  justify-content: center;
  align-items: center;
  position: absolute;
  width: 1.5em;
  height: 100%;
  top: 0;
  right: 0;
  bottom: 0;
  cursor: pointer;
  user-select: none;
  font-size: medium;
  color: lightslategray;
}

.datepicker-icon[disabled='true'],
.datepicker-close[disabled='true'] {
  color: lightgray;
  cursor: default;
}

.datepicker-icon[disabled='true']::before,
.datepicker-close[disabled='true']::before {
  color: inherit;
  opacity: 0.7;
}

.datepicker-icon {
  display: flex;
}

.datepicker-close {
  display: none;
}

.datepicker-clearable:hover .datepicker-close {
  display: flex;
}

.datepicker-clearable:hover .datepicker-icon {
  display: none;
}

.datepicker > input {
  width: 100%;
}

.datepicker-popup {
  position: absolute;
  transition: all 0.2s ease;
  opacity: 1;
  transform: scaleY(1);
  transform-origin: center top;
  font-size: 12px;
  background: #fff;
  border: 1px solid #d9d9d9;
  box-shadow: 0 1px 6px rgba(99, 99, 99, 0.2);
  margin-top: 2px;
  outline: 0;
  padding: 5px;
  overflow: hidden;
  z-index: 999;
}

.datepicker-anim-enter-active {
  transform-origin: 0 0;
  animation: datepicker-anim-in 0.2s cubic-bezier(0.23, 1, 0.32, 1);
}

.datepicker-anim-leave-active {
  transform-origin: 0 0;
  animation: datepicker-anim-out 0.2s cubic-bezier(0.755, 0.05, 0.855, 0.06);
}

@keyframes datepicker-anim-in {
  0% {
    opacity: 0;
    transform: scaleY(0.8);
  }

  to {
    opacity: 1;
    transform: scaleY(1);
  }
}

@keyframes datepicker-anim-out {
  0% {
    opacity: 1;
    transform: scaleY(1);
  }

  to {
    opacity: 0;
    transform: scaleY(0.8);
  }
}
</style>
