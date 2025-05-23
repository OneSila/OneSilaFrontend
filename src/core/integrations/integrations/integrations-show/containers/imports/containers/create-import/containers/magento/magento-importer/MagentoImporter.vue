<script setup lang="ts">


import {Wizard} from "../../../../../../../../../../../shared/components/molecules/wizard";
import {DefaultRuleStep} from "../default-rule";
import {AttributesStep} from "../attributes";
import {LanguagesAndCurrenciesStep} from "../../general/languages-and-currencies";
import {computed, onMounted, ref} from "vue";
import {
  EanCodeAttribute,
  IntegrationData,
  MagentoAttributeSet,
  RemoteAttribute, RemoteCurrency,
  RemoteLanguage
} from "../../../../../configs";
import apolloClient from "../../../../../../../../../../../../apollo-client";
import {
  getMagentoChannelQuery, magentoRemoteAttributeSetsQuery,
  magentoRemoteAttributesQuery
} from "../../../../../../../../../../../shared/api/queries/salesChannels";
import {
  bulkUpdateRemoteCurrenciesMutation,
  bulkUpdateRemoteLanguagesMutation,
  createImportPropertiesMutation,
  createRemoteEanCodeAttributeMutation,
  createSalesChannelImportMutation, updateMagentoSalesChannelMutation, updateSalesChannelImportMutation
} from "../../../../../../../../../../../shared/api/mutations/salesChannels";
import {Toast} from "../../../../../../../../../../../shared/modules/toast";
import {useI18n} from "vue-i18n";
import {useRoute, useRouter} from "vue-router";

const props = defineProps<{ integrationId: string; type: string }>();


const salesChannelId = ref(null);
const integrationData = ref<IntegrationData | null>(null);
const attributes = ref<RemoteAttribute[]>([]);
const step = ref(0);
const loading = ref(false);
const selectedAttributes = ref<string[]>([]);
const attributeSets = ref<MagentoAttributeSet[]>([]);
const finishLoading = ref(false);
const currentFinishStep = ref<number | null>(null);
const importProcessId = ref<string | null>(null);
const importProcessImportPtr = ref<string | null>(null);

const eanCodeAttribute = ref<EanCodeAttribute | null>(null);
const selectedAttributeSetId = ref<string | null>(null);

const initialEanCodeAttribute = ref<string | null>(null);
const initialAttributeSetId = ref<number | null>(null);

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const mappedData = ref<{
  languages: RemoteLanguage[];
  currencies: RemoteCurrency[];
}>({
  languages: [],
  currencies: [],
});

const allowNextStep = computed(() => {
  if (step.value === 0) {
    const langsValid = mappedData.value.languages.length > 0 &&
      mappedData.value.languages.every((l) => l.localInstance);
    const currenciesValid = mappedData.value.currencies.length > 0 &&
      mappedData.value.currencies.every((c) => c.localInstance);
    return langsValid && currenciesValid;
  }
  if (step.value === 1) {
    const hasSelectedAttributes = selectedAttributes.value.length > 0;
    const eanCodeValid = !integrationData.value?.syncEanCodes || eanCodeAttribute.value !== null;
    return hasSelectedAttributes && eanCodeValid;
  }

  if (step.value === 2) {
  return selectedAttributeSetId.value !== null;
}

  return true;
});


const updateMappedData = (data) => {
  mappedData.value = data;
};

const wizardSteps = [
  { title: t('integrations.imports.create.wizard.step1.title'), name: 'generalStep' },
  { title: t('integrations.imports.create.wizard.step2.title'), name: 'attributesStep' },
  { title: t('integrations.imports.create.wizard.step3.title'), name: 'defaultRuleStep' },
];

const updateStep = (val) => {
  step.value = val;
};

const fetchIntegrationData = async () => {
  try {
    loading.value = true;
    const { data } = await apolloClient.query({
      query: getMagentoChannelQuery,
      variables: { id: props.integrationId },
      fetchPolicy: 'network-only'
    });
    const { __typename, integrationPtr, saleschannelPtr,  ...cleanData } = data['magentoChannel'];
    integrationData.value = cleanData;

    initialEanCodeAttribute.value = cleanData.eanCodeAttribute || null;
    initialAttributeSetId.value = cleanData.attributeSetSkeletonId || null;

    salesChannelId.value = saleschannelPtr.id
  } catch (error) {
    console.error("Error fetching integration data:", error);
  } finally {
     loading.value = false;
  }
};

