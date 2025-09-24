<script setup lang="ts">
import { computed, defineEmits, defineExpose, defineProps, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import apolloClient from "../../../../../../../../../../../../../apollo-client";
import { DiscreteLoader } from "../../../../../../../../../../../../shared/components/atoms/discrete-loader";
import {
  FieldQuery,
} from "../../../../../../../../../../../../shared/components/organisms/general-form/containers/form-fields/field-query";
import { QueryFormField } from "../../../../../../../../../../../../shared/components/organisms/general-form/formConfig";
import { FieldType } from "../../../../../../../../../../../../shared/utils/constants";
import { ebayRemoteCurrenciesQuery } from "../../../../../../../../../../../../shared/api/queries/salesChannels.js";
import { currenciesQuerySelector } from "../../../../../../../../../../../../shared/api/queries/currencies.js";
import { currencyOnTheFlyConfig } from "../../../../../../../../../../../settings/currencies/configs";
import type { RemoteCurrency } from "../../../../../../configs";

const props = defineProps<{
  salesChannelId: string;
}>();

const emit = defineEmits<{
  (e: "update:currencies", value: RemoteCurrency[]): void;
}>();

const { t } = useI18n();

const currencies = ref<RemoteCurrency[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const fetchLocalCurrencies = async (): Promise<Record<string, { id: string }>> => {
  const map: Record<string, { id: string }> = {};
  let after: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const { data } = await apolloClient.query({
      query: currenciesQuerySelector,
      variables: {
        first: 100,
        after,
      },
      fetchPolicy: "cache-first",
    });

    const edges = data?.currencies?.edges || [];

    edges.forEach((edge: any) => {
      const isoCode = edge?.node?.isoCode;
      const id = edge?.node?.id;

      if (typeof isoCode === "string" && typeof id === "string") {
        map[isoCode.toUpperCase()] = { id };
      }
    });

    const pageInfo = data?.currencies?.pageInfo;
    hasNextPage = Boolean(pageInfo?.hasNextPage);
    after = pageInfo?.endCursor || null;

    if (!after) {
      hasNextPage = false;
    }
  }

  return map;
};

const currencyField = computed(() => ({
  type: FieldType.Query,
  name: "localInstance",
  label: t("shared.labels.currency"),
  labelBy: "isoCode",
  valueBy: "id",
  query: currenciesQuerySelector,
  dataKey: "currencies",
  isEdge: true,
  multiple: false,
  filterable: true,
  removable: true,
  optional: true,
  formMapIdentifier: "id",
  createOnFlyConfig: currencyOnTheFlyConfig(t),
}));

const fetchCurrencies = async () => {
  loading.value = true;
  error.value = null;

  try {
    const [remoteResult, localCurrencyMap] = await Promise.all([
      apolloClient.query({
        query: ebayRemoteCurrenciesQuery,
        variables: {
          filter: { salesChannel: { id: { exact: props.salesChannelId } } },
        },
        fetchPolicy: "cache-first",
      }),
      fetchLocalCurrencies().catch((localCurrencyError) => {
        console.error(localCurrencyError);
        return {} as Record<string, string>;
      }),
    ]);

    currencies.value =
      remoteResult?.data?.remoteCurrencies?.edges?.map((edge: any) => {
        const node = edge.node;
        const existingLocalInstance =
          typeof node?.localInstance?.id === "string"
            ? { id: node.localInstance.id }
            : null;
        const remoteCodeKey =
          typeof node?.remoteCode === "string"
            ? node.remoteCode.toUpperCase()
            : null;
        const autoMappedInstance =
          existingLocalInstance ??
          (remoteCodeKey ? localCurrencyMap[remoteCodeKey] ?? null : null);

        return {
          id: node.id,
          remoteCode: node.remoteCode,
          name: node.name,
          marketplaceName: node?.salesChannelView?.name || null,
          localInstance: autoMappedInstance,
        };
      }) || [];

    if (!currencies.value.length) {
      error.value = t("integrations.imports.create.ebay.currencies.noData");
    }
  } catch (err) {
    console.error(err);
    error.value = t("integrations.imports.create.ebay.currencies.fetchError");
  } finally {
    loading.value = false;
  }
};

onMounted(fetchCurrencies);

const isValid = computed(() =>
  currencies.value.some((currency) => Boolean(currency.localInstance?.id))
);

defineExpose({
  isValid,
  currencies,
});

watch(
  currencies,
  () => {
    const mappedCurrencies = currencies.value.filter((currency) =>
      Boolean(currency.localInstance?.id),
    );

    emit("update:currencies", mappedCurrencies);
  },
  { deep: true },
);
</script>

<template>
  <div class="flex flex-col gap-6 min-h-96">
    <div class="text-center">
      <h1 class="text-2xl mb-2">{{ t('integrations.imports.create.ebay.currencies.title') }}</h1>
      <p class="text-sm text-gray-500">{{ t('integrations.imports.create.ebay.currencies.description') }}</p>
    </div>
    <hr />
    <div v-if="loading" class="text-center py-4">
      <DiscreteLoader :loading="loading" />
    </div>
    <div v-else-if="error" class="text-center text-red-500 py-4">{{ error }}</div>
    <div v-else>
      <h3 class="text-md font-medium mb-4">{{ t('integrations.imports.create.wizard.step1.currencies') }}</h3>
      <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
        <thead class="bg-gray-100 dark:bg-gray-700 text-xs uppercase">
          <tr>
            <th class="p-3">{{ t('integrations.show.currencies.labels.remoteCode') }}</th>
            <th class="p-3">{{ t('shared.labels.currency') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-for="currency in currencies" :key="currency.id" class="border-t">
            <td class="p-3">
              <div class="flex flex-col">
                <span>{{ currency.name }}</span>
                <span class="text-xs text-gray-500">
                  {{
                    currency.marketplaceName
                      ? `${currency.marketplaceName} - ${currency.remoteCode}`
                      : currency.remoteCode
                  }}
                </span>
              </div>
            </td>
            <td class="p-3 w-96">
              <FieldQuery
                v-model="currency.localInstance"
                :field="currencyField as QueryFormField"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
