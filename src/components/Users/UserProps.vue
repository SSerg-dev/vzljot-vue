<template>
  <div class="fit">
    <expantion-panel
      caption="Основные параметры"
      :opened="expParam"
      @open="expParam = $event"
      :staticHeight="false"
      :largeWidth="true"
    >
      <div class="user-grid">
        <div class="user-grid" style="grid-template-columns: max-content 1fr">
          <label>Наименование:</label>
          <input
            v-if="localUser.id === null"
            v-model.trim="localUser.name"
            @input="onChange('name')"
            type="text"
            maxlength="50"
            :class="{ 'validation-error': error.name }"
            :title="error.name"
          />
          <div v-else style="padding: 2px 4px">{{ localUser.name }}</div>
          <label
            v-if="
              $store.state.user?.userRights.isModerator ||
              (!$store.state.user?.userRights.isModerator && !localUser.domain)
            "
            :disabled="!!localUser.domain"
            >Пароль:</label
          >
          <div
            v-if="
              $store.state.user?.userRights.isModerator ||
              (!$store.state.user?.userRights.isModerator && !localUser.domain)
            "
            style="
              display: grid;
              grid-template-columns: min-content min-content;
              gap: 3px;
              align-items: center;
            "
          >
            <input
              :disabled="!!localUser.domain"
              v-model="localUser.password"
              @focus="onPasswordFocus()"
              @blur="onPasswordBlur()"
              @input="onChange('password')"
              type="password"
              maxlength="32"
              autocomplete="new-password"
              :class="{ 'validation-error': error.password }"
              :title="error.password"
            />
            <div
              :disabled="!!localUser.domain"
              class="fas fa-times icon user-button"
              @click="clearPassword()"
              title="Очистить пароль"
            />
          </div>
          <label
            v-if="
              $store.state.user?.userRights.isModerator || !!localUser.domain
            "
            >Домен:</label
          >
          <input
            v-if="$store.state.user?.userRights.isModerator"
            v-model.trim="localUser.domain"
            @input="onChangeDomain()"
            maxlength="70"
            type="text"
            :class="{ 'validation-error': error.domain }"
            :title="error.domain"
          />
          <div v-else-if="!!localUser.domain" style="padding: 2px 4px">
            {{ localUser.domain }}
          </div>
          <label>Группа:</label>
          <selector-combo
            v-bind="{
              values: localUser.userGroups,
              items: userGroups,
              editable:
                localUser.name !== $store.state.env.adminName &&
                $store.state.user?.userRights.isModerator,
              error: error.userGroups,
            }"
            @changed="onChangeGroup($event)"
          />
          <label>Примечание:</label>
          <input
            v-if="$store.state.user?.userRights.isModerator"
            v-model="localUser.desc"
            @input="onChange('desc')"
            type="text"
            maxlength="200"
          />
          <div v-else style="padding: 2px 4px">{{ localUser.desc }}</div>
        </div>
        <check-box
          v-if="$store.state.user?.userRights.isModerator"
          v-model="localUser.enabled"
          :disabled="
            !localUser.userGroups.includes(adminGroup) ||
            this.$store.state.user?.userRights.himselfUserEdit === false
          "
          @update:modelValue="onChange('enabled')"
          >Разрешить пользователю входить в систему</check-box
        >
        <expantion-panel caption="Контакты" :resizable="false">
          <div class="user-grid two">
            <label>Электронная почта:</label>
            <div class="user-grid-mailing">
              <input
                v-model.trim="localUser.contactEmail"
                @input="onChange('contactEmail')"
                type="text"
                style="width: 200px"
                maxlength="255"
                :class="{ 'validation-error': error.email }"
                :title="error.email"
              />
              <v-button
                caption="Проверить"
                :f="onTestEmailClick"
                :disabled="!localUser.contactEmail || testEmail"
              />
            </div>
            <check-box
              v-model="localUser.contactUseSystem"
              @update:modelValue="onChange('contactUseSystem')"
              style="grid-column: span 2"
              >использовать параметры системы</check-box
            >
            <div class="user-grid-mailing" style="grid-column: span 2">
              <label :disabled="localUser.contactUseSystem"
                >Максимальное количество файлов в письме:</label
              >
              <div>
                <number-box
                  :disabled="localUser.contactUseSystem"
                  v-model="localUser.contactMaxFilesCount"
                  @update:modelValue="onChange('contactMaxFilesCount')"
                  style="width: 30px"
                  :min="1"
                  :max="999"
                />
                <label :disabled="localUser.contactUseSystem"> шт</label>
              </div>
              <label :disabled="localUser.contactUseSystem"
                >Максимальный размер всех файлов в письме:</label
              >
              <div>
                <number-box
                  :disabled="localUser.contactUseSystem"
                  v-model="localUser.contactMaxFilesSize"
                  @update:modelValue="onChange('contactMaxFilesSize')"
                  style="width: 30px"
                  :min="1"
                  :max="999"
                />
                <label :disabled="localUser.contactUseSystem"> Мб</label>
              </div>
            </div>
            <label>Номер телефона:</label>
            <div class="user-grid-mailing">
              <input
                v-model.trim="localUser.contactPhone"
                @input="onChange('contactPhone')"
                type="text"
                style="width: 200px"
                maxlength="30"
                :class="{ 'validation-error': error.phone }"
                :title="error.phone"
              />
              <v-button
                caption="Проверить"
                :f="onTestSmsClick"
                :disabled="!localUser.contactPhone || testSms"
              />
            </div>
          </div>
        </expantion-panel>
        <expantion-panel
          caption="Экземпляр сервера для новых приборов"
          :resizable="false"
        >
          <check-box
            v-model="localUser.systemNodeUseSystem"
            @update:modelValue="onChange('systemNodeUseSystem')"
            >Использовать параметры системы</check-box
          >
          <div class="user-grid two">
            <label :disabled="localUser.systemNodeUseSystem">Сервер:</label>
            <select
              :disabled="localUser.systemNodeUseSystem"
              v-model="localUser.systemNode"
              @change="onChange('systemNode')"
            >
              <option
                v-for="r in localUser.systemNodes"
                :key="r.id"
                :value="r.id"
              >
                {{ r.name }}
              </option>
            </select>
          </div>
        </expantion-panel>
      </div>
    </expantion-panel>
    <expantion-panel
      v-if="localUser.id"
      caption="Уведомления"
      :opened="expNotification"
      @open="expNotification = $event"
      :largeWidth="true"
    >
      <div class="user-grid">
        <check-box
          v-model="localUser.notification.sound"
          @update:modelValue="onChangeNotification('sound')"
          >Звуковое оповещение о новых уведомлениях</check-box
        >
        <expantion-panel
          v-for="[k, v] in priorities"
          :key="k"
          :caption="`${v} приоритет`"
          :resizable="false"
        >
          <div class="user-grid">
            <check-box
              v-model="localUser.notification[k].email"
              @update:modelValue="onChangeNotificationType(k, 'email')"
              :class="{ 'validation-error': error[k + 'Email'] }"
              :title="error[k + 'Email']"
              >Разрешить отправлять Email</check-box
            >
            <div class="user-grid two">
              <label :disabled="isDisabled(k)"
                >Интервал отправки сообщений:</label
              >
              <div class="user-grid two" style="gap: 10px">
                <div
                  class="user-grid"
                  style="grid-template-columns: repeat(5, min-content)"
                >
                  <label :disabled="isDisabled(k)">с</label>
                  <number-box
                    v-model="localUser.notification[k].fromHour"
                    @update:modelValue="onChangeNotificationType(k, 'fromHour')"
                    :disabled="isDisabled(k)"
                    style="width: 25px"
                    :min="0"
                    :max="23"
                    :class="{ 'validation-error': error[k + 'Period'] }"
                    :title="error[k + 'Period']"
                  />
                  <label :disabled="isDisabled(k)">ч.</label>
                  <number-box
                    v-model="localUser.notification[k].fromMinutes"
                    @update:modelValue="
                      onChangeNotificationType(k, 'fromMinutes')
                    "
                    :disabled="isDisabled(k)"
                    style="width: 25px"
                    :min="0"
                    :max="59"
                    :class="{ 'validation-error': error[k + 'Period'] }"
                    :title="error[k + 'Period']"
                  />
                  <label :disabled="isDisabled(k)">мин.</label>
                </div>
                <div
                  class="user-grid"
                  style="grid-template-columns: repeat(5, min-content)"
                >
                  <label :disabled="isDisabled(k)">по</label>
                  <number-box
                    v-model="localUser.notification[k].toHour"
                    @update:modelValue="onChangeNotificationType(k, 'toHour')"
                    :disabled="isDisabled(k)"
                    style="width: 25px"
                    :min="0"
                    :max="23"
                    :class="{ 'validation-error': error[k + 'Period'] }"
                    :title="error[k + 'Period']"
                  />
                  <label :disabled="isDisabled(k)">ч.</label>
                  <number-box
                    v-model="localUser.notification[k].toMinutes"
                    @update:modelValue="
                      onChangeNotificationType(k, 'toMinutes')
                    "
                    :disabled="isDisabled(k)"
                    style="width: 25px"
                    :min="0"
                    :max="59"
                    :class="{ 'validation-error': error[k + 'Period'] }"
                    :title="error[k + 'Period']"
                  />
                  <label :disabled="isDisabled(k)">мин.</label>
                </div>
              </div>
            </div>
          </div>
        </expantion-panel>
      </div>
    </expantion-panel>
    <expantion-panel
      v-if="localUser.id"
      caption="Сервер ГИС"
      :opened="false"
      :staticHeight="false"
      :largeWidth="true"
    >
      <div class="user-grid two">
        <label>Сервер:</label>
        <div
          style="
            display: grid;
            grid-template-columns: min-content min-content;
            gap: 5px;
            align-items: center;
          "
        >
          <select v-model="localUser.map.id" @change="onChangeMap">
            <option
              v-for="[k, v] in Object.entries(maps).sort((a, b) =>
                $store.state.collator.compare(a[1].name, b[1].name)
              )"
              :key="k"
              :value="parseInt(k)"
            >
              {{ v.name }}
            </option>
          </select>
          <div
            :disabled="!localUser.map.id"
            class="fas fa-times icon user-button"
            @click="clearGis"
            title="Очистить сервер ГИС"
          />
        </div>
        <template
          v-if="
            localUser.map.id &&
            maps[localUser.map.id] &&
            maps[localUser.map.id].connections.length > 1
          "
        >
          <label>Подключение:</label>
          <select
            v-model="localUser.map.connection"
            @change="onChangeMapConnection"
          >
            <option
              v-for="(r, index) in maps[localUser.map.id].connections"
              :key="index"
              :value="r"
            >
              {{ r }}
            </option>
          </select>
        </template>
      </div>
    </expantion-panel>
    <expantion-panel
      v-if="localUser.id"
      caption="Вид"
      :opened="expView"
      @open="expView = $event"
      :largeWidth="true"
    >
      <div class="user-grid">
        <fieldset>
          <legend>Индикация наличия собранных данных</legend>
          <div class="user-grid">
            <check-box
              v-if="localUser.view.system.visible"
              v-model="localUser.view.system.value"
              @update:modelValue="onChangeViewSystem()"
              >Использовать параметры системы</check-box
            >
            <div class="user-grid two">
              <label :disabled="localUser.view.system.value">Диапазон:</label>
              <div class="user-grid two">
                <select
                  :disabled="localUser.view.system.value"
                  v-model="localUser.view.timeType"
                  @change="onChangeView('timeType')"
                >
                  <option
                    v-for="key in Object.keys(
                      $store.state.env.pollDataTimeTypes
                    )"
                    :key="key"
                    :value="parseInt(key)"
                  >
                    {{ $store.state.env.pollDataTimeTypes[key].text }}
                  </option>
                </select>
                <div
                  v-if="localUser.view.timeType === pollDataTimeTypes.onDepth"
                  class="user-grid two"
                >
                  <number-box
                    :disabled="localUser.view.system.value"
                    v-model="localUser.view.timeDepth"
                    @update:modelValue="onChangeView('timeDepth')"
                    style="width: 30px"
                    :min="1"
                    :max="999"
                  />
                  <label :disabled="localUser.view.system.value">дн</label>
                </div>
                <div
                  v-else
                  class="user-grid two"
                  style="grid-template-columns: repeat(4, min-content)"
                >
                  <date-picker
                    :disabled="localUser.view.system.value"
                    v-model="localUser.view.timeFrom"
                    @input="onChangeView('timeFrom')"
                    format="DD.MM.YYYY"
                    style="width: 90px"
                    :class="{ 'validation-error': error.viewTime }"
                    :title="error.viewTime"
                  />
                  <check-box
                    :disabled="localUser.view.system.value"
                    v-model="localUser.view.isTimeTo"
                    @update:modelValue="onChangeView('isTimeTo', $event)"
                  />
                  <label
                    :disabled="
                      localUser.view.system.value || !localUser.view.isTimeTo
                    "
                    >по</label
                  >
                  <date-picker
                    :disabled="
                      localUser.view.system.value || !localUser.view.isTimeTo
                    "
                    @input="onChangeView('timeTo')"
                    v-model="localUser.view.timeTo"
                    format="DD.MM.YYYY"
                    style="width: 90px"
                    :class="{ 'validation-error': error.viewTime }"
                    :title="error.viewTime"
                  />
                </div>
              </div>
            </div>
          </div>
        </fieldset>
        <fieldset
          v-if="
            $store.state.user?.userRights.isModerator ||
            $store.state.user?.userRights.webViewEdit
          "
        >
          <legend>Отображение вкладок</legend>
          <div
            style="
              display: grid;
              grid-gap: 5px 3px;
              grid-template-columns: auto;
              align-items: baseline;
            "
          >
            <check-box
              v-if="localUser.view.useWebSystem.visible"
              v-model="localUser.view.useWebSystem.value"
              @update:modelValue="onChangeViewWebSystem()"
              >Использовать параметры системы</check-box
            >
            <check-box
              :disabled="localUser.view.useWebSystem.value"
              v-model="localUser.view.info"
              @update:modelValue="onChangeView('info', $event)"
              >Информация</check-box
            >
            <check-box
              :disabled="localUser.view.useWebSystem.value"
              v-model="localUser.view.points"
              @update:modelValue="onChangeView('points', $event)"
              >Точки учета</check-box
            >
            <check-box
              :disabled="localUser.view.useWebSystem.value"
              v-model="localUser.view.equips"
              @update:modelValue="onChangeView('equips', $event)"
              >Приборы</check-box
            >
            <check-box
              :disabled="localUser.view.useWebSystem.value"
              v-model="localUser.view.extra"
              @update:modelValue="onChangeView('extra', $event)"
              >Дополнительно</check-box
            >
            <check-box
              :disabled="localUser.view.useWebSystem.value"
              v-model="localUser.view.map"
              @update:modelValue="onChangeView('map', $event)"
              >Карта</check-box
            >
          </div>
        </fieldset>
        <fieldset
          v-if="
            $store.state.user?.userRights.isModerator ||
            $store.state.user?.userRights.webViewEdit
          "
        >
          <legend>Списки для отображения на вкладке "Информация"</legend>
          <div
            style="
              display: grid;
              grid-gap: 5px 3px;
              grid-template-columns: auto;
              align-items: baseline;
            "
          >
            <!-- <info-list /> -->
          </div>
        </fieldset>
      </div>
    </expantion-panel>
  </div>
