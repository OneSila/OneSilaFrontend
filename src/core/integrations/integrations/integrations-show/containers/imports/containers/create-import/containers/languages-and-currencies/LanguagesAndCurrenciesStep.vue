<script setup lang="ts">
import { onMounted, ref, defineProps, computed, defineExpose, watch } from "vue";
import { useI18n } from "vue-i18n";
import { remoteLanguagesQuery, remoteCurrenciesQuery } from "../../../../../../../../../../shared/api/queries/salesChannels.js";
import {languagesQuery} from "../../../../../../../../../../shared/api/queries/languages.js";
import {currenciesQuery} from "../../../../../../../../../../shared/api/queries/currencies.js";

import {FieldType} from "../../../../../../../../../../shared/utils/constants";
import apolloClient from "../../../../../../../../../../../apollo-client";
import {
  FieldQuery
} from "../../../../../../../../../../shared/components/organisms/general-form/containers/form-fields/field-query";
import { currencyOnTheFlyConfig } from "../../../../../../../../../settings/currencies/configs";
import { DiscreteLoader } from "../../../../../../../../../../shared/components/atoms/discrete-loader";
import { RemoteLanguage, RemoteCurrency } from "../../../../configs";
import { QueryFormField } from "../../../../../../../../../../shared/components/organisms/general-form/formConfig";

const { t } = useI18n();

const props = defineProps<{
  salesChannelId: string;
}>();
const emit = defineEmits(['update:mappedData']);

const languages = ref<RemoteLanguage[]>([]);
const currencies = ref<RemoteCurrency[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const languageField = computed(() => ({
    type: FieldType.Query,
    name: "localInstance",
    label: t("shared.placeholders.language"),
    labelBy: "name",
    valueBy: "code",
    query: languagesQuery,
    dataKey: "languages",
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
      query: currenciesQuery,
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
        fetchPolicy: 'network-only',
      }),
      apolloClient.query({
        query: remoteCurrenciesQuery,
        variables: { filter: { salesChannel: { id: { exact: props.salesChannelId } } } },
        fetchPolicy: 'network-only',
      }),
    ]);

    languages.value = langRes.data.remoteLanguages.edges.map((edge: any) => ({
      id: edge.node.id,
      remoteCode: edge.node.remoteCode,
      localInstance: edge.node.localInstance || null,
    }));

    currencies.value = currencyRes.data.remoteCurrencies.edges.map((edge: any) => ({
      id: edge.node.id,
      remoteCode: edge.node.remoteCode,
      localInstance: edge.node.localInstance || null,
    }));

    if (!languages.value.length || !currencies.value.length) {
      error.value = t("integrations.imports.create.wizard.step1.noData");
    }
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
    languages.value.every((l) => l.localInstance) &&
    currencies.value.every((c) => c.localInstance)
  );
});

defineExpose({
  isValid,
  languages,
  currencies
});

watch([languages, currencies], () => {
  emit('update:mappedData', {
    languages: languages.value,
    currencies: currencies.value
  });
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
              <td class="p-3">{{ lang.remoteCode }}</td>
              <td class="p-3 w-96">
                <FieldQuery v-model="lang.localInstance" :field="languageField as QueryFormField" />
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
              <td class="p-3">{{ currency.remoteCode }}</td>
              <td class="p-3 w-96">
                <FieldQuery v-model="currency.localInstance.id" :field="currencyField as QueryFormField" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>
