<template>
  <div class="w-full">
    <div ref="mapContainer" :style="`height: ${height}px;`" class="rounded-lg border"></div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  startCity: String,
  endCity: String,
  startPlaceName: String,
  endPlaceName: String,
  latitude: Number,
  longitude: Number,
  eventType: String,
  eventDate: String,
  vehicleNo: String,
  driverCode: String,
  height: {
    type: Number,
    default: 500
  }
})

const config = useRuntimeConfig()
const mapContainer = ref(null)
let map = null
let directionsService = null
let geocoder = null

const initMap = () => {
  if (!mapContainer.value || !window.google) return

  // Initialize map centered on Japan
  map = new window.google.maps.Map(mapContainer.value, {
    zoom: 6,
    center: { lat: 36.2048, lng: 138.2529 }, // Center of Japan
    mapTypeId: 'roadmap'
  })

  geocoder = new window.google.maps.Geocoder()
  directionsService = new window.google.maps.DirectionsService()

  // If we have both start and end cities, draw the route
  if (props.startCity && props.endCity) {
    drawStraightLine()
  } else if (props.latitude && props.longitude) {
    // If we only have coordinates, show a marker there
    const position = { lat: props.latitude, lng: props.longitude }
    const marker = new window.google.maps.Marker({
      position,
      map,
      title: 'Event Location',
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
      }
    })

    // Create info window for single location
    const infoWindow = new window.google.maps.InfoWindow()
    marker.addListener('click', () => {
      const content = `<div style="padding: 8px 10px; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #3b82f6; font-weight: bold;">イベント位置</h3>
          <p style="margin: 3px 0; color: #000;"><strong>緯度:</strong> ${props.latitude}</p>
          <p style="margin: 3px 0; color: #000;"><strong>経度:</strong> ${props.longitude}</p>
          ${props.eventType ? `<p style="margin: 3px 0; color: #000;"><strong>イベント:</strong> ${props.eventType}</p>` : ''}
          ${props.eventDate ? `<p style="margin: 3px 0; color: #000;"><strong>日時:</strong> ${new Date(props.eventDate).toLocaleString('ja-JP')}</p>` : ''}
          ${props.vehicleNo ? `<p style="margin: 3px 0; color: #000;"><strong>車両:</strong> ${props.vehicleNo}</p>` : ''}
          ${props.driverCode ? `<p style="margin: 3px 0; color: #000;"><strong>運転手:</strong> ${props.driverCode}</p>` : ''}
        </div>`
      infoWindow.setContent(content)
      infoWindow.open(map, marker)

      // Remove extra padding from Google Maps InfoWindow
      window.google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
        // Remove ALL gm-style-iw-ch elements (there might be multiple)
        const iwChildren = document.querySelectorAll('.gm-style-iw-ch')
        iwChildren.forEach(child => {
          child.remove()  // Completely remove from DOM instead of hiding
        })

        // Adjust main container
        const iwOuter = document.querySelector('.gm-style-iw-a')
        if (iwOuter) {
          const iwContainer = iwOuter.querySelector('.gm-style-iw-d')
          if (iwContainer) {
            iwContainer.style.overflow = 'visible'
            iwContainer.style.padding = '0'
            iwContainer.style.maxWidth = '300px'
          }

          // Also check for direct children that might have padding
          const iwContent = iwContainer.querySelector('div')
          if (iwContent && iwContent.style) {
            iwContent.style.padding = '0'
            iwContent.style.margin = '0'
          }
        }

        // Adjust close button position
        const iwCloseBtn = document.querySelector('.gm-style-iw-tc')
        if (iwCloseBtn) {
          iwCloseBtn.style.top = '3px'
          iwCloseBtn.style.right = '3px'
        }
      })
    })

    map.setCenter(position)
    map.setZoom(15)
  }
}

