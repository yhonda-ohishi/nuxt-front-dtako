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
          <h2 class="text-xl font-semibold">ID: {{ $route.params.id }}</h2>
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
import type { TableColumn } from '@nuxt/ui'

const UButton = resolveComponent('UButton')
const route = useRoute()
const loading = ref(false)
const error = ref(null)
const events = ref([])

// Sorting state - default to event_date ASC
const sorting = ref([
  {
    id: 'event_date',
    desc: false
  }
])

// Column definitions with sorting
const columns: TableColumn[] = [
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
      return h('a', {
        href: `/events/detail/${row.original.id}`,
        class: 'text-blue-600 hover:underline font-medium cursor-pointer'
      }, row.getValue('event_type'))
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
  'アイドリング'
]

// Event types to completely hide (not show even in excluded section)
const hiddenEventTypes = [
  '一般道実車',
  '一般道空車'
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
    const response = await $fetch('/api/dtako/events', {
      params: { id: route.params.id }
    })
    console.log('Fetched events:', response)

    if (Array.isArray(response)) {
      events.value = response
    } else if (response.events) {
      events.value = response.events
    } else if (response.data) {
      events.value = response.data
    } else {
      events.value = []
    }
  } catch (err) {
    console.error('Fetch error:', err)
    error.value = err.data?.message || err.message || 'Failed to fetch events'
    events.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>