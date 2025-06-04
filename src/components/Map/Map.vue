<template>
  <div class="map-container">
    <search-component
      :style="inited ? { display: 'flex' } : null"
      v-bind="searchData"
      @changed="search"
      @mouseenter="setMapEvents(false)"
      @mouseleave="setMapEvents(true)"
      class="search"
    />
    <div
      :style="inited ? { display: 'flex' } : null"
      class="checkboxes"
      @mouseenter="setMapEvents(false)"
      @mouseleave="setMapEvents(true)"
    >
      <label v-for="r in $store.state.env.nodeTypes" :key="r.type">
        <input
          type="checkbox"
          :value="r.type"
          v-model="filter.objects"
          @change="updateObjects"
        />
        <div :class="['fas', r.image, 'icon']" :title="r.text" />
      </label>
      <label>
        <input
          type="checkbox"
          checked
          value="point"
          v-model="filter.objects"
          @change="updateObjects"
        />
        <div class="fas fa-circle icon" title="Точки учета"></div>
      </label>
      <hr style="margin-left: 0; margin-right: 0" />
      <label
        v-for="(key, index) in Object.keys(statuses)
          .filter((key) => key >= 0)
          .sort()"
        :key="index"
      >
        <input
          type="checkbox"
          :value="key"
          v-model="filter.statuses"
          @change="updateObjects"
        />
        <div :class="statuses[key].image" :title="statuses[key].text"></div>
      </label>
    </div>
    <div id="mapid" style="width: 100%; height: 100%"></div>
    <spinner :show="showLoader" :text="'Загрузка карты...'" />
  </div>
</template>

<script>
import '../../../node_modules/leaflet/dist/leaflet.css'
import '../../../node_modules/leaflet.markercluster/dist/MarkerCluster.css'
import '../../assets/leaflet.custom.css'

import Axios from 'axios'
import L from 'leaflet/dist/leaflet-src'
import 'leaflet.markercluster'
import { render, h } from 'vue'

import MarkerPopupPoint from './MarkerPopupPoint.vue'
import MarkerPopupNode from './MarkerPopupNode.vue'
import SearchComponent from '../SearchComponent.vue'

