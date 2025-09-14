export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    const params = new URLSearchParams()
    if (query.from) params.append('from', query.from as string)
    if (query.to) params.append('to', query.to as string)
    if (query.vehicle_cc) params.append('vehicle_cc', query.vehicle_cc as string)

    const url = `http://localhost:8080/dtako/rows${params.toString() ? '?' + params.toString() : ''}`

    const response = await $fetch(url)
    return response
  } catch (error: any) {
    console.error('Backend API Error:', error)
    // Return empty array if backend is not available
    return []
  }
})