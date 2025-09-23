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
import { remoteLanguagesQuery } from "../../../../../../../../../../../../shared/api/queries/salesChannels.js";
import { companyLanguagesQuery } from "../../../../../../../../../../../../shared/api/queries/languages.js";
import type { RemoteLanguage } from "../../../../../../configs";

const props = defineProps<{
  salesChannelId: string;
}>();

const emit = defineEmits<{
  (e: "update:languages", value: RemoteLanguage[]): void;
}>();

const { t } = useI18n();

const languages = ref<RemoteLanguage[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

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

const fetchLanguages = async () => {
  loading.value = true;
  error.value = null;

  try {
    const { data } = await apolloClient.query({
      query: remoteLanguagesQuery,
      variables: {
        filter: { salesChannel: { id: { exact: props.salesChannelId } } },
      },
      fetchPolicy: "cache-first",
    });

    languages.value = data?.remoteLanguages?.edges?.map((edge: any) => ({
      id: edge.node.id,
      remoteCode: edge.node.remoteCode,
      name: edge.node.name,
      localInstance: edge.node.localInstance || null,
    })) || [];

    if (!languages.value.length) {
      error.value = t("integrations.imports.create.ebay.languages.noData");
    }
  } catch (err) {
    console.error(err);
    error.value = t("integrations.imports.create.ebay.languages.fetchError");
  } finally {
    loading.value = false;
  }
};

onMounted(fetchLanguages);

const isValid = computed(() =>
  languages.value.length > 0 && languages.value.every((language) => Boolean(language.localInstance))
);

defineExpose({
  isValid,
  languages,
});

watch(
  languages,
  () => {
    emit("update:languages", languages.value);
  },
  { deep: true },
);
</script>

<template>
  <div class="flex flex-col gap-6 min-h-96">
    <div class="text-center">
      <h1 class="text-2xl mb-2">{{ t('integrations.imports.create.ebay.languages.title') }}</h1>
      <p class="text-sm text-gray-500">{{ t('integrations.imports.create.ebay.languages.description') }}</p>
    </div>
    <hr />
    <div v-if="loading" class="text-center py-4">
      <DiscreteLoader :loading="loading" />
    </div>
    <div v-else-if="error" class="text-center text-red-500 py-4">{{ error }}</div>
    <div v-else>
      <h3 class="text-md font-medium mb-4">{{ t('integrations.imports.create.wizard.step1.languages') }}</h3>
      <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
        <thead class="bg-gray-100 dark:bg-gray-700 text-xs uppercase">
          <tr>
            <th class="p-3">{{ t('integrations.show.languages.labels.remoteCode') }}</th>
            <th class="p-3">{{ t('shared.labels.language') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-for="language in languages" :key="language.id" class="border-t">
            <td class="p-3">{{ language.name }}</td>
            <td class="p-3 w-96">
              <FieldQuery
                v-model="language.localInstance"
                :field="languageField as QueryFormField"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
