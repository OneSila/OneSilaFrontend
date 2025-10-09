<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Accordion } from '../../../../../../../../../shared/components/atoms/accordion';
import { DiscreteLoader } from '../../../../../../../../../shared/components/atoms/discrete-loader';
import { FieldQuery } from '../../../../../../../../../shared/components/organisms/general-form/containers/form-fields/field-query';
import type { QueryFormField } from '../../../../../../../../../shared/components/organisms/general-form/formConfig';
import { FieldType } from '../../../../../../../../../shared/utils/constants';
import { Toast } from '../../../../../../../../../shared/modules/toast';
import { processGraphQLErrors } from '../../../../../../../../../shared/utils';
import { propertySelectValuesQuerySelector } from '../../../../../../../../../shared/api/queries/properties.js';
import { ebayInternalPropertyOptionsQuery } from '../../../../../../../../../shared/api/queries/salesChannels.js';
import { updateEbayInternalPropertyOptionMutation } from '../../../../../../../../../shared/api/mutations/salesChannels.js';
import { selectValueOnTheFlyConfig } from '../../../../../../../../properties/property-select-values/configs';
import apolloClient from '../../../../../../../../../../apollo-client';

type OptionNode = {
  id: string;
  value: string;
  label: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  localInstance: { id: string; fullValueName: string } | null;
};

const props = defineProps<{
  propertyId: string;
  localPropertyId: string;
}>();

const { t } = useI18n();

const loading = ref(false);
const errorMessage = ref<string | null>(null);
const options = ref<OptionNode[]>([]);
const optionMappings = reactive<Record<string, string | null>>({});
const savingStates = reactive<Record<string, boolean>>({});
let fetchToken = 0;

const accordionItems = computed(() => [
  { name: 'options', label: t('integrations.show.ebay.internalProperties.options.accordionTitle') },
]);

const hasOptions = computed(() => options.value.length > 0);

const clearState = () => {
  options.value = [];
  errorMessage.value = null;
  Object.keys(optionMappings).forEach((key) => delete optionMappings[key]);
  Object.keys(savingStates).forEach((key) => delete savingStates[key]);
};

const syncMappings = (fetched: OptionNode[]) => {
  const presentIds = new Set(fetched.map((item) => item.id));
  Object.keys(optionMappings).forEach((key) => {
    if (!presentIds.has(key)) {
      delete optionMappings[key];
    }
  });
  Object.keys(savingStates).forEach((key) => {
    if (!presentIds.has(key)) {
      delete savingStates[key];
    }
  });
  fetched.forEach((option) => {
    optionMappings[option.id] = option.localInstance?.id ?? null;
  });
};

const fetchOptions = async () => {
  if (!props.propertyId || !props.localPropertyId) {
    clearState();
    return;
  }

  const currentToken = ++fetchToken;
  loading.value = true;
  errorMessage.value = null;

  try {
    const { data } = await apolloClient.query({
      query: ebayInternalPropertyOptionsQuery,
      variables: {
        first: 200,
        filter: {
          internalProperty: { id: { exact: props.propertyId } },
          isActive: { exact: true },
        },
      },
      fetchPolicy: 'cache-first',
    });

    if (currentToken !== fetchToken) {
      return;
    }

    const edges = data?.ebayInternalPropertyOptions?.edges ?? [];
    const fetched: OptionNode[] = edges.map((edge: any) => edge.node);
    options.value = fetched;
    syncMappings(fetched);
  } catch (error) {
    if (currentToken !== fetchToken) {
      return;
    }
    errorMessage.value = t('integrations.show.ebay.internalProperties.options.loadError');
  } finally {
    if (currentToken === fetchToken) {
      loading.value = false;
    }
  }
};

watch(
  () => [props.propertyId, props.localPropertyId],
  ([propertyId, localPropertyId]) => {
    if (propertyId && localPropertyId) {
      fetchOptions();
    } else {
      clearState();
    }
  },
  { immediate: true },
);

