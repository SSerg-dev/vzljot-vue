
const wizardSourceSelectSet = (http, id, type) => {
  if (type === 'source') {
    return {
      name: type,
      component: {
        text: 'Выбор источника:',
        component: 'selector',
        event: 'selectionChanged',
        data: {
          loader: async () => {
            let { data } = await http.get('equip/coldWaterSource')
            data = data.map((item) => ({
              ...item,
              type: 23,
              setType: 1,
            }))

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

export { wizardSourceSelectSet }
