export const useApi = () => {
  const config = useRuntimeConfig()

  const apiFetch = $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ request, options }) {
      console.log('[API Request]', request, options)
    },
    onResponse({ request, response }) {
      console.log('[API Response]', request, response.status)
    },
    onResponseError({ request, response }) {
      console.error('[API Error]', request, response.status, response._data)
    }
  })

  return {
    fetch: apiFetch,
    getSwaggerDoc: () => apiFetch('/swagger/doc.json')
  }
}