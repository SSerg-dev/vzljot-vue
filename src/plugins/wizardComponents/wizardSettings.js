export const wizardSettings = (settings) => {
  return {
    name: 'settings',
    component: {
      text: 'Настройки сбора и рассылки данных:',
      component: 'pollDataSettings',
      event: 'changed',
      data: {
        settings,
      },
    },
  }
}
