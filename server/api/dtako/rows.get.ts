export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    const params = new URLSearchParams()
    if (query.id) params.append('id', query.id as string)
    if (query.from) params.append('from', query.from as string)
    if (query.to) params.append('to', query.to as string)
    if (query.vehicle_cc) params.append('vehicle_cc', query.vehicle_cc as string)

    const url = `http://localhost:8080/dtako/rows${params.toString() ? '?' + params.toString() : ''}`

    const response = await $fetch(url, {
      headers: {
        'accept': '*/*'
      }
    })
    return response
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.data?.message || error.message || 'Failed to fetch rows data'
    })
  }
})