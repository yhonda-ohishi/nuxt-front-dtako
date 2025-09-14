import createClient from 'openapi-fetch'
import type { paths } from '~/types/api'

export const useApiClient = () => {
  const config = useRuntimeConfig()

  const client = createClient<paths>({
    baseUrl: config.public.apiBase,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  return client
}