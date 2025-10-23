<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { Wizard } from "../../../../../../../../../../../shared/components/molecules/wizard";
import { OptionSelector } from "../../../../../../../../../../../shared/components/molecules/option-selector";
import { Icon } from "../../../../../../../../../../../shared/components/atoms/icon";
import apolloClient from "../../../../../../../../../../../../apollo-client";
import { Toast } from "../../../../../../../../../../../shared/modules/toast";
import {
  bulkUpdateRemoteCurrenciesMutation,
  bulkUpdateRemoteLanguagesMutation,
  createEbayImportProcessMutation,
} from "../../../../../../../../../../../shared/api/mutations/salesChannels";
import { ebayImportProcessesQuery } from "../../../../../../../../../../../shared/api/queries/salesChannels";
import { processGraphQLErrors } from "../../../../../../../../../../../shared/utils";
import type { RemoteCurrency, RemoteLanguage } from "../../../../../configs";
import EbayLanguagesStep from "./components/EbayLanguagesStep.vue";
import EbayCurrenciesStep from "./components/EbayCurrenciesStep.vue";

const props = defineProps<{ integrationId: string; type: string }>();

const { t } = useI18n();
const router = useRouter();

const importType = ref("schema");
const hasFinishedSchema = ref(false);
const loading = ref(false);
const step = ref(0);
const finishLoading = ref(false);
const currentFinishStep = ref<number | null>(null);

const mappedLanguages = ref<RemoteLanguage[]>([]);
const mappedCurrencies = ref<RemoteCurrency[]>([]);

const typeChoices = computed(() => [
  { name: "schema" },
  {
    name: "products",
    disabled: !hasFinishedSchema.value,
    hideDisabledBanner: true,
  },
]);

const wizardSteps = computed(() => [
  { title: t("integrations.imports.create.ebay.wizard.steps.type"), name: "selectType" },
  { title: t("integrations.imports.create.ebay.wizard.steps.languages"), name: "mapLanguages" },
  { title: t("integrations.imports.create.ebay.wizard.steps.currencies"), name: "mapCurrencies" },
]);

const allowNextStep = computed(() => {
  if (step.value === 0) {
    return true;
  }

  if (step.value === 1) {
    return mappedLanguages.value.some((language) => Boolean(language.localInstance));
  }

  if (step.value === 2) {
    return mappedCurrencies.value.some((currency) => Boolean(currency.localInstance?.id));
  }

  return true;
});

const fetchImports = async () => {
  loading.value = true;

  try {
    const { data } = await apolloClient.query({
      query: ebayImportProcessesQuery,
      variables: {
        filter: {
          salesChannel: { id: { exact: props.integrationId } },
          type: { exact: "schema" },
          status: { exact: "success" },
        },
      },
      fetchPolicy: "cache-first",
    });

    const edges = data?.ebayImportProcesses?.edges || [];
    hasFinishedSchema.value = edges.length > 0;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchImports);

const updateStep = (value: number) => {
  step.value = value;
};

const updateLanguages = (languages: RemoteLanguage[]) => {
  mappedLanguages.value = languages;
};

const updateCurrencies = (currencies: RemoteCurrency[]) => {
  mappedCurrencies.value = currencies;
};

const bulkUpdateLanguages = async () => {
  const data = mappedLanguages.value
    .filter((language) => Boolean(language.localInstance))
    .map((language) => ({
      id: language.id,
      remoteCode: language.remoteCode,
      localInstance: typeof language.localInstance === "string"
        ? language.localInstance
        : language.localInstance?.id ?? language.localInstanceId ?? null,
    }));

  await apolloClient.mutate({
    mutation: bulkUpdateRemoteLanguagesMutation,
    variables: { data },
  });
};

const bulkUpdateCurrencies = async () => {
  const data = mappedCurrencies.value
    .filter((currency) => Boolean(currency.localInstance?.id))
    .map((currency) => {
      const localInstanceId = currency.localInstance?.id ?? currency.localInstanceId ?? null;

      return {
        id: currency.id,
        remoteCode: currency.remoteCode,
        localInstance: localInstanceId ? { id: localInstanceId } : null,
      };
    });

  await apolloClient.mutate({
    mutation: bulkUpdateRemoteCurrenciesMutation,
    variables: { data },
  });
};

const createImport = async () => {
  await apolloClient.mutate({
    mutation: createEbayImportProcessMutation,
    variables: {
      data: {
        salesChannel: { id: props.integrationId },
        type: importType.value,
        status: "pending",
      },
    },
  });
};

const steps = [
  { key: "languages", action: bulkUpdateLanguages },
  { key: "currencies", action: bulkUpdateCurrencies },
  { key: "import", action: createImport },
];

const currentFinishStepName = computed(() =>
  currentFinishStep.value !== null
    ? t(`integrations.imports.create.wizard.finish.steps.${steps[currentFinishStep.value].key}`)
    : ""
);

const handleFinish = async () => {
  finishLoading.value = true;
  currentFinishStep.value = null;

  try {
    for (let index = 0; index < steps.length; index += 1) {
      currentFinishStep.value = index;
      await steps[index].action();
    }

    Toast.success(t("integrations.imports.create.success"));
    router.push({
      name: "integrations.integrations.show",
      params: { id: props.integrationId, type: props.type },
      query: { tab: "imports" },
    });
  } catch (error) {
    console.error(`Error at step "${currentFinishStepName.value}":`, error);
    const validationErrors = processGraphQLErrors(error, t);

    if (validationErrors["__all__"]) {
      Toast.error(validationErrors["__all__"]);
    } else {
      Toast.error(
        t("integrations.imports.create.wizard.finish.errorMessage", {
          step: currentFinishStepName.value,
        }),
      );
    }
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

    <Wizard
      :steps="wizardSteps"
      :allow-next-step="allowNextStep"
      :show-buttons="true"
      @on-finish="handleFinish"
      @update-current-step="updateStep"
    >
      <template #selectType>
        <div class="flex flex-col gap-6">
          <OptionSelector v-model="importType" :choices="typeChoices">
            <template #schema>
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <h3 class="text-lg font-bold">
                    {{ t('integrations.imports.types.schema') }}
                  </h3>
                </div>
                <p class="text-sm text-gray-500">
                  {{ t('integrations.imports.types.schemaDescription') }}
                </p>
              </div>
            </template>
            <template #products>
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <h3 class="text-lg font-bold">
                    {{ t('integrations.imports.types.products') }}
                  </h3>
                </div>
                <p class="text-sm text-gray-500">
                  {{ t('integrations.imports.types.productsDescription') }}
                </p>
                <div
                  v-if="!hasFinishedSchema"
                  class="text-sm text-gray-400 flex items-center gap-1"
                >
                  <Icon name="exclamation-circle" class="text-gray-400" />
                  <span>{{ t('integrations.imports.types.schemaRequired') }}</span>
                </div>
              </div>
            </template>
          </OptionSelector>
        </div>
      </template>

      <template #mapLanguages>
        <EbayLanguagesStep
          :sales-channel-id="integrationId"
          @update:languages="updateLanguages"
        />
      </template>

      <template #mapCurrencies>
        <EbayCurrenciesStep
          :sales-channel-id="integrationId"
          @update:currencies="updateCurrencies"
        />
      </template>
    </Wizard>
  </div>
</template>
