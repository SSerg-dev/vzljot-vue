<template>
  <div style="position: relative; min-width: 400px">
    <fieldset>
      <legend>Файл с подписью</legend>
      <button @click="onLoadSignedClick()">Выгрузить файл</button>
    </fieldset>
    <fieldset>
      <legend>Исходный файл</legend>
      <button @click="onLoadOriginClick()">Выгрузить файл</button>
    </fieldset>
    <fieldset>
      <legend>Проверка подписи</legend>
      <button @click="onVerifyClick()">Проверить подпись</button>
      <label class="row">{{ message }}</label>
      <label class="row">Отпечаток: {{ thumbprint }}</label>
      <label class="row">Имя субъекта: {{ subject }}</label>
    </fieldset>
    <spinner :show="wait" :text="spinnerText" />
  </div>
</template>

<script>
import Export from '../../plugins/export'

export default {
  props: {
    id: Number
  },
  data() {
    return {
      message: 'Проверка подписи не проводилась',
      thumbprint: null,
      subject: null,
      wait: false,
      spinnerText: '',
      exporter: new Export(this.$http)
    }
  },
  methods: {
    async method(f, ...args) {
      this.wait = true
      try {
        await f(...args)
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.wait = false
      }
    },
    onLoadSignedClick() {
      this.method(this.load, this.id, 'p7s')
    },
    onLoadOriginClick() {
      this.method(this.load, this.id, 'pdf')
    },
    async load(id, ext) {
      this.spinnerText = 'Выгрузка файла отчета...'
      this.wait = true
      try {
        await this.exporter.get('reportFile/load', { id: id, ext: ext })
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.wait = false
      }
    },
    onVerifyClick() {
      this.method(this.verify, this.id)
    },
    async verify(id) {
      this.spinnerText = 'Проверка подписи...'
      this.wait = true
      try {
        let { data } = await this.$http.get('reportFile/verify', { params: { id } })
        if (data) {
          this.message = data.message
          this.thumbprint = data.thumbprint
          this.subject = data.subject
        }
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.wait = false
      }
    }
  }
}
</script>
