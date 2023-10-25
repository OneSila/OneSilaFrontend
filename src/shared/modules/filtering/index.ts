import { RouteLocation, Router } from "vue-router"

export const useFiltering = (router: Router, route: RouteLocation) => {
  return {
    hasFilters: () => !!Object.keys(route.query).filter(key => !['sort', 'page', 'tab'].includes(key)).length,
    resetFilters: () => {
      router.push({
        name: route.name as string,
        query: { sort: route.query.sort, tab: route.query.tab }
      })
    },
    onFiltered: (filterMap: Record<string, any>) => {
      let query: Record<string, any> = {
        ...route.query,
        page: undefined
      }
    
      Object
        .keys(filterMap)
        .forEach(filter => {
          const key = filter === 'searchValue' ? 'search' : filter
          const hasValue = ![undefined, null, ''].includes(filterMap[filter])
    
          query[key] = hasValue ? (Array.isArray(filterMap[filter]) ? filterMap[filter] : `${filterMap[filter]}`) : undefined
        })
    
      router.push({
        name: route.name as string,
        params: route.params,
        query,
      })
    },
    onSorted: (sortOption: string) => {
      router.push({
        name: route.name as string,
        params: route.params,
        query: {
          ...route.query,
          sort: sortOption || undefined,
        },
      })
    }
  }
}
