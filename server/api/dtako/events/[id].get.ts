export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Event ID parameter is required'
    })
  }

  try {
    const url = `http://localhost:8080/dtako/events/${id}`
    const response = await $fetch(url, {
      headers: {
        'accept': '*/*'
      }
    })
    return response
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.data?.message || error.message || 'Failed to fetch event details'
    })
  }
})