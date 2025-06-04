<template>
  <div class="component-detail">
    <preserver-component
      v-bind="{ loading, disabled: !hasChanges || loading, saving }"
      @saveClick="onSaveClick()"
    >
      <form-params v-bind="{ reportForm, forms, error }" @changed="onChange" />
    </preserver-component>
    <transition-group>
      <wizard
        v-if="wizard"
        v-bind="wizard"
        @cancel="cancelWizard"
        @end="onWizardEnd"
        key="0"
      />
      <spinner :show="loading" :text="'Загрузка...'" key="1" />
    </transition-group>
  </div>
</template>

<script>
import ReportForm from '../../classes/reportForm.js'

import BaseComponent from '../Base/BaseComponent.vue'
import PreserverComponent from '../PreserverComponent.vue'
import FormParams from './FormParams.vue'

export default {
  components: {
    PreserverComponent,
    FormParams,
  },
  extends: BaseComponent,
  props: {
    formType: String,
    forms: Object,
  },
  data() {
    return {
      reportForm: new ReportForm({}),
    }
  },
  async mounted() {
    await this.edit(this.id, this.forms)

    this.loading = false

    this.$emit('loaded', this.reportForm)
  },
  methods: {
    onChange(prop, value) {
      this.reportForm[prop] = value

      this.hasChanges = true
    },
    async edit(id) {
      try {
        const { data } = await this.$http.get(
          `${this.formType === 'DbEquip' ? 'equip' : 'point'}Report/report`,
          { params: { id } }
        )

        this.reportForm = new ReportForm(
          Object.assign(data, { type: this.formType })
        )
      } catch (error) {
        this.$store.commit('error', error)
      }
    },
    async save() {
      try {
        this.saving = true

        this.error = {}

        await this.reportForm.save(this.$http)

        this.hasChanges = false
      } catch (error) {
        if (error.response.status === 551) {
          this.error = error.response.data

          if (this.error.hasOwnProperty('message')) {
            this.$store.commit('notification', {
              title: 'Сохранение отчетной формы',
              type: 'error',
              text: this.error.message,
            })
          }
        } else {
          this.$store.commit('error', error)
        }
      } finally {
        this.saving = false
      }
    },
  },
}
</script>
