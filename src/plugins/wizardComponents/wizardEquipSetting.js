export const wizardAdd = (options) => {
  const types = [
    { type: 'create', text: 'Создать набор' }
  ]

  return {
    name: 'add',
    options,
    component: {
      text: 'Создать набор:',
      component: 'selector-option',
      event: 'selectionChanged',
      
      data: {
        options: types[0]
      },
      
      next(data) {
        if (data === 'create') {
          return {
            component: 'set-detail',
            event: 'changed',
            data: { set }, 
          }
        }

        
      },
    },
  }
}

export const wizardRemove = (options) => {
  return {
    name: 'remove',
    options,
    component: {
      text: 'Удаление наборов:',
      component: 'message',
      data: {
        text: 'Вы действительно хотите удалить выбранные объекты?',
      },
    },
  }
}

// export const cancelWizard = () => {
//   return null
// }

// export const onWizardEnd = () => {
//   return null
// }
