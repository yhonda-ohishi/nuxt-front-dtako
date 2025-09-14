<template>
  <UContainer class="py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold">イベント詳細</h1>
      <UButton @click="$router.back()" variant="outline">
        戻る
      </UButton>
    </div>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">Event ID: {{ $route.params.id }}</h2>
          <UButton @click="fetchData" :loading="loading" variant="outline">
            更新
          </UButton>
        </div>
      </template>

      <div class="space-y-6">
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center py-12">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin h-8 w-8 text-gray-500" />
        </div>

        <!-- Error State -->
        <UAlert v-else-if="error" color="red" variant="subtle">
          <template #title>Error</template>
          <template #description>
            {{ error }}
          </template>
        </UAlert>

        <!-- Event Details -->
        <div v-else-if="eventData" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Event Type</label>
                <p class="text-lg font-semibold">{{ eventData.event_type }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Event Date</label>
                <p class="text-lg">{{ formatDate(eventData.event_date) }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Vehicle No</label>
                <p class="text-lg">{{ eventData.vehicle_no }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Driver Code</label>
                <p class="text-lg">{{ eventData.driver_code }}</p>
              </div>
            </div>

            <div class="space-y-4">
              <div v-if="eventData.start_city_name">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Start City</label>
                <p class="text-lg">{{ eventData.start_city_name }}</p>
              </div>

              <div v-if="eventData.end_city_name">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">End City</label>
                <p class="text-lg">{{ eventData.end_city_name }}</p>
              </div>

              <div v-if="eventData.start_place_name">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Place</label>
                <p class="text-lg">
                  <a
                    :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eventData.start_place_name)}`"
                    target="_blank"
                    class="text-blue-600 hover:underline"
                  >
                    {{ eventData.start_place_name }}
                  </a>
                </p>
              </div>

              <div v-if="eventData.end_place_name">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">End Place</label>
                <p class="text-lg">
                  <a
                    :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eventData.end_place_name)}`"
                    target="_blank"
                    class="text-blue-600 hover:underline"
                  >
                    {{ eventData.end_place_name }}
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div v-if="eventData.description" class="mt-6">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <p class="text-lg bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">{{ eventData.description }}</p>
          </div>

          <!-- Location Map -->
          <div v-if="hasLocationData" class="mt-6">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Route Map</label>

            <!-- Location Details -->
            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
              <div v-if="eventData.latitude && eventData.longitude">
                <p><strong>Current Location:</strong> {{ eventData.latitude }}, {{ eventData.longitude }}</p>
              </div>
              <div v-if="eventData.start_city_name">
                <p><strong>Start City:</strong> {{ eventData.start_city_name }}</p>
              </div>
              <div v-if="eventData.end_city_name">
                <p><strong>End City:</strong> {{ eventData.end_city_name }}</p>
              </div>
            </div>

            <!-- Google Maps with Route -->
            <div class="mt-4">
              <!-- Interactive Google Maps with straight line -->
              <GoogleMapsRoute
                v-if="eventData.start_city_name || eventData.end_city_name || (eventData.latitude && eventData.longitude)"
                :start-city="eventData.start_city_name"
                :end-city="eventData.end_city_name"
                :start-place-name="eventData.start_place_name"
                :end-place-name="eventData.end_place_name"
                :latitude="eventData.latitude"
                :longitude="eventData.longitude"
                :event-type="eventData.event_type"
                :event-date="eventData.event_date"
                :vehicle-no="eventData.vehicle_no"
                :driver-code="eventData.driver_code"
                :height="500"
              />
              <!-- Fallback for no location data -->
              <div v-else class="text-center py-12 text-gray-500 border rounded-lg">
                <UIcon name="i-heroicons-map" class="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No location data available</p>
              </div>
            </div>

            <!-- Google Maps links -->
            <div class="mt-4 flex gap-4 justify-center text-sm">
              <a
                v-if="eventData.start_city_name"
                :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eventData.start_city_name)}`"
                target="_blank"
                class="text-blue-600 hover:underline"
              >
                📍 Start City
              </a>
              <a
                v-if="eventData.end_city_name"
                :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eventData.end_city_name)}`"
                target="_blank"
                class="text-blue-600 hover:underline"
              >
                📍 End City
              </a>
              <a
                v-if="eventData.start_city_name && eventData.end_city_name"
                :href="googleMapsDirectionsUrl"
                target="_blank"
                class="text-green-600 hover:underline"
              >
                🗺️ Get Directions
              </a>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12 text-gray-500">
          <UIcon name="i-heroicons-document-magnifying-glass" class="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Event not found.</p>
        </div>
      </div>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
const route = useRoute()
const loading = ref(false)
const error = ref(null)
const eventData = ref(null)

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('ja-JP')
}

// Check if we have location data to display the map
const hasLocationData = computed(() => {
  return eventData.value && (
    (eventData.value.latitude && eventData.value.longitude) ||
    eventData.value.start_city_name ||
    eventData.value.end_city_name
  )
})

// Generate Google Maps directions URL for external link
const googleMapsDirectionsUrl = computed(() => {
  if (!eventData.value || !eventData.value.start_city_name || !eventData.value.end_city_name) return ''

  return `https://www.google.com/maps/dir/${encodeURIComponent(eventData.value.start_city_name)}/${encodeURIComponent(eventData.value.end_city_name)}`
})

const fetchData = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await $fetch(`/api/dtako/events/${route.params.id}`)
    console.log('Fetched event:', response)
    eventData.value = response
  } catch (err) {
    console.error('Fetch error:', err)
    error.value = err.data?.message || err.message || 'Failed to fetch event details'
    eventData.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>