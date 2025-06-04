<script>
import { v4 as uuidv4 } from 'uuid'

import { matchType } from '../../plugins/api'

import Wizard from '../Wizard.vue'

export default {
  components: {
    Wizard,
  },
  props: {
    creator: String,
    id: {
      type: Number,
      default: null,
    },
    type: Number,
  },
  data() {
    return {
      key: uuidv4(),
      hasChanges: false,
      loading: true,
      saving: false,
      error: {},
      wizard: null,

      hasWizardEnd: false,
      hasEquipSettingNew: false,
    }
  },
  created() {
    this.$emitter.on('beforeClose', this.onBeforeClose)
    this.$emitter.on('beforeCloseEquipSetting', this.onBeforeCloseEquipSetting)
  },
  beforeUnmount() {
    this.$emitter.off('beforeClose', this.onBeforeClose)
    this.$emitter.off('beforeCloseEquipSetting', this.onBeforeCloseEquipSetting)

    this.$emitter.off('equip-setting-node:save')

    this.$emitter.emit('componentBeforeUnmount', {
      id: this.id,
      type: this.type,
      key: this.key,
      creator: this.creator,
      component: this,
    })
  },
  methods: {
    matchType(types) {
      return matchType(types)
    },
    onBeforeClose({ id, type, key }) {
      if (this.id === id && this.type === type) {
        if (this.hasChanges) {
          this.wizard = {
            data: { id, type, key },
            name: 'save',
            component: {
              text: 'Сохранение:',
              component: 'message',
              data: {
                text: 'Данные были изменены. Сохранить изменения?',
              },
            },
          }
        } else {
          this.$emitter.emit('close', { id: this.id, type: this.type, key })
        }
      }
    },
    onBeforeCloseEquipSetting(event) {
      if ((this.hasChanges || this.hasEquipSettingNew) && event.uuid) {
        this.wizard = {
          name: 'save',
          component: {
            text: 'Сохранение:',
            component: 'message',
            data: {
              text: 'Данные были изменены. Сохранить изменения?',
            },
          },
        }
        this.hasWizardEnd = false
      } else {
        this.$emitter.emit('close', {})
      }
    },
    cancelWizard() {
      this.$emitter.emit('cancelComponentWizard', {
        id: this.id,
        type: this.type,
        key: this.key,
        ...this.wizard.data,
      })
      this.wizard = null
    },
    onWizardEnd() {
      const data = this.wizard.data
      this.wizard = null

      if (!this.hasWizardEnd) {
        this.save()
        this.hasWizardEnd = true
        this.$store.state.equip.equipEvent.hasChangeNotSave = false
      } else {
        this.hasWizardEnd = false
      }

      this.$emitter.emit('endComponentWizard', {
        id: this.id,
        type: this.type,
        key: this.key,
        ...data,
      })
    },
    onSaveClick() {
      if (!this.hasWizardEnd) {
        this.save()
      }

      this.$store.state.equip.equipEvent.hasChangeNotSave = false
    },
  },
}
</script>
