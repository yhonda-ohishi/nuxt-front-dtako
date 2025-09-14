<template>
  <UContainer class="py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold">イベント詳細</h1>
      <UButton @click="$router.back()" variant="outline">
        戻る
      </UButton>
    </div>

    <!-- Row Information Card -->
    <UCard class="mb-6" v-if="rowData">
      <template #header>
        <h2 class="text-xl font-semibold">運行データ情報</h2>
      </template>

      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        <div v-if="rowData.id">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">ID</label>
          <p class="text-lg">
            <a :href="`/events/${rowData.id}`" class="text-blue-600 hover:underline font-medium cursor-pointer">
              ...{{ rowData.id.slice(-8) }}
            </a>
          </p>
        </div>
        <div v-if="rowData.unko_no">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Unko No</label>
          <p class="text-lg">
            <a :href="`/events/${rowData.unko_no}`" class="text-blue-600 hover:underline font-medium cursor-pointer">
              ...{{ rowData.unko_no.slice(-8) }}
            </a>
          </p>
        </div>
        <div v-if="rowData.vehicle_cc">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Vehicle CC</label>
          <p class="text-lg font-semibold">{{ rowData.vehicle_cc }}</p>
        </div>
        <div v-if="rowData.vehicle_no">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Vehicle No</label>
          <p class="text-lg font-semibold">{{ rowData.vehicle_no }}</p>
        </div>
        <div v-if="rowData.driver_code">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Driver Code</label>
          <p class="text-lg font-semibold">{{ rowData.driver_code }}</p>
        </div>
        <div v-if="rowData.distance">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Distance</label>
          <p class="text-lg text-blue-600">{{ rowData.distance ? `${parseFloat(rowData.distance).toFixed(1)} km` : '0 km' }}</p>
        </div>
        <div v-if="rowData.fuel_amount">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Fuel</label>
          <p class="text-lg text-green-600">{{ rowData.fuel_amount ? `${parseFloat(rowData.fuel_amount).toFixed(1)} L` : '0 L' }}</p>
        </div>
        <div v-if="rowData.date">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
          <p class="text-lg">{{ rowData.date ? new Date(rowData.date).toLocaleDateString('ja-JP') : '-' }}</p>
        </div>
        <div v-if="rowData.start_time">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Time</label>
          <p class="text-lg">{{ rowData.start_time }}</p>
        </div>
        <div v-if="rowData.end_time">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">End Time</label>
          <p class="text-lg">{{ rowData.end_time }}</p>
        </div>
        <div v-if="rowData.working_time">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Working Time</label>
          <p class="text-lg">{{ rowData.working_time }}</p>
        </div>
        <div v-if="rowData.driving_time">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Driving Time</label>
          <p class="text-lg">{{ rowData.driving_time }}</p>
        </div>
        <div v-if="rowData.rest_time">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Rest Time</label>
          <p class="text-lg">{{ rowData.rest_time }}</p>
        </div>
        <div v-if="rowData.max_speed">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Max Speed</label>
          <p class="text-lg text-red-600">{{ rowData.max_speed }} km/h</p>
        </div>
        <div v-if="rowData.avg_speed">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Avg Speed</label>
          <p class="text-lg">{{ rowData.avg_speed }} km/h</p>
        </div>
        <div v-if="rowData.over_speed_count">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Over Speed Count</label>
          <p class="text-lg text-orange-600">{{ rowData.over_speed_count }}</p>
        </div>
        <div v-if="rowData.idling_time">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Idling Time</label>
          <p class="text-lg text-yellow-600">{{ rowData.idling_time }}</p>
        </div>
        <div v-if="rowData.fuel_efficiency">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Fuel Efficiency</label>
          <p class="text-lg text-purple-600">{{ rowData.fuel_efficiency }} km/L</p>
        </div>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">イベント一覧 (ID: {{ $route.params.id }})</h2>
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

        <!-- Main Events Table -->
        <div v-else-if="events && events.length > 0">
          <div class="flex justify-between items-center mb-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Found <span class="font-semibold">{{ sortedEvents.length }}</span> main events
            </p>
          </div>

          <UTable v-model:sorting="sorting" :data="sortedEvents" :columns="columns" />

          <!-- Excluded Events Tables - Grouped by Event Type -->
          <div v-if="Object.keys(excludedEventsByType).length > 0" class="mt-8">
            <h3 class="text-lg font-semibold mb-6">道路関連イベント</h3>

            <div v-for="(events, eventType) in excludedEventsByType" :key="eventType" class="mb-8">
              <h4 class="text-md font-medium mb-3 text-gray-800 dark:text-gray-200">{{ eventType }}</h4>
              <div class="flex justify-between items-center mb-4">
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  <span class="font-semibold">{{ events.length }}</span> events
                </p>
              </div>
              <UTable :data="events" :columns="columns" />
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12 text-gray-500">
          <UIcon name="i-heroicons-document-magnifying-glass" class="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>No events found for this ID.</p>
        </div>
      </div>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
import { h, resolveComponent } from 'vue'
// import type { TableColumn } from '@nuxt/ui'

const UButton = resolveComponent('UButton')
const route = useRoute()
const loading = ref(false)
const error = ref(null)
const events = ref([])
const rowData = ref(null)

// Sorting state - default to event_date ASC
const sorting = ref([
  {
    id: 'event_date',
    desc: false
  }
])

