<template>
  <div class="test-email-grid">
    <label>Почта получателя:</label>
    <input v-model.trim="localEmail" type="text" @input="$emit('changed', localEmail)" :class="{ 'validation-error': error.email }" :title="error.email"/>
  </div>
</template>

<script>
  import * as regexp from '../../plugins/regexp.js'

  export default {
    props: {
      email: String
    },
    data() {
      return {
        localEmail: this.email,
        error: {
          email: null
        }
      }
    },
    methods: {
      validate() {
        Object.keys(this.error).forEach(r => this.error[r] = null)

        if (!this.localEmail) {
          this.error.email = 'Необходимо задать почту.'
        }

        if (this.localEmail && !regexp.matcher.email.test(this.localEmail)) {
          this.error.email = 'Неверно задана почта.'
        }

        return !Object.keys(this.error).some(r => this.error[r])
      }
    }
  }

</script>

<style scoped>
  .test-email-grid {
    display: grid;
    gap: 5px 3px;
    grid-template-columns: auto 1fr;
    align-items: center;
    min-height: 50px;
  }

</style>