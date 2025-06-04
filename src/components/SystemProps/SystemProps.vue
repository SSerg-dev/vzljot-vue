<template>
  <div class="component-detail">
    <preserver-component
      v-bind="{ saving, disabled: !hasChanges || loading, loading }"
      @saveClick="onSaveClick()"
    >
      <tabs>
        <tabx text="Параметры">
          <div class="system-props-common">
            <div class="system-props-grid">
              <label>Режим сервера:</label>
              <select v-if="server.isAlone" v-model="commonData.serverMode">
                <option
                  v-for="key in Object.keys($store.state.env.serverModes)"
                  :key="key"
                  :value="parseInt(key)"
                >
                  {{ $store.state.env.serverModes[key].text }}
                </option>
              </select>
              <label style="justify-self: left" v-else>{{
                $store.state.env.serverModes[commonData.serverMode].text
              }}</label>
              <label>Экземпляр сервера лицензии:</label>
              <select v-model="commonData.licenseSystemNode">
                <option
                  v-for="r in server.servers"
                  :key="r.id"
                  :value="parseInt(r.id)"
                >
                  {{ r.name }}
                </option>
              </select>
              <label>Экземпляр сервера для общих задач:</label>
              <select v-model="commonData.systemNode">
                <option
                  v-for="r in server.servers"
                  :key="r.id"
                  :value="parseInt(r.id)"
                >
                  {{ r.name }}
                </option>
              </select>
              <label>Экземпляр сервера для новых приборов:</label>
              <select v-model="commonData.defaultSystemNode">
                <option
                  v-for="r in server.servers"
                  :key="r.id"
                  :value="parseInt(r.id)"
                >
                  {{ r.name }}
                </option>
              </select>
            </div>
            <expantion caption="Настройки очистки сообщений" :resizable="false">
              <div class="system-props-common">
                <check-box v-model="commonData.autoClearSystemMessage"
                  >Автоматическая очистка полученных сообщений</check-box
                >
                <div class="system-props-grid">
                  <label :disabled="!commonData.autoClearSystemMessage"
                    >Удалять сообщения старше:</label
                  >
                  <div :disabled="!commonData.autoClearSystemMessage">
                    <number-box
                      :disabled="!commonData.autoClearSystemMessage"
                      v-model="commonData.systemMessageAge"
                      style="width: 30px"
                      :min="1"
                      :max="999"
                    />
                    дн.
                  </div>
                </div>
              </div>
            </expantion>
            <expantion
              caption="Настройки очистки каталога с данными"
              :resizable="false"
            >
              <div class="system-props-common">
                <check-box v-model="commonData.autoClearFiles"
                  >Автоматическая очистка полученных данных</check-box
                >
                <div class="system-props-grid">
                  <label :disabled="!commonData.autoClearFiles"
                    >Удалять файлы старше:</label
                  >
                  <div :disabled="!commonData.autoClearFiles">
                    <number-box
                      :disabled="!commonData.autoClearFiles"
                      v-model="commonData.fileAge"
                      style="width: 30px"
                      :min="1"
                      :max="999"
                    />
                    дн.
                  </div>
                </div>
              </div>
            </expantion>
            <expantion caption="Поверка" :resizable="false">
              <div class="system-props-common">
                <check-box v-model="commonData.checkingExpired"
                  >Контроль поверки оборудования</check-box
                >
                <div class="system-props-grid">
                  <check-box
                    v-model="commonData.checkingDeadline"
                    :disabled="!commonData.checkingExpired"
                    >Выдавать предупреждение за:</check-box
                  >
                  <div
                    :disabled="
                      !commonData.checkingExpired ||
                      !commonData.checkingDeadline
                    "
                  >
                    <number-box
                      v-model="commonData.checkingDeadlineDays"
                      :disabled="
                        !commonData.checkingExpired ||
                        !commonData.checkingDeadline
                      "
                      style="width: 30px"
                      :min="1"
                      :max="999"
                    />
                    дн.
                  </div>
                </div>
              </div>
            </expantion>
            <system-props-not-make-delta
              style="grid-column: span 2; margin-bottom: 5px"
              :notMakeDelta="localNotMakeDelta"
              @onChangedNotMakeDelta="handleNotMakeDelta"
            />
            <system-props-time-sync
              style="grid-column: span 2"
              :timeZonesType="localTimeZonesType || 0"
              :timeZones="localTimeZones || []"
              @onChangedTimeZoneType="handleTimeZoneType"
            />
          </div>
        </tabx>
        <tabx text="Сбор и рассылка данных">
          <div class="grid" style="width: fit-content">
            <div class="grid two">
              <label>Состояние:</label>
              <select v-model="pollData.enabled">
                <option :value="false">отключен</option>
                <option :value="true">включен</option>
              </select>
              <label :disabled="!pollData.enabled" style="align-self: baseline"
                >Данные:</label
              >
              <div
                style="
                  display: grid;
                  gap: 5px 3px;
                  grid-template-columns: repeat(3, 200px);
                "
              >
                <template
                  v-for="[k, v] in Object.entries(
                    $store.state.env.pollDataTypes
                  )"
                >
                  <check-box
                    v-if="pollData[v.type] !== null"
                    :key="k"
                    v-model="pollData[v.type]"
                    :disabled="!pollData.enabled"
                    :class="{ 'validation-error': error.pollDataType }"
                    :title="error.pollDataType"
                    >{{ v.text }}</check-box
                  >
                </template>
              </div>
            </div>
            <div class="grid two">
              <label :disabled="!pollData.enabled"
                >Разрешенный интервал сбора и рассылки:</label
              >
              <div :disabled="!pollData.enabled">
                <number-box
                  :disabled="!pollData.enabled"
                  v-model="pollData.allowStartHour"
                  style="width: 2em"
                  :min="0"
                  :max="23"
                />
                ч
                <number-box
                  :disabled="!pollData.enabled"
                  v-model="pollData.allowStartMin"
                  style="width: 2em"
                  :min="0"
                  :max="59"
                />
                мин
                <number-box
                  :disabled="!pollData.enabled"
                  v-model="pollData.allowEndHour"
                  style="width: 2em"
                  :min="0"
                  :max="23"
                />
                ч
                <number-box
                  :disabled="!pollData.enabled"
                  v-model="pollData.allowEndMin"
                  style="width: 2em"
                  :min="0"
                  :max="59"
                />
                мин
              </div>
              <label :disabled="!pollData.enabled">Диапазон сбора:</label>
              <div class="system-props-temp" :disabled="!pollData.enabled">
                <select
                  v-model="pollData.depthType"
                  :disabled="!pollData.enabled"
                >
                  <option :value="0">на глубину</option>
                  <option :value="1">с даты</option>
                </select>
                <template v-if="pollData.depthType === 0">
                  <number-box
                    :disabled="!pollData.enabled"
                    v-model="pollData.depth"
                    style="width: 50px"
                    :min="1"
                    :max="999"
                  />
                  <label>дн.</label>
                </template>
                <datepicker
                  v-else
                  :disabled="!pollData.enabled"
                  v-model="pollData.dateStart"
                  :format="dateFormat"
                  style="width: 90px"
                />
              </div>
            </div>
            <div class="grid two">
              <label :disabled="!pollData.enabled"
                >Периодичность обновления приборных настроек:</label
              >
              <div
                class="grid"
                style="grid-template-columns: min-content min-content"
              >
                <number-box
                  :disabled="!pollData.enabled"
                  v-model="pollData.periodEquipSettings"
                  style="width: 3em"
                  :min="1"
                  :max="999"
                />
                <label :disabled="!pollData.enabled">дн.</label>
              </div>
            </div>
            <check-box
              v-model="pollData.allowCaptureData"
              :disabled="!pollData.enabled"
              >Разрешить сбор отсутствующих данных вне диапазона</check-box
            >
            <check-box
              v-model="pollData.autoEnableControl"
              :disabled="!pollData.enabled"
              >Автоматическое включение контроля при поступлении
              данных</check-box
            >
            <expantion
              caption="Контроль поступления и рассылки данных"
              :resizable="false"
            >
              <div class="system-props-control">
                <div class="system-props-grid">
                  <label :disabled="!pollData.enabled">Состояние:</label>
                  <select
                    :disabled="!pollData.enabled"
                    v-model="pollData.control"
                  >
                    <option :value="false">отключен</option>
                    <option :value="true">включен</option>
                  </select>
                </div>
                <tabs>
                  <tabx
                    text="Архивы"
                    v-if="
                      pollData.archiveHour ||
                      pollData.archiveDay ||
                      pollData.archiveMonth
                    "
                  >
                    <poll-period-props
                      @change="onPeriodArchiveChange"
                      v-bind="periodArchiveData"
                    />
                  </tabx>
                  <tabx text="Данные наборов" v-if="pollData.setParams">
                    <poll-period-props
                      @change="onPeriodSetParamsChange"
                      v-bind="periodSetParamsData"
                    />
                  </tabx>
                  <tabx text="Текущие события" v-if="pollData.equipEvents">
                    <poll-period-props
                      @change="onPeriodEquipEventsChange"
                      v-bind="periodEquipEventsData"
                    />
                  </tabx>
                  <tabx
                    text="Настроечные параметры"
                    v-if="pollData.equipCustomizing"
                  >
                    <poll-period-props
                      v-if="pollData.equipCustomizing"
                      @change="onPeriodEquipCustomizingChange"
                      v-bind="periodEquipCustomizingData"
                    />
                  </tabx>
                  <tabx
                    text="Рассылка параметров ХВ"
                    v-if="pollData.setDataColdWater"
                  >
                    <poll-period-props
                      @change="onPeriodSetDataColdWaterChange"
                      v-bind="periodSetDataColdWaterData"
                    />
                  </tabx>
                  <tabx text="Параметры ХВ" v-if="pollData.coldWater">
                    <poll-period-props
                      @change="onPeriodColdWaterChange"
                      v-bind="periodColdWaterData"
                    />
                  </tabx>
                  <tabx
                    text="База параметров"
                    v-if="pollData.equipDatabaseParams"
                  >
                    <poll-period-props
                      @change="onPeriodEquipDatabaseParamsChange"
                      v-bind="periodEquipDatabaseParamsData"
                    />
                  </tabx>
                  <tabx text="Синхронизация времени" v-if="pollData.timeSync">
                    <poll-period-props
                      @change="onPeriodTimeSyncChange"
                      v-bind="periodTimeSyncData"
                    />
                  </tabx>
                </tabs>
                <div
                  style="
                    margin: 10px 0 10px 0;
                    height: 1px;
                    background-color: #ecf0f6;
                  "
                />
                <div class="system-props-grid">
                  <check-box
                    v-model="pollData.autoDisableControl"
                    :disabled="!pollData.enabled || !pollData.control"
                    >Автоматическое выключение контроля после:</check-box
                  >
                  <div
                    :disabled="
                      !pollData.enabled ||
                      !pollData.control ||
                      !pollData.autoDisableControl
                    "
                  >
                    <number-box
                      :disabled="
                        !pollData.enabled ||
                        !pollData.control ||
                        !pollData.autoDisableControl
                      "
                      v-model="pollData.retryCount"
                      style="width: 2em"
                      :min="1"
                      :max="99"
                    />
                    попыток
                  </div>
                  <label :disabled="!pollData.enabled || !pollData.control"
                    >Время ожидания:</label
                  >
                  <div
                    :disabled="!pollData.enabled || !pollData.control"
                    colspan="2"
                  >
                    <number-box
                      :disabled="!pollData.enabled || !pollData.control"
                      v-model="pollData.waitHour"
                      style="width: 2em"
                      :min="0"
                      :max="23"
                    />
                    ч
                    <number-box
                      :disabled="!pollData.enabled || !pollData.control"
                      v-model="pollData.waitMin"
                      style="width: 2em"
                      :min="0"
                      :max="59"
                    />
                    мин
                  </div>
                </div>
              </div>
            </expantion>
            <expantion caption="Настройки автовызова" :resizable="false">
              <div class="system-props-grid">
                <label :disabled="!pollData.enabled || !pollData.control"
                  >Состояние:</label
                >
                <select
                  :disabled="!pollData.enabled || !pollData.control"
                  v-model="pollData.autoRequest"
                >
                  <option :value="false">отключен</option>
                  <option :value="true">включен</option>
                </select>
              </div>
            </expantion>
          </div>
        </tabx>
        <tabx text="Отчеты">
          <div class="system-props-report">
            <expantion caption="Отчетное время" :resizable="false">
              <div
                style="
                  display: grid;
                  gap: 5px 3px;
                  grid-template-columns: repeat(9, min-content);
                  align-items: baseline;
                "
              >
                <label>День:</label>
                <number-box
                  v-model="reportData.day"
                  style="width: 30px"
                  :min="1"
                  :max="31"
                />
                <label>Месяц:</label>
                <select v-model="reportData.month">
                  <option
                    v-for="(item, index) in months"
                    :key="index"
                    :value="index + 1"
                  >
                    {{ item }}
                  </option>
                </select>
                <label>Время:</label>
                <number-box
                  v-model="reportData.hours"
                  style="width: 30px"
                  :max="23"
                />
                ч.
                <number-box
                  v-model="reportData.minutes"
                  style="width: 30px"
                  :max="59"
                />
                мин.
              </div>
            </expantion>
            <expantion
              caption="Расчет потребления тепла и горячей воды"
              :resizable="false"
            >
              <div class="system-props-report">
                <expantion
                  v-for="r in Object.values($store.state.env.nodeTypes)"
                  :key="r.type"
                  :caption="r.text"
                  :resizable="false"
                >
                  <div class="system-props-grid">
                    <check-box
                      style="grid-column: span 2"
                      v-model="reportData[r.type].enableLosses"
                      >Учитывать тепловые потери</check-box
                    >
                    <check-box v-model="reportData[r.type].enableCorrection"
                      >Использовать корректировку при Тнш не более,
                      дн.:</check-box
                    >
                    <number-box
                      v-model="reportData[r.type].timeIdleForCorrection"
                      :disabled="!reportData[r.type].enableCorrection"
                      style="width: 30px"
                      :min="1"
                      :max="999"
                    />
                    <check-box v-model="reportData[r.type].enableAvgToPeriod"
                      >Рассчитывать по среднему при Тнш не более,
                      дн.:</check-box
                    >
                    <number-box
                      v-model="reportData[r.type].timeIdleForAvgToPeriod"
                      :disabled="!reportData[r.type].enableAvgToPeriod"
                      style="width: 30px"
                      :min="1"
                      :max="999"
                    />
                    <check-box
                      style="grid-column: span 2"
                      v-model="reportData[r.type].enableContract"
                      >Рассчитывать по договорным нагрузкам</check-box
                    >
                    <label
                      :disabled="
                        !reportData[r.type].enableAvgToPeriod &&
                        !reportData[r.type].enableCorrection
                      "
                      >Рассчитывать средние значения при Tраб не менее,
                      дн.:</label
                    >
                    <number-box
                      v-model="reportData[r.type].timeWork"
                      :disabled="
                        !reportData[r.type].enableAvgToPeriod &&
                        !reportData[r.type].enableCorrection
                      "
                      style="width: 30px"
                      :min="1"
                      :max="999"
                    />
                  </div>
                </expantion>
              </div>
            </expantion>
          </div>
        </tabx>
        <tabx text="Температурный график">
          <div style="width: fit-content">
            <expantion
              caption="Критерии анализа температурного графика"
              :resizable="false"
            >
              <div class="system-props-temp">
                <check-box v-model="temperatureGraphData.t1more"
                  >Перегрев в подающем трубопроводе более:</check-box
                >
                <number-box
                  v-model="temperatureGraphData.t1moreValue"
                  :disabled="!temperatureGraphData.t1more"
                  style="width: 30px"
                  :min="1"
                  :max="100"
                />
                <select
                  v-model="temperatureGraphData.t1moreType"
                  :disabled="!temperatureGraphData.t1more"
                >
                  <option :value="false">°C</option>
                  <option :value="true">%</option>
                </select>
                <check-box v-model="temperatureGraphData.t1less"
                  >Недогрев в подающем трубопроводе менее:</check-box
                >
                <number-box
                  v-model="temperatureGraphData.t1lessValue"
                  :disabled="!temperatureGraphData.t1less"
                  style="width: 30px"
                  :min="1"
                  :max="100"
                />
                <select
                  v-model="temperatureGraphData.t1lessType"
                  :disabled="!temperatureGraphData.t1less"
                >
                  <option :value="false">°C</option>
                  <option :value="true">%</option>
                </select>
                <check-box v-model="temperatureGraphData.t2more"
                  >Перегрев в обратном трубопроводе более:</check-box
                >
                <number-box
                  v-model="temperatureGraphData.t2moreValue"
                  :disabled="!temperatureGraphData.t2more"
                  style="width: 30px"
                  :min="1"
                  :max="100"
                />
                <select
                  v-model="temperatureGraphData.t2moreType"
                  :disabled="!temperatureGraphData.t2more"
                >
                  <option :value="false">°C</option>
                  <option :value="true">%</option>
                </select>
                <check-box v-model="temperatureGraphData.t2less"
                  >Недогрев в обратном трубопроводе менее:</check-box
                >
                <number-box
                  v-model="temperatureGraphData.t2lessValue"
                  :disabled="!temperatureGraphData.t2less"
                  style="width: 30px"
                  :min="1"
                  :max="100"
                />
                <select
                  v-model="temperatureGraphData.t2lessType"
                  :disabled="!temperatureGraphData.t2less"
                >
                  <option :value="false">°C</option>
                  <option :value="true">%</option>
                </select>
              </div>
            </expantion>
          </div>
        </tabx>
        <tabx text="Рассылка">
          <div class="system-props-mail">
            <expantion caption="Разрешения" :resizable="false">
              <div class="system-props-grid">
                <check-box
                  style="grid-column: span 2"
                  v-model="mailingData.notificationEmailEnable"
                  >Разрешить рассылку уведомлений по Email</check-box
                >
                <check-box
                  style="grid-column: span 2"
                  v-model="mailingData.reportEmailEnable"
                  >Разрешить рассылку сформированных отчетов</check-box
                >
                <div />
                <div
                  :disabled="!mailingData.reportEmailEnable"
                  class="system-props-grid"
                >
                  <label>Максимальное количество файлов в письме, шт:</label>
                  <number-box
                    :disabled="!mailingData.reportEmailEnable"
                    v-model="mailingData.reportEmailMaxFilesCount"
                    style="width: 30px"
                    :min="1"
                    :max="999"
                  />
                  <label>Максимальный размер всех файлов в письме, Мб:</label>
                  <number-box
                    :disabled="!mailingData.reportEmailEnable"
                    v-model="mailingData.reportEmailMaxFilesSize"
                    style="width: 30px"
                    :min="1"
                    :max="999"
                  />
                </div>
                <check-box
                  style="grid-column: span 2"
                  v-model="mailingData.notificationSmsEnable"
                  >Разрешить рассылку уведомлений c помощью
                  SMS-сообщений</check-box
                >
              </div>
            </expantion>
            <expantion caption="Настройки отправки Email" :resizable="false">
              <div class="system-props-grid">
                <label
                  :disabled="
                    !mailingData.notificationEmailEnable &&
                    !mailingData.reportEmailEnable
                  "
                  >SMTP сервер:</label
                >
                <input
                  v-model="mailingData.email.host"
                  type="text"
                  :disabled="
                    !mailingData.notificationEmailEnable &&
                    !mailingData.reportEmailEnable
                  "
                  :class="{ 'validation-error': error.emailHost }"
                  :title="error.emailHost"
                />
                <label
                  :disabled="
                    !mailingData.notificationEmailEnable &&
                    !mailingData.reportEmailEnable
                  "
                  >Порт:</label
                >
                <number-box
                  :min="0"
                  :max="65535"
                  ref="comNetPort"
                  v-model="mailingData.email.port"
                  style="width: 50px"
                  :disabled="
                    !mailingData.notificationEmailEnable &&
                    !mailingData.reportEmailEnable
                  "
                />
                <check-box
                  style="grid-column: span 2"
                  v-model="mailingData.email.useAuthentication"
                  :disabled="
                    !mailingData.notificationEmailEnable &&
                    !mailingData.reportEmailEnable
                  "
                  >Аутентификация</check-box
                >
                <div
                  class="system-props-grid"
                  style="grid-column: span 2; padding-left: 5em"
                >
                  <label
                    :disabled="
                      (!mailingData.notificationEmailEnable &&
                        !mailingData.reportEmailEnable) ||
                      !mailingData.email.useAuthentication
                    "
                    >Пользователь:</label
                  >
                  <input
                    v-model="mailingData.email.user"
                    type="text"
                    :disabled="
                      (!mailingData.notificationEmailEnable &&
                        !mailingData.reportEmailEnable) ||
                      !mailingData.email.useAuthentication
                    "
                    :class="{ 'validation-error': error.emailUser }"
                    :title="error.emailUser"
                  />
                  <label
                    :disabled="
                      (!mailingData.notificationEmailEnable &&
                        !mailingData.reportEmailEnable) ||
                      !mailingData.email.useAuthentication
                    "
                    >Пароль:</label
                  >
                  <input
                    type="password"
                    v-model="mailingData.email.password"
                    :disabled="
                      (!mailingData.notificationEmailEnable &&
                        !mailingData.reportEmailEnable) ||
                      !mailingData.email.useAuthentication
                    "
                    :class="{ 'validation-error': error.emailPassword }"
                    :title="error.emailPassword"
                  />
                </div>
                <label
                  :disabled="
                    !mailingData.notificationEmailEnable &&
                    !mailingData.reportEmailEnable
                  "
                  >Email отправителя:</label
                >
                <input
                  v-model="mailingData.email.senderEmail"
                  type="text"
                  :disabled="
                    !mailingData.notificationEmailEnable &&
                    !mailingData.reportEmailEnable
                  "
                  :class="{ 'validation-error': error.senderEmail }"
                  :title="error.senderEmail"
                />
                <label
                  :disabled="
                    !mailingData.notificationEmailEnable &&
                    !mailingData.reportEmailEnable
                  "
                  >Имя отправителя:</label
                >
                <input
                  v-model="mailingData.email.senderName"
                  type="text"
                  :disabled="
                    !mailingData.notificationEmailEnable &&
                    !mailingData.reportEmailEnable
                  "
                />
                <div />
                <button
                  @click="onTestEmailClick"
                  :disabled="
                    testingEmail ||
                    (!mailingData.notificationEmailEnable &&
                      !mailingData.reportEmailEnable)
                  "
                  style="justify-self: right"
                >
                  Проверить
                </button>
              </div>
            </expantion>
            <expantion
              caption="Настройки отправки SMS-сообщений"
              :resizable="false"
            >
              <div
                class="system-props-grid"
                :disabled="!mailingData.notificationSmsEnable"
              >
                <label :disabled="!mailingData.notificationSmsEnable"
                  >Порт отсылки сообщений:</label
                >
                <select
                  v-model="mailingData.sms.port"
                  :disabled="!mailingData.notificationSmsEnable"
                >
                  <option v-for="(r, index) in ports" :key="index" :value="r">
                    {{ r.name }}
                  </option>
                </select>
                <label :disabled="!mailingData.notificationSmsEnable"
                  >Скорость:</label
                >
                <select
                  v-model="mailingData.sms.portSpeed"
                  :disabled="!mailingData.notificationSmsEnable"
                >
                  <option
                    v-for="r in $store.state.env.comPortSpeeds"
                    :key="r"
                    :value="parseInt(r)"
                  >
                    {{ r }}
                  </option>
                </select>
                <label :disabled="!mailingData.notificationSmsEnable"
                  >Частей в СМС, не более:</label
                >
                <number-box
                  v-model="mailingData.sms.messageSmsPartCount"
                  style="width: 30px"
                  :min="1"
                  :max="250"
                  :disabled="!mailingData.notificationSmsEnable"
                  :class="{ 'validation-error': error.messageSmsPartCount }"
                  :title="error.messageSmsPartCount"
                />
                <check-box
                  style="grid-column: span 2"
                  v-model="mailingData.sms.notificationTextSend"
                  :disabled="!mailingData.notificationSmsEnable"
                  >Посылать сообщения только о наличии уведомлений</check-box
                >
                <div />
                <button
                  @click="onTestSmsClick"
                  :disabled="testingSms || !mailingData.notificationSmsEnable"
                  style="justify-self: right"
                >
                  Проверить
                </button>
              </div>
            </expantion>
          </div>
          <transition>
            <wizard
              v-if="wizard"
              v-bind="wizard"
              @cancel="cancelWizard"
              @end="onWizardEnd"
            />
          </transition>
        </tabx>
        <tabx text="Вид">
          <div class="system-props-view">
            <expantion
              caption="Индикация наличия собранных данных"
              :resizable="false"
            >
              <div class="system-props-grid">
                <label>Диапазон отображения:</label>
                <div class="system-props-grid">
                  <select v-model="viewData.timeType">
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
                  <div class="system-props-grid" style="min-width: 250px">
                    <div
                      v-if="viewData.timeType === pollDataTimeTypes.onDepth"
                      class="system-props-grid"
                    >
                      <number-box
                        v-model="viewData.timeDepth"
                        style="width: 30px"
                        :min="1"
                        :max="999"
                      />
                      <label>дн</label>
                    </div>
                    <div
                      v-else
                      style="
                        display: grid;
                        align-items: center;
                        grid-gap: 5px 3px;
                        grid-template-columns: auto auto auto 1fr;
                      "
                    >
                      <datepicker
                        v-model="viewData.timeFrom"
                        format="DD.MM.YYYY"
                        style="width: 90px"
                        :class="{ 'validation-error': error.viewTime }"
                        :title="error.viewTime"
                      />
                      <check-box v-model="viewData.isTimeTo" />
                      <label :disabled="!viewData.isTimeTo">по</label>
                      <datepicker
                        :disabled="!viewData.isTimeTo"
                        v-model="viewData.timeTo"
                        format="DD.MM.YYYY"
                        style="width: 90px"
                        :class="{ 'validation-error': error.viewTime }"
                        :title="error.viewTime"
                      />
                    </div>
                    <div></div>
                  </div>
                </div>
              </div>
            </expantion>
            <expantion caption="Общие параметры" :resizable="false">
              <check-box v-model="viewData.hideNodeNameInAddress"
                >Никогда не отображать наименование объекта учета в адресе точки
                учета</check-box
              >
            </expantion>
            <expantion caption="Отображение вкладок" :resizable="false">
              <div class="system-props-web">
                <check-box v-model="viewData.info">Информация</check-box>
                <check-box v-model="viewData.points">Точки учета</check-box>
                <check-box v-model="viewData.equips">Приборы</check-box>
                <check-box v-model="viewData.extra">Дополнительно</check-box>
                <check-box v-model="viewData.map">Карта</check-box>
              </div>
            </expantion>

            <div class="system-props-points-container">
              <expantion
                class="system-props-points-item"
                caption="Отображение списков точек учета"
                :resizable="false"
                style="padding: 5px 0"
              >
                <system-props-points @points-updated="handlePointsUpdated" />
              </expantion>
              <expantion
                class="system-props-points-item"
                caption="Отображение списков приборов"
                :resizable="false"
                style="padding: 5px 0"
              >
                <system-props-equips @equips-updated="handleEquipsUpdated" />
              </expantion>
            </div>
          </div>
        </tabx>
        <tabx v-if="certificates" text="Сертификаты">
          <div class="system-props-common">
            <expantion caption="Общие параметры" :resizable="false">
              <div class="system-props-grid">
                <label>Сервер хранения сертификатов:</label>
                <select v-model="certificates.server">
                  <option
                    v-for="r in certificates.servers.sort(sortByName)" 
                    :key="r.id"
                    :value="r.id"
                  >
                    {{ r.name }}
                  </option>
                </select>
              </div>
            </expantion>
          </div>
        </tabx>
      </tabs>
    </preserver-component>
    <transition mode="out-in">
      <spinner :show="loading" :text="'Загрузка...'" />
    </transition>
  </div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'

