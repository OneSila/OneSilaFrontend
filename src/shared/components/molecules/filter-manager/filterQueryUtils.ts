import type { LocationQuery } from 'vue-router';
import type { SearchConfig, SearchFilter } from '../../organisms/general-search/searchConfig';
import { booleanifyIfNeeded } from '../../../utils';

type FiltersWithLookupEntry = {
  keys: string[];
  lookup: string | null;
  isNot: boolean;
  filterKey?: string | null;
};

const isPlainObject = (value: unknown): value is Record<string, any> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
};

const mergeDeep = (target: Record<string, any>, source: Record<string, any>) => {
  Object.keys(source).forEach((key) => {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
      mergeDeep(targetValue, sourceValue);
      return;
    }

    target[key] = sourceValue;
  });
};

const buildNestedFilterObject = (
  filterKey: string,
  namePath: string[],
  lookupKeys: string[],
  lookup: string | null,
  value: any,
) => {
  const path = [...namePath, ...lookupKeys];
  const leafValue = lookup ? { [lookup]: value } : value;

  if (path.length === 0) {
    return { [filterKey]: leafValue };
  }

  let nested = leafValue as any;
  for (let i = path.length - 1; i >= 0; i -= 1) {
    nested = { [path[i]]: nested };
  }

  return { [filterKey]: nested };
};

const buildFiltersWithLookup = (searchConfig: SearchConfig) => {
  const result: Record<string, FiltersWithLookupEntry> = {};

  (searchConfig.filters || []).forEach((filter: SearchFilter) => {
    let lookup: string | null = 'exact';
    if (filter.lookupType) {
      lookup = filter.lookupType === 'none' ? null : filter.lookupType;
    }

    const shouldUseLookup = Boolean(filter.addLookup || filter.lookupType);
    if (!shouldUseLookup) {
      lookup = null;
    }

    result[filter.name] = {
      keys: filter.lookupKeys || [],
      lookup,
      isNot: filter.isNot || false,
      filterKey: filter.filterKey || null,
    };
  });

  return result;
};

export const buildFilterVariablesFromRouteQuery = (
  searchConfig: SearchConfig,
  routeQuery: LocationQuery,
  options?: { prefix?: string; excludeKeys?: string[] },
): Record<string, any> | null => {
  const prefix = options?.prefix ?? '';
  const exclude = new Set(options?.excludeKeys ?? []);
  const filtersWithLookup = buildFiltersWithLookup(searchConfig);
  const updatedVariables: Record<string, any> = {};

  (searchConfig.filters || []).forEach((filter) => {
    if (exclude.has(filter.name)) {
      return;
    }

    const queryKey = `${prefix}${filter.name}`;
    const raw = (routeQuery as Record<string, any>)[queryKey];
    if (raw === undefined) {
      return;
    }

    const value = booleanifyIfNeeded(raw);
    if (value == null) {
      return;
    }

    const { lookup, keys, isNot, filterKey } = filtersWithLookup[filter.name] || {
      lookup: null,
      keys: [],
      isNot: false,
      filterKey: null,
    };
    const [rawFilterKey, ...namePath] = filter.name.split('__');
    const resolvedFilterKey = filterKey || rawFilterKey;
    const builtValue = buildNestedFilterObject(resolvedFilterKey, namePath, keys, lookup, value);

    if (isNot) {
      if (!updatedVariables['NOT']) {
        updatedVariables['NOT'] = {};
      }
      mergeDeep(updatedVariables['NOT'], builtValue);
      return;
    }

    mergeDeep(updatedVariables, builtValue);
  });

  return Object.keys(updatedVariables).length ? updatedVariables : null;
};

export const buildNextQueryParamsFromRouteQuery = (
  searchConfig: SearchConfig,
  routeQuery: LocationQuery,
  options?: { excludeKeys?: string[]; prefixKey?: string },
) => {
  const exclude = new Set(options?.excludeKeys ?? []);
  const prefixKey = options?.prefixKey ?? 'next__';
  const nextQuery: Record<string, any> = {};

  (searchConfig.filters || []).forEach((filter) => {
    if (exclude.has(filter.name)) {
      return;
    }

    const value = (routeQuery as Record<string, any>)[filter.name];
    if (value === undefined) {
      return;
    }

    nextQuery[`${prefixKey}${filter.name}`] = value;
  });

  return nextQuery;
};

export const extractPrefixedQueryParams = (routeQuery: LocationQuery, prefix: string) => {
  const query = routeQuery as Record<string, any>;
  const result: Record<string, any> = {};

  Object.keys(query).forEach((key) => {
    if (key.startsWith(prefix)) {
      result[key] = query[key];
    }
  });

  return result;
};
