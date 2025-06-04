<template>
  <div class="test-sms-grid">
    <label>Телефон получателя:</label>
    <input v-model.trim="localPhone" type="text" @input="$emit('changed', localPhone)" :class="{ 'validation-error': error.phone }" :title="error.phone" maxlength="12" />
  </div>
</template>

<script>
  import * as regexp from '../../plugins/regexp.js'

  export default {
    props: {
      phone: String
    },
    data() {
      return {
        localPhone: this.phone,
        error: {
          phone: null
        }
      }
    },
    methods: {
      validate() {
        Object.keys(this.error).forEach(r => this.error[r] = null)

        if (!this.localPhone) {
          this.error.phone = 'Необходимо задать номер телефона.'
        }

        if (this.localPhone && !regexp.matcher.email.test(this.localPhone)) {
          this.error.phone = 'Неверно задан номер телефона.'
        }

        return !Object.keys(this.error).some(r => this.error[r])
      }
    }
  }

</script>

<style scoped>
  .test-sms-grid {
    display: grid;
    gap: 5px 3px;
    grid-template-columns: auto 1fr;
    align-items: center;
    min-height: 50px;
  }

</style>