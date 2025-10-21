<script setup lang="ts">
import { onMounted, ref, defineProps, computed, defineExpose } from "vue";
import { useI18n } from "vue-i18n";
import { remoteLanguagesQuery, remoteCurrenciesQuery } from "../../../../../../../../../../../shared/api/queries/salesChannels.js";
import {companyLanguagesQuery} from "../../../../../../../../../../../shared/api/queries/languages.js";
import {currenciesQuerySelector} from "../../../../../../../../../../../shared/api/queries/currencies.js";

import {FieldType} from "../../../../../../../../../../../shared/utils/constants";
import apolloClient from "../../../../../../../../../../../../apollo-client";
import {
  FieldQuery
} from "../../../../../../../../../../../shared/components/organisms/general-form/containers/form-fields/field-query";
import { currencyOnTheFlyConfig } from "../../../../../../../../../../settings/currencies/configs";
import { DiscreteLoader } from "../../../../../../../../../../../shared/components/atoms/discrete-loader";
import { RemoteLanguage, RemoteCurrency } from "../../../../../configs";
import { QueryFormField } from "../../../../../../../../../../../shared/components/organisms/general-form/formConfig";

const { t } = useI18n();

const props = defineProps<{
  salesChannelId: string;
}>();
const emit = defineEmits(['update:mappedData']);

const languages = ref<RemoteLanguage[]>([]);
const currencies = ref<RemoteCurrency[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const normalizeLanguageLocalInstance = (value: any): { id: string } | null => {
  if (!value) {
    return null;
  }

  if (typeof value === "object" && value !== null && typeof value.id === "string") {
    return { id: value.id };
  }

  if (typeof value === "string") {
    return { id: value };
  }

  return null;
};

const normalizeCurrencyLocalInstance = (value: any): { id: string; isoCode?: string } | null => {
  if (!value) {
    return null;
  }

  if (typeof value === "object" && value !== null && typeof value.id === "string") {
    return {
      id: value.id,
      ...(value.isoCode ? { isoCode: value.isoCode } : {}),
    };
  }

  if (typeof value === "string") {
    return { id: value };
  }

  return null;
};

const emitMappedData = () => {
  emit('update:mappedData', {
    languages: languages.value,
    currencies: currencies.value,
  });
};

const updateLanguageLocalInstance = (languageId: string, value: string | null) => {
  const language = languages.value.find(item => item.id === languageId);
  if (!language) {
    return;
  }

  language.localInstanceId = value;
  language.localInstance = value ? { id: value } : null;
  emitMappedData();
};

const updateCurrencyLocalInstance = (currencyId: string, value: string | null) => {
  const currency = currencies.value.find(item => item.id === currencyId);
  if (!currency) {
    return;
  }

  const previousIsoCode = currency.localInstance?.isoCode;
  const keepIsoCode = value && currency.localInstance?.id === value ? previousIsoCode : undefined;

  currency.localInstanceId = value;
  currency.localInstance = value
    ? {
        id: value,
        ...(keepIsoCode ? { isoCode: keepIsoCode } : {}),
      }
    : null;

  emitMappedData();
};

const updateCurrencyLabel = (currencyId: string, payload: { id: string; label: string }) => {
  if (!payload?.id || payload.id === 'add-entry') {
    return;
  }

  const currency = currencies.value.find(item => item.id === currencyId);
  if (!currency) {
    return;
  }

  if (!currency.localInstance || currency.localInstance.id !== payload.id) {
    currency.localInstance = { id: payload.id };
  }

  currency.localInstance.isoCode = payload.label;
  emitMappedData();
};

const languageField = computed(() => ({
    type: FieldType.Query,
    name: "localInstance",
    label: t("shared.placeholders.language"),
    labelBy: "name",
    valueBy: "code",
    query: companyLanguagesQuery,
    dataKey: "companyLanguages",
    isEdge: false,
    multiple: false,
    filterable: true,
}));

const currencyField = computed(() => ({
      type: FieldType.Query,
      name: 'localInstance',
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
      createOnFlyConfig: currencyOnTheFlyConfig(t)
    }));

const fetchData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const [langRes, currencyRes] = await Promise.all([
      apolloClient.query({
        query: remoteLanguagesQuery,
        variables: { filter: { salesChannel: { id: { exact: props.salesChannelId } } } },
        fetchPolicy: 'cache-first',
      }),
      apolloClient.query({
        query: remoteCurrenciesQuery,
        variables: { filter: { salesChannel: { id: { exact: props.salesChannelId } } } },
        fetchPolicy: 'cache-first',
      }),
    ]);

    languages.value = langRes.data.remoteLanguages.edges.map((edge: any) => {
      const localInstance = normalizeLanguageLocalInstance(edge.node.localInstance);
      return {
        id: edge.node.id,
        remoteCode: edge.node.remoteCode,
        name: edge.node.name,
        localInstance,
        localInstanceId: localInstance?.id ?? null,
      };
    });

    currencies.value = currencyRes.data.remoteCurrencies.edges.map((edge: any) => {
      const localInstance = normalizeCurrencyLocalInstance(edge.node.localInstance);
      return {
        id: edge.node.id,
        remoteCode: edge.node.remoteCode,
        name: edge.node.name,
        localInstance,
        localInstanceId: localInstance?.id ?? null,
      };
    });

    if (!languages.value.length || !currencies.value.length) {
      error.value = t("integrations.imports.create.wizard.step1.noData");
    }
    emitMappedData();
  } catch (err) {
    console.error(err);
    error.value = t("integrations.imports.create.wizard.step1.fetchError");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

const isValid = computed(() => {
  return (
    languages.value.length > 0 &&
    currencies.value.length > 0 &&
    languages.value.every((l) => l.localInstance?.id) &&
    currencies.value.every((c) => c.localInstance?.id)
  );
});

defineExpose({
  isValid,
  languages,
  currencies
});

</script>

<template>
  <div class="flex flex-col gap-6 min-h-96">

    <h1 class="text-2xl text-center mb-2">{{ t('integrations.imports.create.wizard.step1.content') }}</h1>
    <hr/>

    <div v-if="loading" class="text-center py-4">
      <DiscreteLoader :loading="loading" />
    </div>
    <div v-else-if="error" class="text-center text-red-500 py-4">{{ error }}</div>
    <div v-else class="flex flex-col gap-8">

      <div>
        <h3 class="text-md font-medium mb-4">{{ t("integrations.imports.create.wizard.step1.languages") }}</h3>
        <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
          <thead class="bg-gray-100 dark:bg-gray-700 text-xs uppercase">
            <tr>
              <th class="p-3">{{ t('integrations.show.languages.labels.remoteCode') }}</th>
              <th class="p-3">{{ t('shared.labels.language') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="lang in languages" :key="lang.id" class="border-t">
              <td class="p-3">{{ lang.name }}</td>
              <td class="p-3 w-96">
                <FieldQuery
                  :model-value="lang.localInstanceId ?? null"
                  :field="languageField as QueryFormField"
                  @update:modelValue="value => updateLanguageLocalInstance(lang.id, value)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <FlexCell class="py-8 px-96"><hr /></FlexCell>

      <div>
        <h3 class="text-md font-medium mb-4">{{ t("integrations.imports.create.wizard.step1.currencies") }}</h3>
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
                  :model-value="currency.localInstanceId ?? null"
                  :field="currencyField as QueryFormField"
                  @update:modelValue="value => updateCurrencyLocalInstance(currency.id, value)"
                  @label-selected="payload => updateCurrencyLabel(currency.id, payload)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>