const fetchAttributesData = async () => {
  try {
    const { data } = await apolloClient.query({
      query: magentoRemoteAttributesQuery,
      variables: { salesChannelId: props.integrationId },
      fetchPolicy: 'network-only',
    });
    attributes.value = data.magentoRemoteAttributes;
  } catch (err) {
    console.error(err);
  }
};

const fetchAttributeSetsData = async () => {
  try {
    const { data } = await apolloClient.query({
      query: magentoRemoteAttributeSetsQuery,
      variables: { salesChannelId: props.integrationId },
      fetchPolicy: 'network-only',
    });
    attributeSets.value = data.magentoRemoteAttributeSets;
  } catch (err) {
    console.error(err);
  }
};

onMounted(async () => {
  await fetchIntegrationData();
  await fetchAttributesData();
  await fetchAttributeSetsData();
});


const bulkUpdateRemoteLanguages = async () => {
  try {
    const data = mappedData.value.languages.map((language) => ({
      id: language.id,
      remoteCode: language.remoteCode,
      localInstance: language.localInstance,
    }));

    const { data: result } = await apolloClient.mutate({
      mutation: bulkUpdateRemoteLanguagesMutation,
      variables: { data },
    });

  } catch (err) {
    console.error('Error updating languages', err);
    throw err;
  }
};


const bulkUpdateRemoteCurrencies = async () => {
  try {
    const data = mappedData.value.currencies.map((currency) => ({
      id: currency.id,
      remoteCode: currency.remoteCode,
      localInstance: { id: currency.localInstance },
    }));

    const { data: result } = await apolloClient.mutate({
      mutation: bulkUpdateRemoteCurrenciesMutation,
      variables: { data },
    });

  } catch (err) {
    console.error('Error updating currencies', err);
    throw err;
  }
};


const createImport = async () => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: createSalesChannelImportMutation,
      variables: {
        data: {
          salesChannel: { id: salesChannelId.value },
        },
      },
    });

    importProcessId.value = data.createSalesImportProcess.id;
    importProcessImportPtr.value = data.createSalesImportProcess.importId;
  } catch (err) {
    console.error('Error creating import', err);
    throw err;
  }
};

const createAttributeImport = async () => {
  try {
    if (!importProcessId.value) {
      throw new Error('Import process ID not available');
    }


    const importPropertiesPayload = attributes.value
      .filter((attribute) => {
        const isSelected = selectedAttributes.value.includes(attribute.id);
        const isNotEanCode = !eanCodeAttribute.value || attribute.attributeCode !== eanCodeAttribute.value.attributeCode;
        return isSelected && isNotEanCode;
      })
      .map((attribute) => ({
        importProcess: { id: importProcessImportPtr.value },
        rawData: JSON.parse(attribute.data),
      }));

    const { data } = await apolloClient.mutate({
      mutation: createImportPropertiesMutation,
      variables: {
        data: importPropertiesPayload,
      },
    });

  } catch (err) {
    throw err;
  }
};

const createEanCodeAttributeIfNeeded = async () => {
  try {
    if (!eanCodeAttribute.value?.isNew) {
      return;
    }

    const { data } = await apolloClient.mutate({
      mutation: createRemoteEanCodeAttributeMutation,
      variables: {
        data: {
            name: eanCodeAttribute.value.name,
            attributeCode: eanCodeAttribute.value.attributeCode,
            salesChannel: { id: props.integrationId },
        },
      },
    });

    eanCodeAttribute.value.id = data.createRemoteEanCodeAttribute.id;
  } catch (err) {
    console.error('Error creating EAN code attribute', err);
    throw err;
  }
};


const updateSalesChannelIfNeeded = async () => {

  const shouldUpdateEan = eanCodeAttribute.value?.attributeCode !== initialEanCodeAttribute.value;
  const shouldUpdateRule = selectedAttributeSetId.value != initialAttributeSetId.value;

  if (!shouldUpdateEan && !shouldUpdateRule) {
    return;
  }

  try {
    const { data } = await apolloClient.mutate({
      mutation: updateMagentoSalesChannelMutation,
      variables: {
        data: {
          id: props.integrationId,
          ...(shouldUpdateEan && { eanCodeAttribute: eanCodeAttribute.value?.attributeCode }),
          ...(shouldUpdateRule && { attributeSetSkeletonId: parseInt(selectedAttributeSetId.value as string) }),
        },
      },
    });

  } catch (err) {
    console.error('Error updating sales channel', err);
    throw err;
  }
};