export default {
  name: 'vue-map',
  components: {
    SearchComponent,
  },
  props: {
    userMap: Object,
  },
  data() {
    return {
      inited: false,
      mapObjects: null,
      iconCache: [],
      filter: {},
      showLoader: false,
      searchData: {
        url: 'point/findObjectsOnMap',
        variableWidth: true,
        settings: ['node', 'point'],
      },
    }
  },
  computed: {
    statuses() {
      return this.$store.state.env ? this.$store.state.env.statuses : {}
    },
    nodeTypes() {
      return this.$store.state.env.nodeTypes
    },
    itemTypes() {
      return this.$store.state.env.itemTypes
    },
    coords() {
      return this.$store.state.env.coords
    },
  },
  created() {
    this.$emitter.on('updateObject', this.updateMap)
    this.$emitter.on('deleteObject', this.deleteObject)
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)
    this.$nextTick(() => {
      const mapContainer = document.getElementById('mapid')
      if (!mapContainer) {
        console.error("Map container with ID 'mapid' is not found.")
        return
      }
      this.get()
      this.map = L.map('mapid', {
        zoom: 10,
        minZoom: 0,
        maxZoom: 18,
        worldCopyJump: true,
        zoomControl: false, 
      })
      L.control
        .zoom({
          position: 'topright',
          zoomInTitle: 'Увеличить',
          zoomOutTitle: 'Уменьшить',
        })
        .addTo(this.map)
      this.markerCluster = new L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 120,
        disableClusteringAtZoom: 15,
        spiderfyOnMaxZoom: false,
        iconCreateFunction: (e) => {
          return new L.DivIcon({
            html: this.getCluster(e),
            className: 'cluster',
            iconSize: new L.Point(40, 40),
          })
        },
      })
      this.map.whenReady(() => {
        this.map.addLayer(this.markerCluster) 
      })
    })
  },
  methods: {
    handleResize() {
      if (this.map) {
        this.map.invalidateSize()
      }
    },
    getObject(item) {
      return this.mapObjects[`${item.id}.${item.type}`]
    },
    async init() {
      let minX = 0,
        minY = 0,
        maxX = 0,
        maxY = 0

      Object.values(this.mapObjects).forEach((value) => {
        if (value.coords[0] < minX || minX === 0) minX = value.coords[0]
        if (value.coords[1] < minY || minY === 0) minY = value.coords[1]
        if (value.coords[0] > maxX || maxX === 0) maxX = value.coords[0]
        if (value.coords[1] > maxY || maxY === 0) maxY = value.coords[1]
      })

      var xc = (maxX + minX) / 2
      var yc = (maxY + minY) / 2

      var searchPanel = L.control({ position: 'topleft' })
      searchPanel.onAdd = () => {
        return this.$el.querySelector('.search-wrapper')
      }
      searchPanel.addTo(this.map)

      var checkboxesPanel = L.control({ position: 'topleft' })
      checkboxesPanel.onAdd = () => {
        return this.$el.querySelector('.checkboxes')
      }
      checkboxesPanel.addTo(this.map)

      const map = this.$store.state.env.maps[this.userMap.id]
      const mapOptions = map.connections.find(
        (r) => r?.name === this.userMap.connection
      )
      let tileLayer = null

      switch (map.type) {
        case 'wmsMap':
          {
            const url = new URL(mapOptions.data.serverUri)

            const { data } = await Axios.get(url.toString(), {
              params: {
                service: 'WMS',
                request: 'GetCapabilities',
              },
            })

            const parser = new DOMParser()
            const dom = parser.parseFromString(data, 'text/xml')
            const wmsLayers = {}

            for (const layer of dom.querySelectorAll(
              'Capability > Layer[queryable="1"] > Layer'
            )) {
              const name = layer.querySelector('Name').textContent
              const box = layer.querySelector('EX_GeographicBoundingBox')
              wmsLayers[name] = {
                title: layer.querySelector('Title').textContent,
                bounds: [
                  [
                    parseFloat(
                      box.querySelector('southBoundLatitude').textContent
                    ),
                    parseFloat(
                      box.querySelector('westBoundLongitude').textContent
                    ),
                  ],
                  [
                    parseFloat(
                      box.querySelector('northBoundLatitude').textContent
                    ),
                    parseFloat(
                      box.querySelector('eastBoundLongitude').textContent
                    ),
                  ],
                ],
              }
            }

            tileLayer = L.tileLayer.wms(`${window.props.baseUrl}map/wmsImage`, {
              crs: L.CRS.EPSG4326,
              format: 'image/png',
              layers: mapOptions.data.layer,
              version: '1.3.0',
              attribution:
                '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>',
            })

            tileLayer.addTo(this.map)

            this.map.fitBounds(wmsLayers[mapOptions.data.layer]?.bounds)
          }

          break
        default:
          tileLayer = L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution:
              '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>',
          })

          tileLayer.addEventListener('tileerror', function (e) {
            console.log('erroe', e)
          })

          tileLayer.addTo(this.map)

          this.map.panTo(
            new L.LatLng(
              xc === 0 ? this.coords.latitude : xc,
              yc === 0 ? this.coords.longitude : yc
            )
          )

          break
      }

      Object.keys(this.mapObjects).forEach((key) =>
        this.initObject(this.mapObjects[key])
      )
      this.map.addLayer(this.markerCluster)
      this.inited = true
    },
    search(item) {
      let obj = this.getObject(item)
      if (obj) {
        let type =
          this.itemTypes[obj.type].type === 'node'
            ? this.nodeTypes[obj.nodeType].type
            : this.itemTypes[obj.type].type
        if (
          this.filter.objects.indexOf(type) !== -1 &&
          this.filter.statuses.indexOf(obj.state.toString()) !== -1
        ) {
          this.map.setView(obj.coords, 18, 1)
          this.handleObjectClick({ target: obj.Marker })
        }
      }
    },
    updateObjects() {
      this.markerCluster.clearLayers()

      let markers = Object.values(this.mapObjects)
        .filter((item) => {
          let type =
            this.itemTypes[item.type].type === 'node'
              ? this.nodeTypes[item.nodeType].type
              : this.itemTypes[item.type].type
          return (
            this.filter.objects.indexOf(type) !== -1 &&
            this.filter.statuses.indexOf(item.state.toString()) !== -1
          )
        })
        .map((item) => {
          let type = this.itemTypes[item.type].type
          let index =
            (type === 'point'
              ? this.statuses[item.state].image
              : this.nodeTypes[item.nodeType].image) + item.state
          item.Marker = L.marker(item.coords, { icon: this.iconCache[index] })
          item.MarkerShown = true
          item.Marker.LinkedMapObject = item
          item.Marker.state = item.state
          item.Marker.addEventListener('click', this.handleObjectClick)
          return item.Marker
        })

      this.markerCluster.addLayers(markers)
    },
    setMapEvents: function (enable) {
      if (enable) {
        this.map.doubleClickZoom.enable()
        this.map.scrollWheelZoom.enable()
        this.map.dragging.enable()
      } else {
        this.map.doubleClickZoom.disable()
        this.map.scrollWheelZoom.disable()
        this.map.dragging.disable()
      }
    },
    getCluster(e) {
      var items = {}

      this.countStates(e, items)
      var count = Object.keys(items).reduce((sum, current) => {
        return sum + items[current]
      }, 0)

      let slices = Object.keys(items).map((value) => {
        return {
          percent: items[value] / count,
          color: this.statuses[value].color,
        }
      })

      let percent = 0

      function getCoordsForPercent(percent) {
        const x = Math.cos(2 * Math.PI * percent)
        const y = Math.sin(2 * Math.PI * percent)
        return [Math.round(x * 100000) / 100000, Math.ceil(y * 100000) / 100000]
      }

      var pathes = slices.map((item) => {
        const start = getCoordsForPercent(percent)
        percent += item.percent
        const end = getCoordsForPercent(percent)
        return `<path d="M ${start[0]} ${start[1]} A 1 1 0 ${
          item.percent > 0.5 ? 1 : 0
        } 1 ${end[0]} ${end[1]} L 0 0" fill="${item.color}"/>`
      })

      let path =
        pathes.length === 1
          ? `<circle r="1" fill="${slices[0].color}" />`
          : pathes.join('')

      return `<svg viewBox="-1 -1 2 2">${path}<circle r=".6" class="text-circle"></circle><text class="cluster-text" dy=".45em">${e.getChildCount()}</text></svg>`
    },
    countStates: function (e, items) {
      e._markers.forEach(function (item) {
        if (typeof items[item.state] === 'undefined') {
          items[item.state] = 0
        }
        items[item.state] += 1
      })

      for (let i = 0; i < e._childClusters.length; i++) {
        this.countStates(e._childClusters[i], items)
      }
    },
    initObject(item) {
      let type = this.itemTypes[item.type].type
      var index =
        (type === 'point'
          ? this.statuses[item.state].image
          : this.nodeTypes[item.nodeType].image) + item.state

      if (this.iconCache[index] === undefined) {
        switch (type) {
          case 'point':
            this.iconCache[index] = L.divIcon({
              className: this.statuses[item.state].image + ' point',
              iconSize: L.point(14, 14),
              iconAnchor: [7, 7],
              popupAnchor: [0, -7],
            })
            break
          case 'node':
            this.iconCache[index] = L.divIcon({
              html: `<div class="${
                this.nodeTypes[item.nodeType].image
              }"></div>`,
              className: `fas ${
                this.statuses[item.state].image
              } icon node-marker`,
              iconSize: L.point(26, 26),
              iconAnchor: [13, 13],
              popupAnchor: [0, -13],
            })
            break
        }
      }

      var icon = this.iconCache[index]

      item.Marker = L.marker(item.coords, { icon: icon })
      item.Marker.LinkedMapObject = item
      item.Marker.addEventListener('click', this.handleObjectClick)
      item.MarkerShown = true
      item.Marker.state = item.state
      this.markerCluster.addLayer(item.Marker)
    },
    handleObjectClick(e, force) {
      var isPopupOpen = e.target.isPopupOpen()
      if (isPopupOpen && !force) return

      let type = this.itemTypes[e.target.LinkedMapObject.type].type

      this.$http
        .get(type === 'point' ? 'map/point' : 'map/node', {
          params: { id: e.target.LinkedMapObject.id },
        })
        .then((response) => {
          const wrapper = document.createElement('div')
          render(
            h(type === 'point' ? MarkerPopupPoint : MarkerPopupNode, {
              marker: response.data,
              store: this.$store,
            }),
            wrapper
          )

          e.target.LinkedMapObject.Marker.bindPopup(wrapper, {
            className: 'custom',
          }).openPopup()
        })
        .catch((error) => {
          this.$store.commit('error', error)
        })
    },
    deleteObject(item) {
      let obj = this.getObject(item)
      if (obj) {
        if (obj.MarkerShown) this.markerCluster.removeLayer(obj.Marker)
        delete this.mapObjects[`${item.id}.${item.type}`]
      }
    },
    updateMap(item) {
      if (
        this.itemTypes[item.type].type === 'node' ||
        this.itemTypes[item.type].type === 'point'
      ) {
        if (item.hasOwnProperty('coords')) {
          let isPopupOpen = false
          let obj = this.getObject(item)
          if (obj) {
            isPopupOpen = obj.Marker.isPopupOpen()
            if (obj.MarkerShown) this.markerCluster.removeLayer(obj.Marker)
            delete this.mapObjects[`${item.id}.${item.type}`]
          }

          this.mapObjects[`${item.id}.${item.type}`] = item
          this.initObject(item)
          this.updateObjects()

          if (isPopupOpen) {
            this.handleObjectClick({ target: item.Marker }, true)
          }
        } else {
          this.deleteObject(item)
        }
      }
    },
    async get() {
      this.filter = {
        objects: ['ordinary', 'residentialBuilding', 'point'],
        statuses: Object.keys(this.$store.state.env.statuses).sort(),
      }
      this.showLoader = true
      try {
        let { data } = await this.$http.get('map/data')
        if (this.mapObjects) {
          Object.keys(this.mapObjects).forEach((key) => {
            if (this.mapObjects[key] && this.mapObjects[key].MarkerShown)
              this.markerCluster.removeLayer(this.mapObjects[key].Marker)
            delete this.mapObjects[key]
          })
        }
        this.mapObjects = data
        this.init()
      } catch (error) {
        this.$store.commit('error', error)
      }
      this.showLoader = false
    },
  },
}
</script>