import { matchType } from '../../plugins/api.js'

import CheckBox from '../Inputs/CheckBox.vue'
import Datepicker from '../Inputs/DatePicker.vue'
import Expantion from '../ExpantionPanel.vue'
import NumberBox from '../Inputs/NumberBox.vue'
import PollPeriodProps from './PollPeriodProps.vue'
import PreserverComponent from '../PreserverComponent.vue'
import Tabs from '../Tabs/Tabs.vue'
import Tabx from '../Tabs/Tabx.vue'
import Wizard from '../Wizard.vue'
import SystemPropsPoints from './SystemPropsPoints.vue'
import SystemPropsEquips from './SystemPropsEquips.vue'
import SystemPropsTimeSync from '@/components/SystemProps/SystemPropsTimeSync.vue'
import SystemPropsNotMakeDelta from '@/components/SystemProps/SystemPropsNotMakeDelta.vue'

const wizardSms = (phone) => {
  return {
    name: 'testSms',
    component: {
      text: 'Введите телефон получателя:',
      component: 'test-sms',
      event: 'changed',
      data: {
        phone: phone,
      },
    },
  }
}

const wizardEmail = (email) => {
  return {
    name: 'testEmail',
    component: {
      text: 'Введите почту получателя:',
      component: 'test-email',
      event: 'changed',
      data: {
        email: email,
      },
    },
  }
}