const buildField = (option: OptionNode): QueryFormField => ({
  type: FieldType.Query,
  name: `localInstance__${option.id}`,
  labelBy: 'fullValueName',
  valueBy: 'id',
  query: propertySelectValuesQuerySelector,
  queryVariables: { filter: { property: { id: { exact: props.localPropertyId } } } },
  dataKey: 'propertySelectValues',
  isEdge: true,
  multiple: false,
  filterable: true,
  removable: true,
  optional: true,
  formMapIdentifier: 'id',
  disabled: savingStates[option.id] || loading.value,
  createOnFlyConfig: selectValueOnTheFlyConfig(t, props.localPropertyId, option.label),
});

const handleOptionUpdate = async (option: OptionNode, rawValue: string | null | undefined) => {
  const normalizedValue = rawValue ?? null;
  const previous = optionMappings[option.id] ?? null;

  if (normalizedValue === previous) {
    return;
  }

  optionMappings[option.id] = normalizedValue;
  savingStates[option.id] = true;

  try {
    const variables = normalizedValue
      ? { data: { id: option.id, localInstance: { id: normalizedValue } } }
      : { data: { id: option.id, localInstance: null } };

    const { data } = await apolloClient.mutate({
      mutation: updateEbayInternalPropertyOptionMutation,
      variables,
    });

    const updated = data?.updateEbayInternalPropertyOption;
    const localInstance = updated?.localInstance ?? null;
    const optionIndex = options.value.findIndex((item) => item.id === option.id);
    if (optionIndex !== -1) {
      options.value[optionIndex] = {
        ...options.value[optionIndex],
        localInstance,
      };
    }
    optionMappings[option.id] = localInstance?.id ?? null;
    Toast.success(t('integrations.show.ebay.internalProperties.options.updateSuccess'));
  } catch (error) {
    optionMappings[option.id] = previous;
    const validationErrors = processGraphQLErrors(error, t);
    if (validationErrors['__all__']) {
      Toast.error(validationErrors['__all__']);
    } else {
      Toast.error(t('integrations.show.ebay.internalProperties.options.updateError'));
    }
  } finally {
    savingStates[option.id] = false;
  }
};
</script>

<template>
  <Accordion :items="accordionItems" default-active="options">
    <template #options>
      <div class="space-y-4">
        <div v-if="loading" class="flex justify-center py-6">
          <DiscreteLoader :loading="loading" />
        </div>
        <div v-else-if="errorMessage" class="text-sm text-red-600">
          {{ errorMessage }}
        </div>
        <div v-else-if="!hasOptions" class="text-sm text-gray-500">
          {{ t('integrations.show.ebay.internalProperties.options.empty') }}
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
            <thead class="bg-gray-100">
              <tr>
                <th class="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  {{ t('integrations.show.ebay.internalProperties.options.remoteValue') }}
                </th>
                <th class="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  {{ t('integrations.show.ebay.internalProperties.options.description') }}
                </th>
                <th class="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  {{ t('integrations.show.ebay.internalProperties.options.localValue') }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr v-for="option in options" :key="option.id" class="align-top">
                <td class="p-3">
                  <div class="flex flex-col gap-1">
                    <span class="font-medium text-gray-900">{{ option.label }}</span>
                    <span class="text-xs text-gray-500">{{ option.value }}</span>
                  </div>
                </td>
                <td class="p-3">
                  <span v-if="option.description" class="text-sm text-gray-700 whitespace-pre-line">
                    {{ option.description }}
                  </span>
                  <span v-else class="text-sm text-gray-400">
                    {{ t('integrations.show.ebay.internalProperties.options.noDescription') }}
                  </span>
                </td>
                <td class="p-3 w-96">
                  <FieldQuery
                    :model-value="optionMappings[option.id]"
                    :field="buildField(option)"
                    @update:model-value="value => handleOptionUpdate(option, value as string | null)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </Accordion>
</template>
