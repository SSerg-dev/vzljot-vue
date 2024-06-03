<template>
  <div class="login-background">
    <div class="login-wrapper" @keydown.enter.prevent="login">
      <expantion-panel :resizable="false" caption="Вход в систему">
        <form @submit.prevent="login">
          <div class="login-grid">
            <label>Пользователь:</label>
            <input
              v-model="user"
              type="text"
              maxlength="50"
              style="width: 160px"
              autocomplete="username"
            />
            <label>Пароль:</label>
            <input
              v-model="password"
              type="password"
              maxlength="32"
              style="width: 160px"
              autocomplete="current-password"
            />
          </div>
        </form>
      </expantion-panel>
      <v-button caption="Вход" :f="login" :disabled="disabled" autofocus />
    </div>
  </div>
</template>
<script>
import VButton from './input/VButton.vue'
import ExpantionPanel from './ExpantionPanel.vue'

export default {
  components: {
    ExpantionPanel,
    VButton,
  },
  props: {
    connection: Object,
  },
  data() {
    return {
      user: null,
      password: null,
    }
  },
  computed: {
    disabled() {
      return !this.user
    },
  },
  methods: {
    async login() {
      if (this.user) {
        try {
          await this.$http.post('account/login', {
            user: this.user,
            password: this.password,
          })

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
