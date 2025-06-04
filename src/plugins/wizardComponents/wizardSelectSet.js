
const wizardSelectSet = (http, id, type) => {
  if (type === 'standard') {
    return {
      name: type,
      component: {
        text: 'Выбор набора:',
        component: 'selector',
        event: 'selectionChanged',
        data: {
          loader: async () => {
            const { data } = await http.get('equip/analyzeSets', {
              params: { id },
            })

            return data.sort((a, b) => {
              if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
              if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
            })
          },
          searchColumn: 'name',
          singleMode: true,
          columns: [
            {
              prop: 'name',
              text: 'Наименование',
            },
          ],
        },
      },
    }
  } 
}

export { wizardSelectSet }
