<template>
  <div class="login-background">
    <div class="login-wrapper" @keydown.enter.prevent="login">
      <expansion-item :resizable="false" :caption="modalTitle">
        <form @submit.prevent="login">
          <div class="login-grid">
            <label>Пользователь:</label>
            <input
              v-model="user"
              type="text"
              maxlength="50"
              style="width: 160px"
              autocomplete="username"
              :disabled="changePw"
            />
            <label>Пароль:</label>
            <input
              v-model="password"
              type="password"
              maxlength="32"
              style="width: 160px"
              autocomplete="current-password"
            />
            <label v-if="changePw">Новый пароль:</label>
            <input
               v-if="changePw"
              v-model="newPw1"
              type="password"
              maxlength="32"
              style="width: 160px"
            />
            <label v-if="changePw">Подтверждение:</label>
            <input
               v-if="changePw"
              v-model="newPw2"
              type="password"
              maxlength="32"
              style="width: 160px"
            />
          </div>
        </form>
      </expansion-item>
      <v-button :caption="buttonText" :f="login" :disabled="disabled" autofocus />
    </div>
  </div>
</template>
<script>
import ExpansionItem from './ExpantionPanel.vue'
import * as Constants from '../constants.ts';

export default {
  components: { ExpansionItem },
  props: {
    connection: Object,
  },
  data() {
    return {
      user: null,
      password: null,
      changePw: false,
      newPw1: null,
      newPw2: null
    }
  },
  computed: {
    disabled() {
      return !this.user
    },
    modalTitle() {
      return this.changePw ? 'Смена пароля' : 'Вход в систему';
    },
    buttonText() {
      return this.changePw ? 'Сохранить' : 'Вход';
    }
  },
  methods: {
    async login() {
      if (this.user) {
        try {
          let loginArgs = {
            user: this.user,
            password: this.password
          }

          if (this.changePw) {
            if (this.newPw1 !== this.newPw2) {
              this.$store.commit('notification', {
                type: 1,
                text: 'Новый пароль и подтверждение должны совпадать!',
              })
              return
            }

            loginArgs.ChangePassword = true
            loginArgs.NewPassword = this.newPw1
          }

          await this.$http.post('account/login', loginArgs)

          const data = JSON.parse(
            await this.connection.invoke('connect', this.user, this.password)
          )

          for (let prop in data.data) {
            this.$store.commit(prop, data.data[prop])
          }

          if (this.$store.state.env.resultTypes[data.type].type === 'error') {
            this.$store.commit('notification', data)
          }

          this.$emit('login')
        } catch (err) {
          const errCode = err.response.headers[Constants.VSPErrorHeader]
          console.log(Constants.VSPErrorHeader, errCode)

          if (errCode === Constants.PasswordResetRequired) {
              this.changePw = true
          }
          else if (errCode === Constants.PasswordResetDone) {
            this.changePw = false
            this.password = ''
          }

          this.$store.commit('notification', {
            type: 1,
            text: err.response.data,
          })
        }
      }
    },
  },
}
</script>
<style scoped>
.login-background {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(169, 175, 183, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  transition: opacity 0.3s ease;
}

.login-wrapper {
  background-color: white;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.login-grid {
  display: grid;
  gap: 5px 3px;
  grid-template-columns: auto 1fr;
  align-items: center;
  padding: 20px;
}

.login-grid label {
  text-align: right;
}
</style>
