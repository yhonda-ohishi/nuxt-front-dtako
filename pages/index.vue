<template>
  <UContainer class="py-8">
    <h1 class="text-3xl font-bold mb-6">Dtako Rows</h1>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">Vehicle Operation Data</h2>
          <UButton @click="fetchData" :loading="loading" variant="outline">
            Refresh
          </UButton>
        </div>
      </template>

      <div class="space-y-6">
        <!-- Filters -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Date</label>
            <UInput v-model="filters.from" type="date" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To Date</label>
            <UInput v-model="filters.to" type="date" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vehicle CC</label>
            <UInput v-model="filters.vehicle_cc" placeholder="Enter vehicle CC" />
          </div>
        </div>

        <UButton @click="fetchData" :loading="loading" block>
          Apply Filters
        </UButton>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center py-12">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin h-8 w-8 text-gray-500" />
        </div>

        <!-- Error State -->
        <UAlert v-else-if="error" color="red" variant="subtle">
          <template #title>Error</template>
          <template #description>
            {{ error }}
            <p class="text-sm mt-2">Please check if the backend API is running on http://localhost:8080</p>
          </template>
        </UAlert>

        <!-- Data Table -->
        <div v-else-if="rows && rows.length > 0">
          <div class="flex justify-between items-center mb-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Found <span class="font-semibold">{{ rows.length }}</span> records
            </p>
          </div>

          <UTable :data="rows" />

          <!-- Summary Cards -->
          <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <UCard>
              <div class="text-center">
                <p class="text-sm text-gray-600 mb-2">Total Distance</p>
                <p class="text-3xl font-bold text-blue-600">{{ totalDistance }} km</p>
              </div>
            </UCard>

            <UCard>
              <div class="text-center">
                <p class="text-sm text-gray-600 mb-2">Total Fuel</p>
                <p class="text-3xl font-bold text-green-600">{{ totalFuel }} L</p>
              </div>
            </UCard>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12 text-gray-500">
          <UIcon name="i-heroicons-document-magnifying-glass" class="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>No data available. Click "Apply Filters" to fetch data.</p>
        </div>
      </div>
    </UCard>
  </UContainer>
</template>

<script setup>
const loading = ref(false)
const error = ref(null)
const data = ref(null)

const filters = ref({
  from: '',
  to: '',
  vehicle_cc: ''
})

const columns = [
  { id: 'id', key: 'id', label: 'ID' },
  { id: 'vehicle_cc', key: 'vehicle_cc', label: 'Vehicle CC' },
  { id: 'vehicle_no', key: 'vehicle_no', label: 'Vehicle No' },
  { id: 'driver_code', key: 'driver_code', label: 'Driver Code' },
  { id: 'distance', key: 'distance', label: 'Distance' },
  { id: 'fuel', key: 'fuel', label: 'Fuel' },
  { id: 'date', key: 'date', label: 'Date' }
]

const rows = computed(() => {
  if (!data.value) return []

  let rawRows = []
  if (Array.isArray(data.value)) {
    rawRows = data.value
  } else if (data.value.rows) {
    rawRows = data.value.rows
  } else if (data.value.data) {
    rawRows = data.value.data
  } else {
    rawRows = [data.value]
  }

  const result = rawRows.map(row => ({
    id: row.id?.slice(-8) || '-',
    vehicle_cc: row.vehicle_cc || '-',
    vehicle_no: row.vehicle_no || '-',
    driver_code: row.driver_code || '-',
    distance: row.distance ? `${parseFloat(row.distance).toFixed(1)} km` : '0 km',
    fuel: row.fuel_amount ? `${parseFloat(row.fuel_amount).toFixed(1)} L` : '0 L',
    date: row.date ? new Date(row.date).toLocaleDateString('ja-JP') : '-'
  }))

  console.log('Rows computed:', result)
  return result
})


const totalDistance = computed(() => {
  if (!data.value) return '0'

  let rows = []
  if (Array.isArray(data.value)) {
    rows = data.value
  } else if (data.value.rows) {
    rows = data.value.rows
  } else if (data.value.data) {
    rows = data.value.data
  } else {
    rows = []
  }

  const total = rows.reduce((sum, row) => sum + (parseFloat(row.distance) || 0), 0)
  return total.toFixed(1)
})

const totalFuel = computed(() => {
  if (!data.value) return '0'

  let rows = []
  if (Array.isArray(data.value)) {
    rows = data.value
  } else if (data.value.rows) {
    rows = data.value.rows
  } else if (data.value.data) {
    rows = data.value.data
  } else {
    rows = []
  }

  const total = rows.reduce((sum, row) => sum + (parseFloat(row.fuel_amount) || 0), 0)
  return total.toFixed(1)
})

const fetchData = async () => {
  loading.value = true
  error.value = null
  data.value = null

  try {
    const queryParams = {}
    if (filters.value.from) queryParams.from = filters.value.from
    if (filters.value.to) queryParams.to = filters.value.to
    if (filters.value.vehicle_cc) queryParams.vehicle_cc = filters.value.vehicle_cc

    const response = await $fetch('/api/dtako/rows', {
      params: queryParams
    })

    console.log('Fetched data:', response)
    data.value = response
  } catch (err) {
    console.error('Fetch error:', err)
    error.value = err.data?.message || err.message || 'Failed to fetch data'
    data.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>