// Column definitions with sorting
const columns = [
  {
    accessorKey: 'event_type',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: `Event Type ${isSorted ? (isSorted === 'asc' ? '↑' : '↓') : ''}`,
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    },
    cell: ({ row }) => {
      const eventType = row.getValue('event_type')
      let linkClass = 'text-blue-600 hover:underline font-medium cursor-pointer'
      let bgClass = ''

      if (eventType === '積み') {
        linkClass = 'text-green-600 hover:underline font-medium cursor-pointer'
      } else if (eventType === '降し') {
        linkClass = 'text-yellow-600 hover:underline font-medium cursor-pointer'
      } else if (eventType === '休憩' || eventType === '休息') {
        linkClass = 'text-green-300 hover:underline font-medium cursor-pointer'
      } else if (eventType === '運行開始') {
        linkClass = 'text-white hover:underline font-medium cursor-pointer'
        bgClass = 'bg-blue-500 px-2 py-1 rounded'
      } else if (eventType === '運行終了') {
        linkClass = 'text-white hover:underline font-medium cursor-pointer'
        bgClass = 'bg-red-500 px-2 py-1 rounded'
      }

      return h('a', {
        href: `/events/detail/${row.original.id}`,
        class: `${linkClass} ${bgClass}`
      }, eventType)
    }
  },
  {
    accessorKey: 'event_date',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: `Event Date ${isSorted ? (isSorted === 'asc' ? '↑' : '↓') : ''}`,
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    }
  },
  {
    accessorKey: 'start_city_name',
    header: 'Start City'
  },
  {
    accessorKey: 'end_city_name',
    header: 'End City'
  },
  {
    accessorKey: 'vehicle_no',
    header: 'Vehicle No'
  },
  {
    accessorKey: 'driver_code',
    header: 'Driver Code'
  }
]

// Event types to exclude from main table
const excludedEventTypes = [
  '一般道速度オーバー',
  '一般道実車',
  '一般道空車',
  'アイドリング',
  '専用道'
]

// Event types to completely hide (not show even in excluded section)
const hiddenEventTypes = [
  '一般道実車',
  '一般道空車',
  '専用道'
]

// Computed sorted events - exclude certain event types
const sortedEvents = computed(() => {
  if (!events.value || events.value.length === 0) return []

  const rawEvents = Array.isArray(events.value) ? events.value :
                   events.value.events ? events.value.events :
                   events.value.data ? events.value.data : []

  return [...rawEvents]
    .filter(event => !excludedEventTypes.includes(event.event_type))
    .sort((a, b) => {
      const dateA = new Date(a.event_date)
      const dateB = new Date(b.event_date)
      return dateA - dateB // ASC order
    }).map(event => ({
      ...event,
      event_date: new Date(event.event_date).toLocaleString('ja-JP')
    }))
})

// Computed excluded events - grouped by event type (excluding hidden types)
const excludedEventsByType = computed(() => {
  if (!events.value || events.value.length === 0) return {}

  const rawEvents = Array.isArray(events.value) ? events.value :
                   events.value.events ? events.value.events :
                   events.value.data ? events.value.data : []

  const excludedEventsData = [...rawEvents]
    .filter(event => excludedEventTypes.includes(event.event_type) && !hiddenEventTypes.includes(event.event_type))
    .map(event => ({
      ...event,
      event_date: new Date(event.event_date).toLocaleString('ja-JP')
    }))

  // Group by event_type
  const grouped = {}
  excludedEventsData.forEach(event => {
    if (!grouped[event.event_type]) {
      grouped[event.event_type] = []
    }
    grouped[event.event_type].push(event)
  })

  // Sort each group by event_date ASC
  Object.keys(grouped).forEach(eventType => {
    grouped[eventType].sort((a, b) => {
      const dateA = new Date(a.event_date.replace(/\//g, '-'))
      const dateB = new Date(b.event_date.replace(/\//g, '-'))
      return dateA - dateB
    })
  })

  return grouped
})

const fetchData = async () => {
  loading.value = true
  error.value = null

  try {
    // Fetch row data from dtako/rows API
    const rowResponse = await $fetch('/api/dtako/rows', {
      params: { id: route.params.id }
    })
    console.log('Fetched row data:', rowResponse)

    // Handle row data response
    if (Array.isArray(rowResponse)) {
      rowData.value = rowResponse[0]
    } else if (rowResponse.data && Array.isArray(rowResponse.data)) {
      rowData.value = rowResponse.data[0]
    } else if (rowResponse.rows && Array.isArray(rowResponse.rows)) {
      rowData.value = rowResponse.rows[0]
    } else {
      rowData.value = rowResponse
    }

    // Fetch events data
    const eventsResponse = await $fetch('/api/dtako/events', {
      params: { id: route.params.id }
    })
    console.log('Fetched events:', eventsResponse)

    if (Array.isArray(eventsResponse)) {
      events.value = eventsResponse
    } else if (eventsResponse.events) {
      events.value = eventsResponse.events
    } else if (eventsResponse.data) {
      events.value = eventsResponse.data
    } else {
      events.value = []
    }
  } catch (err) {
    console.error('Fetch error:', err)
    error.value = err.data?.message || err.message || 'Failed to fetch data'
    events.value = []
    rowData.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>