const startImportProcess = async () => {
  try {
    if (!importProcessId.value) {
      throw new Error('Import process ID not available');
    }

    const { data } = await apolloClient.mutate({
      mutation: updateSalesChannelImportMutation,
      variables: {
        data: {
          id: importProcessId.value,
          status: 'pending',
        },
      },
    });

  } catch (err) {
    throw err;
  }
};

const steps = [
  { key: 'languages', action: bulkUpdateRemoteLanguages },
  { key: 'currencies', action: bulkUpdateRemoteCurrencies },
  { key: 'import', action: createImport },
  { key: 'attributeImport', action: createAttributeImport },
  { key: 'eanCode', action: createEanCodeAttributeIfNeeded },
  { key: 'salesChannel', action: updateSalesChannelIfNeeded },
  { key: 'startProcess', action: startImportProcess }
];

const currentFinishStepName = computed(() =>
  currentFinishStep.value !== null ? t(`integrations.imports.create.wizard.finish.steps.${steps[currentFinishStep.value].key}`) : ''
);

const handleFinish = async () => {
  finishLoading.value = true;
  currentFinishStep.value = null;

  try {
    for (let i = 0; i < steps.length; i++) {
      currentFinishStep.value = i;
      await steps[i].action();
    }

    Toast.success(t('integrations.imports.create.wizard.finish.successMessage'));
    router.push({ name: 'integrations.integrations.show', params: { id: props.integrationId, type: props.type }, query: { tab: 'imports' } });
  } catch (err) {
    console.error(`Error at step "${currentFinishStepName.value}":`, err);
    Toast.error(
      t('integrations.imports.create.wizard.finish.errorMessage', {
        step: currentFinishStepName.value
      })
    );
  } finally {
    finishLoading.value = false;
    currentFinishStep.value = null;
  }
};



</script>

<template>
  <div>
    <div v-if="loading" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div class="text-center">
          <svg class="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        </div>
    </div>

    <div v-if="finishLoading" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black opacity-50"></div>
        <div class="relative bg-white dark:bg-[#191e3a] rounded-lg p-6 w-96 shadow-lg z-50 flex flex-col items-center gap-4">
          <h2 class="text-lg font-semibold text-center text-dark dark:text-white-light">
            {{ t('integrations.imports.create.wizard.finish.title') }}
          </h2>
          <p class="text-sm text-gray-500 dark:text-white-light text-center">{{ currentFinishStepName }}</p>
          <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              class="h-full bg-primary transition-all"
              :style="{ width: ((currentFinishStep !== null ? (currentFinishStep + 1) / steps.length : 0) * 100) + '%' }"
            ></div>
          </div>
        </div>
    </div>

    <Wizard :steps="wizardSteps" :allow-next-step="allowNextStep" :show-buttons="true" @on-finish="handleFinish" @update-current-step="updateStep">
        <template #generalStep>
          <LanguagesAndCurrenciesStep v-if="salesChannelId" :sales-channel-id="salesChannelId" @update:mappedData="updateMappedData" />
        </template>

        <template #attributesStep>
          <AttributesStep
             v-if="salesChannelId && integrationData"
            :attributes="attributes"
            :sales-channel-id="salesChannelId"
            :sync-ean-codes="integrationData.syncEanCodes"
             :initial-ean-code="initialEanCodeAttribute"
            @update:selectedAttributes="(data) => selectedAttributes = data"
            @update:eanCodeAttribute="(data) => eanCodeAttribute = data"
          />
        </template>

        <template #defaultRuleStep>
          <DefaultRuleStep
            v-if="salesChannelId"
            :attribute-sets="attributeSets"
            :initial-selected-attribute-set="initialAttributeSetId"
            @update:selectedAttributeSet="(data) => selectedAttributeSetId = data"
          />
        </template>
      </Wizard>
  </div>
</template>