const drawStraightLine = async () => {
  if (!geocoder || !map) return

  try {
    // Geocode start city
    const startResult = await new Promise((resolve, reject) => {
      geocoder.geocode({ address: props.startCity }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve(results[0].geometry.location)
        } else {
          reject(new Error(`Geocoding failed for ${props.startCity}`))
        }
      })
    })

    // Geocode end city
    const endResult = await new Promise((resolve, reject) => {
      geocoder.geocode({ address: props.endCity }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve(results[0].geometry.location)
        } else {
          reject(new Error(`Geocoding failed for ${props.endCity}`))
        }
      })
    })

    // Create info windows with custom styling
    const infoWindow = new window.google.maps.InfoWindow({
      disableAutoPan: false,
      maxWidth: 300,
      pixelOffset: new window.google.maps.Size(0, -10)
    })

    // Create marker for start point with info window
    const startMarker = new window.google.maps.Marker({
      position: startResult,
      map,
      title: props.startCity,
      label: 'S',
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
      }
    })

    // Start marker click event
    startMarker.addListener('click', () => {
      const content = `<div style="padding: 8px 10px; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #22c55e; font-weight: bold;">出発地点</h3>
          <p style="margin: 3px 0; color: #000;"><strong>都市:</strong> ${props.startCity || 'N/A'}</p>
          ${props.startPlaceName ? `<p style="margin: 3px 0; color: #000;"><strong>場所:</strong> ${props.startPlaceName}</p>` : ''}
          ${props.eventType ? `<p style="margin: 3px 0; color: #000;"><strong>イベント:</strong> ${props.eventType}</p>` : ''}
          ${props.eventDate ? `<p style="margin: 3px 0; color: #000;"><strong>日時:</strong> ${new Date(props.eventDate).toLocaleString('ja-JP')}</p>` : ''}
          ${props.vehicleNo ? `<p style="margin: 3px 0; color: #000;"><strong>車両:</strong> ${props.vehicleNo}</p>` : ''}
          ${props.driverCode ? `<p style="margin: 3px 0; color: #000;"><strong>運転手:</strong> ${props.driverCode}</p>` : ''}
        </div>`
      infoWindow.setContent(content)
      infoWindow.open(map, startMarker)

      // Remove extra padding from Google Maps InfoWindow
      window.google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
        // Use setTimeout to ensure DOM is fully rendered
        setTimeout(() => {
          // Remove ALL gm-style-iw-ch and gm-style-iw-chr elements
          const iwChildren = document.querySelectorAll('.gm-style-iw-ch, .gm-style-iw-chr')
          iwChildren.forEach(child => {
            if (child.parentNode) {
              child.parentNode.removeChild(child)
            }
          })

          // Also try to find by ID pattern if it exists
          const iwChildById = document.querySelector('[id*="-"]')
          if (iwChildById && (iwChildById.className === 'gm-style-iw-ch' || iwChildById.className === 'gm-style-iw-chr')) {
            iwChildById.parentNode?.removeChild(iwChildById)
          }

          // Adjust main container
          const iwOuter = document.querySelector('.gm-style-iw-a')
          if (iwOuter) {
            const iwContainer = iwOuter.querySelector('.gm-style-iw-d')
            if (iwContainer) {
              iwContainer.style.overflow = 'visible'
              iwContainer.style.padding = '0'

              // Find and adjust all child divs
              const childDivs = iwContainer.querySelectorAll('div')
              childDivs.forEach(div => {
                if (div.className === 'gm-style-iw-ch' ||
                    div.className === 'gm-style-iw-chr' ||
                    div.className.includes('gm-style-iw-ch')) {
                  div.style.display = 'none'
                }
              })
            }
          }

          // Adjust close button position
          const iwCloseBtn = document.querySelector('.gm-style-iw-tc')
          if (iwCloseBtn) {
            iwCloseBtn.style.top = '3px'
            iwCloseBtn.style.right = '3px'
          }
        }, 50)
      })
    })

    // Create marker for end point with info window
    const endMarker = new window.google.maps.Marker({
      position: endResult,
      map,
      title: props.endCity,
      label: 'E',
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
      }
    })

    // End marker click event
    endMarker.addListener('click', () => {
      const content = `<div style="padding: 8px 10px; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #ef4444; font-weight: bold;">到着地点</h3>
          <p style="margin: 3px 0; color: #000;"><strong>都市:</strong> ${props.endCity || 'N/A'}</p>
          ${props.endPlaceName ? `<p style="margin: 3px 0; color: #000;"><strong>場所:</strong> ${props.endPlaceName}</p>` : ''}
          ${props.eventType ? `<p style="margin: 3px 0; color: #000;"><strong>イベント:</strong> ${props.eventType}</p>` : ''}
          ${props.eventDate ? `<p style="margin: 3px 0; color: #000;"><strong>日時:</strong> ${new Date(props.eventDate).toLocaleString('ja-JP')}</p>` : ''}
          ${props.vehicleNo ? `<p style="margin: 3px 0; color: #000;"><strong>車両:</strong> ${props.vehicleNo}</p>` : ''}
          ${props.driverCode ? `<p style="margin: 3px 0; color: #000;"><strong>運転手:</strong> ${props.driverCode}</p>` : ''}
        </div>`
      infoWindow.setContent(content)
      infoWindow.open(map, endMarker)

      // Remove extra padding from Google Maps InfoWindow
      window.google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
        // Use setTimeout to ensure DOM is fully rendered
        setTimeout(() => {
          // Remove ALL gm-style-iw-ch and gm-style-iw-chr elements
          const iwChildren = document.querySelectorAll('.gm-style-iw-ch, .gm-style-iw-chr')
          iwChildren.forEach(child => {
            if (child.parentNode) {
              child.parentNode.removeChild(child)
            }
          })

          // Also try to find by ID pattern if it exists
          const iwChildById = document.querySelector('[id*="-"]')
          if (iwChildById && (iwChildById.className === 'gm-style-iw-ch' || iwChildById.className === 'gm-style-iw-chr')) {
            iwChildById.parentNode?.removeChild(iwChildById)
          }

          // Adjust main container
          const iwOuter = document.querySelector('.gm-style-iw-a')
          if (iwOuter) {
            const iwContainer = iwOuter.querySelector('.gm-style-iw-d')
            if (iwContainer) {
              iwContainer.style.overflow = 'visible'
              iwContainer.style.padding = '0'

              // Find and adjust all child divs
              const childDivs = iwContainer.querySelectorAll('div')
              childDivs.forEach(div => {
                if (div.className === 'gm-style-iw-ch' ||
                    div.className === 'gm-style-iw-chr' ||
                    div.className.includes('gm-style-iw-ch')) {
                  div.style.display = 'none'
                }
              })
            }
          }

          // Adjust close button position
          const iwCloseBtn = document.querySelector('.gm-style-iw-tc')
          if (iwCloseBtn) {
            iwCloseBtn.style.top = '3px'
            iwCloseBtn.style.right = '3px'
          }
        }, 50)
      })
    })

    // Draw a straight line between the two points
    const lineCoordinates = [startResult, endResult]
    const straightLine = new window.google.maps.Polyline({
      path: lineCoordinates,
      geodesic: true,
      strokeColor: '#0000FF',
      strokeOpacity: 1.0,
      strokeWeight: 3
    })
    straightLine.setMap(map)

    // Adjust map bounds to show both points
    const bounds = new window.google.maps.LatLngBounds()
    bounds.extend(startResult)
    bounds.extend(endResult)
    map.fitBounds(bounds)

    // Add some padding
    const padding = { top: 50, right: 50, bottom: 50, left: 50 }
    map.fitBounds(bounds, padding)

  } catch (error) {
    console.error('Error drawing route:', error)
  }
}

const loadGoogleMapsScript = () => {
  return new Promise((resolve) => {
    if (window.google && window.google.maps) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${config.public.googleMapsApiKey}&libraries=geometry`
    script.async = true
    script.defer = true
    script.onload = resolve
    document.head.appendChild(script)
  })
}

onMounted(async () => {
  await loadGoogleMapsScript()
  initMap()
})

// Watch for prop changes
watch(() => [props.startCity, props.endCity], () => {
  if (map) {
    initMap()
  }
})
</script>