export default {
  components: {
    CheckBox,
    Datepicker,
    Expantion,
    NumberBox,
    PollPeriodProps,
    PreserverComponent,
    Tabs,
    Tabx,
    Wizard,
    SystemPropsPoints,
    SystemPropsEquips,
    SystemPropsTimeSync,
    SystemPropsNotMakeDelta,
  },
  data() {
    return {
      key: uuidv4(),
      wizard: null,
      localPhone: null,
      localEmail: null,
      testingSms: false,
      testingEmail: false,
      dateFormat: 'DD.MM.YYYY',
      hasChanges: false,
      saving: false,
      loading: true,

      localTimeZones: [],
      localTimeZonesType: 0,
      localNotMakeDelta: false,

      error: {
        emailHost: null,
        emailUser: null,
        emailPassword: null,
        senderEmail: null,
        messageSmsPartCount: null,
        pollDataType: null,
        viewTime: null,
        periodArchive: null,
        periodSetParams: null,
        periodEquipEvents: null,
        periodEquipCustomizing: null,
        periodSetDataColdWater: null,
        periodColdWater: null,
        periodEquipDatabaseParams: null,
        periodTimeSync: null,
      },
      months:
        'Январь_Февраль_Март_Апрель_Май_Июнь_Июль_Август_Сентябрь_Октябрь_Ноябрь_Декабрь'.split(
          '_'
        ),
      server: {
        isAlone: true,
        servers: [],
      },
      commonData: {
        systemNode: null,
      },
      pollData: {
        enabled: true,
        archiveHour: true,
        archiveDay: true,
        archiveMonth: true,
        setParams: true,
        equipEvents: true,
        equipCustomizing: true,
        setDataColdWater: true,
        coldWater: true,
        equipDatabaseParams: true,
        timeSync: true,
        depth: 0,
        dateStart: null,
        allowStartHour: 0,
        allowStartMin: 0,
        allowEndHour: 0,
        allowEndMin: 0,
        timeAllowEnd: null,
        allowCaptureData: true,
        autoEnableControl: true,
        control: true,
        periodArchive: {
          periodNum: 0,
          periodHour: 0,
          periodMin: 0,
          periodSec: 0,
          periodType: matchType(this.$store.state.env.pollDataPeriodTypes)
            .everyHour,
          retryHour: 0,
          retryMin: 0,
        },
        periodSetParams: {
          periodNum: 0,
          periodHour: 0,
          periodMin: 0,
          periodSec: 0,
          periodType: matchType(this.$store.state.env.pollDataPeriodTypes)
            .everyHour,
          retryHour: 0,
          retryMin: 0,
        },
        periodEquipEvents: {
          periodNum: 0,
          periodHour: 0,
          periodMin: 0,
          periodSec: 0,
          periodType: matchType(this.$store.state.env.pollDataPeriodTypes)
            .everyHour,
          retryHour: 0,
          retryMin: 0,
        },
        periodEquipCustomizing: {
          periodNum: 0,
          periodHour: 0,
          periodMin: 0,
          periodSec: 0,
          periodType: matchType(this.$store.state.env.pollDataPeriodTypes)
            .everyHour,
          retryHour: 0,
          retryMin: 0,
        },
        periodSetDataColdwater: {
          periodNum: 0,
          periodHour: 0,
          periodMin: 0,
          periodSec: 0,
          periodType: matchType(this.$store.state.env.pollDataPeriodTypes)
            .everyHour,
          retryHour: 0,
          retryMin: 0,
        },
        periodColdWater: {
          periodNum: 0,
          periodHour: 0,
          periodMin: 0,
          periodSec: 0,
          periodType: matchType(this.$store.state.env.pollDataPeriodTypes)
            .everyHour,
          retryHour: 0,
          retryMin: 0,
        },
        periodEquipDatabaseParams: {
          periodNum: 0,
          periodHour: 0,
          periodMin: 0,
          periodSec: 0,
          periodType: matchType(this.$store.state.env.pollDataPeriodTypes)
            .everyHour,
          retryHour: 0,
          retryMin: 0,
        },
        periodTimeSync: {
          periodNum: 0,
          periodHour: 0,
          periodMin: 0,
          periodSec: 0,
          periodType: matchType(this.$store.state.env.pollDataPeriodTypes)
            .everyHour,
          retryHour: 0,
          retryMin: 0,
        },
        waitHour: 0,
        waitMin: 0,
        autoDisableControl: false,
        retryCount: 1,
        autoRequest: true,
      },
      reportData: {
        day: 1,
        hours: 0,
        minutes: 0,
        month: 1,
        ordinary: {
          enableAvgToPeriod: false,
          enableContract: false,
          enableCorrection: false,
          enableLosses: false,
          timeIdleForAvgToPeriod: 30,
          timeIdleForCorrection: 15,
          timeWork: 1,
        },
        residentialBuilding: {
          enableAvgToPeriod: false,
          enableContract: false,
          enableCorrection: false,
          enableLosses: false,
          timeIdleForAvgToPeriod: 30,
          timeIdleForCorrection: 15,
          timeWork: 1,
        },
      },
      mailingData: {
        email: {
          host: null,
          port: 0,
          useAuthentication: false,
          user: null,
          password: null,
          senderEmail: null,
          senderName: null,
        },
        sms: {
          port: null,
          portSpeed: null,
          messageSmsPartCount: 1,
          notificationTextSend: false,
        },
      },
      temperatureGraphData: {
        t1more: true,
        t1moreValue: 3,
        t1moreType: true,
        t1less: true,
        t1lessValue: 3,
        t1lessType: true,
        t2more: true,
        t2moreValue: 5,
        t2moreType: true,
        t2less: true,
        t2lessValue: 5,
        t2lessType: true,
      },
      viewData: {
        timeType: matchType(this.$store.state.env.pollDataTimeTypes).onDepth,
        timeDepth: 33,
        timeFrom: new Date(new Date().setDate(-33)),
        timeTo: new Date(),
        hideNodeNameInAddress: false,
        info: true,
        points: true,
        equips: true,
        extra: true,
        map: true,
        infoEquipListIds: [],
        infoMeasureSchemeListIds: [],
      },
      certificates: null,
    }
  },
  async created() {
    this.$emitter.emit('componentCreated', {
      type: matchType(this.$store.state.env.itemTypes).systemProps,
      key: this.key,
      component: this,
    })

    await this.edit()

    this.$watch(
      () => this.commonData,
      () => (this.hasChanges = true),
      { deep: true }
    )

    this.$watch(
      () => this.pollData,
      () => (this.hasChanges = true),
      { deep: true }
    )

    this.$watch(
      () => this.reportData,
      () => (this.hasChanges = true),
      { deep: true }
    )

    this.$watch(
      () => this.temperatureGraphData,
      () => (this.hasChanges = true),
      { deep: true }
    )

    this.$watch(
      () => this.viewData,
      () => (this.hasChanges = true),
      { deep: true }
    )

    this.$watch(
      () => this.mailingData,
      () => (this.hasChanges = true),
      { deep: true }
    )

    this.$watch(
      () => this.certificates.server,
      () => (this.hasChanges = true)
    )
    this.$watch(
      () => this.$store.state.env.timeZones,
      () => (this.localTimeZones = this.$store.state.env.timeZones),
      { deep: true }
    )
  },
  beforeUnmount() {
    this.$emitter.emit('componentBeforeUnmount', {
      type: matchType(this.$store.state.env.itemTypes).systemProps,
      key: this.key,
      component: this,
    })
  },
  computed: {
    periodTypes() {
      return matchType(this.$store.state.env.pollDataPeriodTypes)
    },
    pollDataTypes() {
      return matchType(this.$store.state.env.pollDataTypes)
    },
    pollDataTimeTypes() {
      return matchType(this.$store.state.env.pollDataTimeTypes)
    },
    ports() {
      const server =
        this.commonData.systemNode !== null
          ? this.server.servers.find((r) => r.id === this.commonData.systemNode)
          : null

      if (server) {
        return server.ports
      }

      return []
    },
    periodArchiveData() {
      return Object.assign(
        {
          enabled: this.pollData.enabled && this.pollData.control,
          error: Object.assign(
            { pollDataPeriod: this.error.periodArchive },
            this.error
          ),
        },
        this.pollData.periodArchive
      )
    },
    periodSetParamsData() {
      return Object.assign(
        {
          enabled: this.pollData.enabled && this.pollData.control,
          error: Object.assign(
            { pollDataPeriod: this.error.periodSetParams },
            this.error
          ),
        },
        this.pollData.periodSetParams
      )
    },
    periodEquipEventsData() {
      return Object.assign(
        {
          enabled: this.pollData.enabled && this.pollData.control,
          error: Object.assign(
            { pollDataPeriod: this.error.periodEquipEvents },
            this.error
          ),
        },
        this.pollData.periodEquipEvents
      )
    },
    periodEquipCustomizingData() {
      return Object.assign(
        {
          enabled: this.pollData.enabled && this.pollData.control,
          error: Object.assign(
            { pollDataPeriod: this.error.periodEquipCustomizing },
            this.error
          ),
        },
        this.pollData.periodEquipCustomizing
      )
    },
    periodSetDataColdWaterData() {
      return Object.assign(
        {
          enabled: this.pollData.enabled && this.pollData.control,
          error: Object.assign(
            { pollDataPeriod: this.error.periodSetDataColdWater },
            this.error
          ),
        },
        this.pollData.periodSetDataColdWater
      )
    },
    periodColdWaterData() {
      return Object.assign(
        {
          enabled: this.pollData.enabled && this.pollData.control,
          error: Object.assign(
            { pollDataPeriod: this.error.periodColdWater },
            this.error
          ),
        },
        this.pollData.periodColdWater
      )
    },
    periodEquipDatabaseParamsData() {
      return Object.assign(
        {
          enabled: this.pollData.enabled && this.pollData.control,
          error: Object.assign(
            { pollDataPeriod: this.error.periodEquipDatabaseParams },
            this.error
          ),
        },
        this.pollData.periodEquipDatabaseParams
      )
    },
    periodTimeSyncData() {
      return Object.assign(
        {
          enabled: this.pollData.enabled && this.pollData.control,
          error: Object.assign(
            { pollDataPeriod: this.error.periodTimeSync },
            this.error
          ),
        },
        this.pollData.periodTimeSync
      )
    },
  },
  methods: {
    sortByName(a, b) {
      if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
      if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
      return 0
    },
    handlePointsUpdated(changedPoints) {
      this.viewData.infoMeasureSchemeListIds = changedPoints
    },
    handleEquipsUpdated(changedEquips) {
      this.viewData.infoEquipListIds = changedEquips
    },

    async edit() {
      try {
        const { data } = await this.$http.get('system/props')

        this.server = data.server
        this.commonData = data.commonData
        this.localTimeZonesType = data.commonData.timeZonesTypeSystem
        this.pollData = data.pollData
        this.viewData = data.viewData
        this.temperatureGraphData = data.temperatureGraphData
        this.reportData = data.reportData
        this.localNotMakeDelta = data.commonData.notMakeDeltaAfterNull

        if (data.mailingData.sms.port) {
          data.mailingData.sms.port = this.ports.find(
            (r) =>
              r.type === data.mailingData.sms.port.type &&
              r.id === data.mailingData.sms.port.id &&
              r.name === data.mailingData.sms.port.name
          )
        }
        this.mailingData = data.mailingData

        this.certificates = Object.prototype.hasOwnProperty.call(
          data,
          'certificates'
        )
          ? data.certificates
          : null
      } catch (error) {
        this.$store.commit('error', error)
      } finally {
        this.loading = false
      }
    },
    async onSaveClick() {
      try {
        this.saving = true

        this.error = {}

        const obj = {
          pollData: JSON.parse(JSON.stringify(this.pollData)),
          viewData: {
            timeType: this.viewData.timeType,
            timeDepth:
              matchType(this.$store.state.env.pollDataTimeTypes).onDepth ===
              this.viewData.timeType
                ? this.viewData.timeDepth
                : null,
            timeFrom:
              matchType(this.$store.state.env.pollDataTimeTypes).fromTime ===
              this.viewData.timeType
                ? new Date(this.viewData.timeFrom).getTime()
                : null,
            timeTo:
              matchType(this.$store.state.env.pollDataTimeTypes).fromTime ===
              this.viewData.timeType
                ? this.viewData.isTimeTo
                  ? new Date(this.viewData.timeTo).getTime()
                  : null
                : null,
            hideNodeNameInAddress: this.viewData.hideNodeNameInAddress,
            info: this.viewData.info,
            points: this.viewData.points,
            equips: this.viewData.equips,
            extra: this.viewData.extra,
            map: this.viewData.map,
            infoEquipListIds: this.viewData.infoEquipListIds,
            infoMeasureSchemeListIds: this.viewData.infoMeasureSchemeListIds,
          },
          commonData: this.commonData,
          reportData: this.reportData,
          temperatureGraphData: this.temperatureGraphData,
          mailingData: this.mailingData,
          certServer: this.certificates ? this.certificates.server : null,
        }

        obj.pollData.dateStart = new Date(this.pollData.dateStart).getTime()

        await this.$http.post('system/props', obj)

        this.hasChanges = false
      } catch (error) {
        if (error.response.status === 551) {
          this.error = error.response.data
        } else {
          this.$store.commit('error', error)
        }
      } finally {
        this.saving = false
      }
    },
    onTestSmsClick() {
      this.wizard = wizardSms(this.localPhone)
    },
    onTestEmailClick() {
      this.wizard = wizardEmail(this.localEmail)
    },
    onWizardEnd(data, name) {
      this.wizard = null

      if (name === 'testSms') {
        this.localPhone = data
        this.testSms(
          Object.assign(
            {
              phone: this.localPhone,
              systemNodeId: this.commonData.systemNode,
            },
            this.mailingData.sms
          )
        )
      } else if (name === 'testEmail') {
        this.localEmail = data
        this.testEmail(
          Object.assign(
            {
              email: this.localEmail,
              systemNodeId: this.commonData.systemNode,
            },
            this.mailingData.email
          )
        )
      }
    },
    cancelWizard() {
      this.wizard = null
    },
    async testSms(smsData) {
      this.testingSms = true
      const { data } = await this.$http.post('system/testSms', smsData)
      this.testingSms = false
      this.$store.commit('notification', data)
    },
    async testEmail(smtpData) {
      this.testingEmail = true
      const { data } = await this.$http.post('system/testEmail', smtpData)
      this.testingEmail = false
      this.$store.commit('notification', data)
    },
    onPeriodArchiveChange(value, prop) {
      this.pollData.periodArchive[prop] = value
    },
    onPeriodSetParamsChange(value, prop) {
      this.pollData.periodSetParams[prop] = value
    },
    onPeriodEquipEventsChange(value, prop) {
      this.pollData.periodEquipEvents[prop] = value
    },
    onPeriodEquipCustomizingChange(value, prop) {
      this.pollData.periodEquipCustomizing[prop] = value
    },
    onPeriodSetDataColdWaterChange(value, prop) {
      this.pollData.periodSetDataColdWater[prop] = value
    },
    onPeriodColdWaterChange(value, prop) {
      this.pollData.periodColdWater[prop] = value
    },
    onPeriodEquipDatabaseParamsChange(value, prop) {
      this.pollData.periodEquipDatabaseParams[prop] = value
    },
    onPeriodTimeSyncChange(value, prop) {
      this.pollData.periodTimeSync[prop] = value
    },
    handleTimeZoneType(timeZonesType) {
      this.commonData.timeZonesTypeSystem = timeZonesType
    },
    handleNotMakeDelta(notMakeDelta) {
      this.commonData.notMakeDeltaAfterNull = notMakeDelta
    },
  }, // end methods
}
</script>

<style scoped>
.grid {
  display: grid;
  gap: 5px 3px;
  align-items: center;
}

.grid select,
.system-props-grid select {
  width: fit-content;
}

.grid.two {
  grid-template-columns: auto 1fr;
}

.system-props-grid {
  display: grid;
  gap: 5px 3px;
  grid-template-columns: auto 1fr;
  align-items: center;
}

.grid label,
.system-props-grid label {
  text-align: end;
}

.grid div[disabled='true'],
.system-props-grid div[disabled='true'] {
  color: gray;
  opacity: 0.7;
}

.system-props-common,
.system-props-mail,
.system-props-view,
.system-props-web,
.system-props-report,
.system-props-points,
.system-props-equips,
.system-props-control {
  display: grid;
  gap: 5px 3px;
  grid-template-columns: auto;
}

.system-props-points-container {
  padding: 0 auto;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.system-props-points-item {
  max-width: 50%;
  /* justify-content: stretch; */
}

.system-props-temp {
  display: grid;
  gap: 5px 3px;
  grid-template-columns: auto auto 1fr;
  align-items: baseline;
}

.system-props-common,
.system-props-mail,
.system-props-temp,
.system-props-report,
.system-props-view {
  width: fit-content;
}
</style>
