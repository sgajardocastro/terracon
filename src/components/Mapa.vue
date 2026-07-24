<template>
  <div
    ref="mapContainer"
    class="card"
    style="width: 99%; height: 348px;"
  />
</template>

<script setup>
import 'ol/ol.css'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style'
import { fromLonLat, transformExtent } from 'ol/proj'

defineExpose({
  refreshMap,
  setPuntos
})

const mapContainer = ref(null)
const map = ref(null)
let vectorLayer = null

// Fallback extent
const chileExtent = transformExtent(
  [-75.0, -56.0, -66.0, -17.0],
  'EPSG:4326',
  'EPSG:3857'
)

let currentExtent = chileExtent

// Color map (tu backend manda "Rojo/Azul/Amarillo" -> normalizamos)
const colorMap = {
  azul: 'blue',
  amarillo: 'yellow',
  rojo: 'red',
  verde: 'green',
  naranja: 'orange',
  gris: 'gray'
}

function getColor(name) {
  if (!name) return 'blue'
  const key = String(name).toLowerCase()
  return colorMap[key] || name
}

function ensureMap() {
  if (map.value) return

  map.value = new Map({
    target: mapContainer.value,
    layers: [new TileLayer({ source: new OSM() })],
    view: new View({
      center: fromLonLat([-70.6483, -33.4569]),
      zoom: 4
    })
  })

  vectorLayer = new VectorLayer({ source: new VectorSource() })
  map.value.addLayer(vectorLayer)
}

// 🔥 Esta es la única entrada de datos ahora
function setPuntos(surveys = []) {
  ensureMap()

  vectorLayer.getSource().clear()
  const source = vectorLayer.getSource()

  const features = (surveys || [])
    .filter(item => item.latitud && item.longitud)
    .map(item => {
      const lon = parseFloat(item.longitud)
      const lat = parseFloat(item.latitud)
      if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null

      const feat = new Feature({
        geometry: new Point(fromLonLat([lon, lat]))
      })

      feat.setStyle(new Style({
        image: new CircleStyle({
          radius: 8, // 👈 un poquito más grande
          fill: new Fill({ color: getColor(item.estado_color) }),
          stroke: new Stroke({ color: '#000', width: 1 })
        })
      }))

      return feat
    })
    .filter(Boolean)

  source.addFeatures(features)

  const view = map.value.getView()

  if (features.length === 0) {
    view.setCenter(fromLonLat([-70.6483, -33.4569]))
    view.setZoom(4)
    currentExtent = chileExtent
  } else if (features.length === 1) {
    const coord = features[0].getGeometry().getCoordinates()
    view.setCenter(coord)
    view.setZoom(14)
    currentExtent = [coord[0] - 1200, coord[1] - 1200, coord[0] + 1200, coord[1] + 1200]
  } else {
    const extent = source.getExtent()
    view.fit(extent, { padding: [30, 30, 30, 30], maxZoom: 16, duration: 250 })
    currentExtent = extent
  }

  map.value.updateSize()
}

function refreshMap() {
  if (!map.value) return
  map.value.getView().fit(currentExtent, { padding: [20, 20, 20, 20], maxZoom: 18 })
  map.value.updateSize()
}

onMounted(() => {
  ensureMap()

  const onResize = () => refreshMap()
  window.addEventListener('resize', onResize)
  onBeforeUnmount(() => window.removeEventListener('resize', onResize))
})
</script>

<style scoped>
.card {
  margin: 5px;
  padding: 5px;
  color: #757575;
  border-radius: 5px;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
              0 1px 5px 0 rgba(0, 0, 0, 0.12),
              0 3px 1px -2px rgba(0, 0, 0, 0.2);
}
</style>
