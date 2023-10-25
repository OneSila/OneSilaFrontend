import { RouteLocation, Router } from "vue-router"
import { ref, watchEffect } from "vue"

export const usePagination = (router: Router, route: RouteLocation, itemsPerPage = 20, queryKey = 'page') => {
  const perPage = ref(itemsPerPage)
  const page = ref(parseInt(route.query[queryKey] as string || '1'))
  const offset = ref(0)

  watchEffect(() => {
    page.value = parseInt(route.query[queryKey] as string || '1')
  })

  watchEffect(() => {
    offset.value = (page.value - 1) * perPage.value
  })

  return {
    perPage,
    page,
    offset,
    updatePage: (newPage: number) => {
      page.value = newPage
    
      router.push({
        name: route.name as string,
        params: route.params,
        query: {
          ...route.query,
          [queryKey]: newPage,
        },
      })
    }
  }
}