<style>
.map-container {
  position: relative;
  flex: 1;
}

.map-container .search {
  width: 250px;
  z-index: 1000;
  font: 12px 'Segoe UI', Helvetica, 'Droid Sans', Tahoma, Geneva, sans-serif;
  display: none;
}

.map-container .checkboxes {
  display: none;
  flex-direction: column;
  padding: 5px 10px;
  background-color: white;
  border-radius: 3px;
}

.map-container .search,
.map-container .checkboxes {
  box-shadow: 0 3px 14px rgba(0, 0, 0, 0.4);
}

.map-container .checkboxes label {
  display: inline-flex;
  align-items: center;
}

.map-container .checkboxes label > div {
  margin-left: 3px;
}

.map-container .point,
.map-container .checkboxes label > div[class^='status'] {
  width: 14px;
  height: 14px;
  border-radius: 7px;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.7);
}

.map-container .node-marker {
  border-radius: 13px;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-container .cluster {
  background-clip: padding-box;
  border-radius: 20px;
  box-shadow: 0 0 6px black;
}

.map-container .cluster svg path,
.map-container .cluster svg circle {
  stroke: black;
  stroke-width: 0.02;
}

.map-container .text-circle {
  fill: white;
}

.map-container .cluster-text {
  font-size: 0.55px;
  text-anchor: middle;
}
</style>
