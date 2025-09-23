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
import { remoteCurrenciesQuery } from "../../../../../../../../../../../../shared/api/queries/salesChannels.js";
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
    const { data } = await apolloClient.query({
      query: remoteCurrenciesQuery,
      variables: {
        filter: { salesChannel: { id: { exact: props.salesChannelId } } },
      },
      fetchPolicy: "cache-first",
    });

    currencies.value = data?.remoteCurrencies?.edges?.map((edge: any) => ({
      id: edge.node.id,
      remoteCode: edge.node.remoteCode,
      name: edge.node.name,
      localInstance: edge.node.localInstance ? edge.node.localInstance.id : null,
    })) || [];

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
  currencies.value.length > 0 && currencies.value.every((currency) => Boolean(currency.localInstance))
);

defineExpose({
  isValid,
  currencies,
});

watch(
  currencies,
  () => {
    emit("update:currencies", currencies.value);
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
            <td class="p-3">{{ currency.name }}</td>
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
