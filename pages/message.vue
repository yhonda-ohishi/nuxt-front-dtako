<template>
  <UContainer class="py-8">
    <h1 class="text-3xl font-bold mb-6">Messages</h1>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">Message Center</h2>
          <UButton
            icon="i-heroicons-plus"
            @click="isCreateModalOpen = true"
          >
            New Message
          </UButton>
        </div>
      </template>

      <div v-if="loading" class="flex justify-center py-8">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-4xl" />
      </div>

      <UAlert v-else-if="error" color="red" icon="i-heroicons-exclamation-triangle">
        {{ error }}
      </UAlert>

      <div v-else class="space-y-4">
        <div v-for="message in messages" :key="message.id" class="border rounded-lg p-4">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-semibold">{{ message.title || 'Untitled' }}</h3>
              <p class="text-gray-600 mt-1">{{ message.content }}</p>
              <p class="text-sm text-gray-400 mt-2">{{ formatDate(message.created_at) }}</p>
            </div>
            <UButton
              icon="i-heroicons-trash"
              color="red"
              variant="ghost"
              @click="deleteMessage(message.id)"
            />
          </div>
        </div>

        <div v-if="messages.length === 0" class="text-center py-8 text-gray-500">
          No messages available
        </div>
      </div>
    </UCard>

    <!-- Create Message Modal -->
    <UModal v-model="isCreateModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Create New Message</h3>
        </template>

        <UForm :state="newMessage" @submit="createMessage" class="space-y-4">
          <UFormGroup label="Title">
            <UInput v-model="newMessage.title" placeholder="Enter message title" />
          </UFormGroup>

          <UFormGroup label="Content">
            <UTextarea v-model="newMessage.content" placeholder="Enter message content" :rows="4" />
          </UFormGroup>

          <div class="flex justify-end gap-2">
            <UButton color="gray" variant="ghost" @click="isCreateModalOpen = false">
              Cancel
            </UButton>
            <UButton type="submit" :loading="creating">
              Create
            </UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>
  </UContainer>
</template>

<script setup>
const client = useApiClient()

const loading = ref(false)
const creating = ref(false)
const error = ref(null)
const messages = ref([])
const isCreateModalOpen = ref(false)

const newMessage = ref({
  title: '',
  content: ''
})

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString()
}

const fetchMessages = async () => {
  loading.value = true
  error.value = null

  try {
    // Adjust this endpoint based on your actual API
    const { data: responseData, error: apiError } = await client.GET('/messages')

    if (apiError) {
      error.value = apiError.message || 'Failed to fetch messages'
      // Use dummy data if API is not available
      messages.value = [
        {
          id: 1,
          title: 'Welcome Message',
          content: 'This is a sample message. Connect to your API to see real data.',
          created_at: new Date().toISOString()
        }
      ]
    } else {
      messages.value = responseData || []
    }
  } catch (err) {
    error.value = err.message || 'An unexpected error occurred'
    // Use dummy data if API is not available
    messages.value = [
      {
        id: 1,
        title: 'Welcome Message',
        content: 'This is a sample message. Connect to your API to see real data.',
        created_at: new Date().toISOString()
      }
    ]
  } finally {
    loading.value = false
  }
}

const createMessage = async () => {
  creating.value = true

  try {
    const { data: responseData, error: apiError } = await client.POST('/messages', {
      body: newMessage.value
    })

    if (!apiError) {
      messages.value.unshift(responseData)
      isCreateModalOpen.value = false
      newMessage.value = { title: '', content: '' }
    }
  } catch (err) {
    console.error('Failed to create message:', err)
  } finally {
    creating.value = false
  }
}

const deleteMessage = async (id) => {
  try {
    await client.DELETE(`/messages/${id}`)
    messages.value = messages.value.filter(m => m.id !== id)
  } catch (err) {
    console.error('Failed to delete message:', err)
  }
}

onMounted(() => {
  fetchMessages()
})
</script>