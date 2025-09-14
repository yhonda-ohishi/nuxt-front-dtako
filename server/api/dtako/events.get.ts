export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const id = query.id

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID parameter is required'
    })
  }

  try {
    const url = `http://localhost:8080/dtako/events?unko_no=${id}`
    const response = await $fetch(url, {
      headers: {
        'accept': '*/*'
      }
    })
    return response
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.data?.message || error.message || 'Failed to fetch events'
    })
  }
})