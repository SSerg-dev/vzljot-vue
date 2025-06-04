<template>
  <form class="password-grid">
    <label>Пароль на сертификат:</label>
    <input
      v-model="password"
      type="password"
      maxlength="32"
      autocomplete="new-password"
      :class="{ 'validation-error': error.password.value }"
      :title="error.password.title"
    />

    <label>Повторите пароль:</label>
    <input
      v-model="confirmPassword"
      type="password"
      maxlength="32"
      autocomplete="new-password"
      :class="{ 'validation-error': error.confirmPassword.value }"
      :title="error.confirmPassword.title"
    />
  </form>
</template>

<script>
export default {
  data() {
    return {
      password: null,
      confirmPassword: null,
      error: {
        password: {
          value: false,
          title: null,
        },
        confirmPassword: {
          value: false,
          title: null,
        },
      },
    }
  },
  methods: {
    getCertPassword() {
      return this.password
    },
    validate() {
      Object.keys(this.error).forEach(
        (r) => (this.error[r] = { value: false, title: '' })
      )

      if (!this.password) {
        this.error.password.value = true
        this.error.password.title = 'Необходимо задать пароль.'
      }

      if (this.password !== this.confirmPassword) {
        this.error.confirmPassword.value = true
        this.error.confirmPassword.title = 'Пароли не совпадают.'
      }

      return !Object.keys(this.error).some((r) => this.error[r].value === true)
    },
  },
}
</script>

<style scoped>
.password-grid {
  display: grid;
  gap: 5px 3px;
  grid-template-columns: auto 1fr;
  align-items: center;
  min-height: 50px;
}
</style>