</template>

<script>
const password = '     '

import { matchType } from '../../plugins/api.js'
import * as regexp from '../../plugins/regexp.js'
import User from '../../classes/user'

import ExpantionPanel from '../ExpantionPanel.vue'
import CheckBox from '../Inputs/CheckBox.vue'
import NumberBox from '../Inputs/NumberBox.vue'
import DatePicker from '../Inputs/DatePicker.vue'
import SelectorCombo from '../Inputs/SelectorCombo.vue'
import VButton from '../Inputs/VButton.vue'
// eslint-disable-next-line no-unused-vars
import { safeStringify } from '@/utils/common.functions.js'

// import InfoList from '@/components/InfoList/InfoList.vue'

export default {
  components: {
    ExpantionPanel,
    CheckBox,
    NumberBox,
    DatePicker,
    SelectorCombo,
    VButton,
    // InfoList,
  },
  props: {
    user: Object,
    maps: {
      type: Object,
      default: () => {},
    },
  },
  emits: {
    change: null,
    fullNameChange: null,
  },
  data() {
    let error = {}
    ;[
      'highestPeriod',
      'normalPeriod',
      'lowestPeriod',
      'highestEmail',
      'normalEmail',
      'lowestEmail',
      'viewTime',
      'notificationEmail',
      'phone',
      'email',
      'domain',
      'name',
      'userGroups',
      'password'
    ].forEach((r) => (error[r] = null))

    return {
      expParam: true,
      expNotification: false,
      expView: false,
      localUser: new User(this.user),
      testEmail: false,
      testSms: false,
      error,
      adminGroup: Object.freeze(3),
    }
  },
  mounted() {},
  computed: {
    priorities() {
      return Object.entries(
        this.$store.state.env.notificationPriorityEnum
      ).filter(([a]) => a !== 'none')
    },
    pollDataTimeTypes() {
      return matchType(this.$store.state.env.pollDataTimeTypes)
    },
    fullName() {
      return this.localUser.domain
        ? `${this.localUser.domain}\\${this.localUser.name}`
        : this.localUser.name
    },
    userGroups() {
      return this.localUser.name === this.$store.state.env.adminName
        ? this.localUser.groups.filter(
            (r) => r.typeCode === this.$store.state.env.adminName
          )
        : this.localUser.groups.filter(
            (r) => r.typeCode !== this.$store.state.env.adminName
          )
    },
  },
  watch: {
    user: {
      handler(value) {
        this.localUser = new User(value)
      },
      deep: true,
    },
    fullName(value) {
      this.$emit('fullNameChange', value)
    },
  },
  methods: {
    clearGis() {
      this.localUser.map = {
        id: null,
        connection: null,
      }
      this.onChangeMap()
    },
    clearPassword() {
      this.localUser.password = ''
      this.onChange('password')
    },
    onPasswordFocus() {
      if (this.localUser.password === password) {
        this.localUser.password = null
      }
    },
    onPasswordBlur() {
      if (this.localUser.password === null) {
        this.localUser.password = password
      }
    },
    isDisabled(type) {
      return this.localUser && this.localUser.notification
        ? this.localUser.notification[type].email
          ? false
          : true
        : true
    },
    onChangeDomain() {
      if (this.localUser.domain) {
        this.localUser.password = ''
      }
      this.onChange('domain')
    },
    onChangeGroup(value) {
      if (this.localUser.id === null) {
        this.localUser.userGroups = value
      }
      this.$emit('change', 'userGroups', value)
    },
    onChangeMap() {
      this.$emit('change', 'map.id', this.localUser.map.id)
      if (this.maps[this.localUser.map.id]) {
        this.$emit(
          'change',
          'map.connection',
          this.maps[this.localUser.map.id].connections[0] ?? null
        )
      }
    },
    onChangeMapConnection() {
      this.$emit(
        'change',
        'map.connection',
        this.localUser.map.connection ?? null
      )
    },
    onChange(value) {
      this.$emit('change', value, this.localUser[value])
    },
    onChangeNotification(value) {
      this.$emit(
        'change',
        `notification.${value}`,
        this.localUser.notification[value]
      )
    },
    onChangeNotificationType(type, value) {
      this.$emit(
        'change',
        `notification.${type}.${value}`,
        this.localUser.notification[type][value]
      )
    },
    onChangeView(value) {
      this.$emit('change', `view.${value}`, this.localUser.view[value])
    },
    onChangeViewWebSystem() {
      this.$emit(
        'change',
        `view.useWebSystem.value`,
        this.localUser.view.useWebSystem.value
      )
    },
    onChangeViewSystem() {
      this.$emit(
        'change',
        `view.system.value`,
        this.localUser.view.system.value
      )
    },
    async onTestEmailClick() {
      this.testEmail = true

      const { data } = await this.localUser.testEmail()
      this.$store.commit('notification', data)

      this.testEmail = false
    },
    async onTestSmsClick() {
      this.testSms = true

      const { data } = await this.localUser.testSms()
      this.$store.commit('notification', data)

      this.testSms = false
    },
    validateData() {
      Object.keys(this.error).forEach((r) => (this.error[r] = null))

      if (!this.localUser.name) {
        this.expParam = true
        this.error.name = 'Наименование не может быть пустым.'
      }

      if (this.localUser.name && this.localUser.name.includes('\\')) {
        this.expParam = true
        this.error.name =
          'Наименование пользователя не может содержать запрещенные символы: "\\".'
      }

      if (this.localUser.domain && this.localUser.domain.includes('\\')) {
        this.expParam = true
        this.error.domain =
          'Наименование домена не может содержать запрещенные символы: "\\".'
      }

      if (
        this.localUser.contactEmail &&
        !regexp.matcher.email.test(this.localUser.contactEmail)
      ) {
        this.expParam = true
        this.error.email = 'Неверно задан почтовый адрес.'
      }

      if (
        this.localUser.contactPhone &&
        !regexp.matcher.phone.test(this.localUser.contactPhone)
      ) {
        this.expParam = true
        this.error.phone = 'Неверно задан телефон.'
      }

      if (this.localUser.notification) {
        if (this.localUser.notification.lowest.email) {
          if (!this.localUser.notification.normal.email) {
            this.expNotification = true
            this.error.normalEmail = 'Необходимо разрешить отправлять Email'
          } else {
            const fromLowest =
              this.localUser.notification.lowest.fromHour * 60 +
              this.localUser.notification.lowest.fromMinutes
            const toLowest =
              this.localUser.notification.lowest.toHour * 60 +
              this.localUser.notification.lowest.toMinutes
            const fromNormal =
              this.localUser.notification.normal.fromHour * 60 +
              this.localUser.notification.normal.fromMinutes
            const toNormal =
              this.localUser.notification.normal.toHour * 60 +
              this.localUser.notification.normal.toMinutes

            if (fromLowest < fromNormal || toLowest > toNormal) {
              this.expNotification = true
              this.error.lowestPeriod =
                'Необходимо изменить разрешенный интервал отправки сообщений'
            }
          }
        }

        if (this.localUser.notification.normal.email) {
          if (!this.localUser.notification.highest.email) {
            this.expNotification = true
            this.error.highestEmail = 'Необходимо разрешить отправлять Email'
          } else {
            const fromHighest =
              this.localUser.notification.highest.fromHour * 60 +
              this.localUser.notification.highest.fromMinutes
            const toHighest =
              this.localUser.notification.highest.toHour * 60 +
              this.localUser.notification.highest.toMinutes
            const fromNormal =
              this.localUser.notification.normal.fromHour * 60 +
              this.localUser.notification.normal.fromMinutes
            const toNormal =
              this.localUser.notification.normal.toHour * 60 +
              this.localUser.notification.normal.toMinutes
            if (fromNormal < fromHighest || toNormal > toHighest) {
              this.expNotification = true
              this.error.normalPeriod =
                'Необходимо изменить разрешенный интервал отправки сообщений'
            }
          }
        }
      }

      if (
        this.localUser.view &&
        this.localUser.view.timeType === this.pollDataTimeTypes.fromTime
      ) {
        if (
          this.localUser.view.isTimeTo &&
          new Date(this.localUser.view.timeFrom).getTime() >
            new Date(this.localUser.view.timeTo).getTime()
        ) {
          this.expView = true
          this.error.viewTime =
            'Дата окончания не может быть меньше даты начала.'
        }
      }

      return Object.keys(this.error).some((r) => new Boolean(this.error[r]))
    },
    async save(userRights, subscriptions) {
      if (!this.validateData()) return false

      const { data, type } = await this.localUser.save(
        userRights,
        subscriptions
      )

      if (this.$store.state.env.resultTypes[type].type === 'success') {
        if (!data.validation.valid) {
          Object.keys(data.validation.error).forEach((r) => {
            this.error[r] = data.validation.error[r]

            if (r === 'name' || r === 'email' || r == 'password') {
              this.expParam = true
            }

            if (
              r === 'normalEmail' ||
              r === 'lowestPeriod' ||
              r === 'highestEmail' ||
              r === 'normalPeriod' ||
              r === 'lowestPeriod'
            ) {
              this.expNotification = true
            }

            if (r === 'viewTime') {
              this.viewTime = true
            }
          })
          return false
        }

        return true
      }
    },
  },
}
</script>

<style scoped>
.user-grid {
  display: grid;
  gap: 5px 3px;
  align-items: baseline;
}

.user-grid.two {
  grid-template-columns: max-content max-content;
}

.user-grid label {
  text-align: right;
}

.user-grid select {
  width: -moz-fit-content;
  width: fit-content;
}

.user-grid-mailing {
  display: grid;
  gap: 5px 3px;
  grid-template-columns: auto 1fr;
  align-items: baseline;
}

.user-grid-mailing label {
  justify-self: right;
}

.user-grid div[disabled='true'] {
  opacity: 0.5;
}

.user-group {
  padding: 2px 4px;
  border: thin solid darkgray;
  border-radius: 3px;
  height: 100%;
  min-height: 22px;
}

.user-group-error {
  border-color: #b22222;
  background-color: #fde;
}

.user-button {
  padding: 1px;
  border: 1px solid lightslategray;
  min-width: 1.3em;
  border-radius: 2px;
  text-align: center;
}
</style>
