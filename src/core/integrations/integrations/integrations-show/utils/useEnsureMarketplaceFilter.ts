import { onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const MARKETPLACE_FILTER_KEY = 'marketplace';

type MarketplaceIdGetter = () => string | null | undefined;

type EnsureMarketplaceFilterOptions = {
  filterKey?: string;
};

const valuesMatch = (current: unknown, expected: string) => {
  if (Array.isArray(current)) {
    return current.length === 1 && current[0] === expected;
  }

  return current === expected;
};

export const useEnsureMarketplaceFilter = (
  getMarketplaceId: MarketplaceIdGetter,
  options: EnsureMarketplaceFilterOptions = {},
) => {
  const route = useRoute();
  const router = useRouter();
  const filterKey = options.filterKey ?? MARKETPLACE_FILTER_KEY;

  const applyDefault = (marketplaceId: string | null | undefined) => {
    if (!marketplaceId) {
      return;
    }

    if (valuesMatch(route.query[filterKey], marketplaceId)) {
      return;
    }

    router.replace({
      query: {
        ...route.query,
        [filterKey]: marketplaceId,
      },
    });
  };

  onMounted(() => {
    applyDefault(getMarketplaceId());
  });

  watch(
    [() => getMarketplaceId(), () => route.query[filterKey]],
    ([marketplaceId]) => {
      if (!marketplaceId) {
        return;
      }

      if (valuesMatch(route.query[filterKey], marketplaceId)) {
        return;
      }

      router.replace({
        query: {
          ...route.query,
          [filterKey]: marketplaceId,
        },
      });
    },
  );
};
