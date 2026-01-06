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
import { propertySelectValuesQuerySelectorValueOnly } from '../../../../../../../../../shared/api/queries/properties.js';
import { sheinInternalPropertyOptionsQuery } from '../../../../../../../../../shared/api/queries/salesChannels.js';
import { updateSheinInternalPropertyOptionMutation } from '../../../../../../../../../shared/api/mutations/salesChannels.js';
import { selectValueOnTheFlyConfig } from '../../../../../../../../properties/property-select-values/configs';
import apolloClient from '../../../../../../../../../../apollo-client';

type OptionNode = {
  id: string;
  value: string;
  label: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  localInstance: { id: string; value: string } | null;
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
  { name: 'options', label: t('integrations.show.shein.internalProperties.options.accordionTitle') },
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
      query: sheinInternalPropertyOptionsQuery,
      variables: {
        first: 100,
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

    const edges = data?.sheinInternalPropertyOptions?.edges ?? [];
    const fetched: OptionNode[] = edges.map((edge: any) => edge.node);
    options.value = fetched;
    syncMappings(fetched);
  } catch (error) {
    if (currentToken !== fetchToken) {
      return;
    }
    errorMessage.value = t('integrations.show.shein.internalProperties.options.loadError');
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
  labelBy: 'value',
  valueBy: 'id',
  query: propertySelectValuesQuerySelectorValueOnly,
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
      mutation: updateSheinInternalPropertyOptionMutation,
      variables,
    });

    const updated = data?.updateSheinInternalPropertyOption;
    const localInstance = updated?.localInstance ?? null;
    const optionIndex = options.value.findIndex((item) => item.id === option.id);
    if (optionIndex !== -1) {
      options.value[optionIndex] = {
        ...options.value[optionIndex],
        localInstance,
      };
    }
    optionMappings[option.id] = localInstance?.id ?? null;
    Toast.success(t('integrations.show.shein.internalProperties.options.updateSuccess'));
  } catch (error) {
    optionMappings[option.id] = previous;
    const validationErrors = processGraphQLErrors(error, t);
    if (validationErrors['__all__']) {
      Toast.error(validationErrors['__all__']);
    } else {
      Toast.error(t('integrations.show.shein.internalProperties.options.updateError'));
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
          {{ t('integrations.show.shein.internalProperties.options.empty') }}
        </div>
        <div v-else class="max-h-96 overflow-y-auto">
          <div class="space-y-4">
          <div
            v-for="option in options"
            :key="option.id"
            class="border border-gray-200 rounded-md p-4 space-y-2 bg-white"
          >
            <div>
              <p class="font-medium text-sm text-gray-900">
                {{ option.label }}
              </p>
              <p class="text-xs text-gray-500">
                {{ t('integrations.show.shein.internalProperties.options.remoteValue') }}: {{ option.value }}
              </p>
            </div>
            <p class="text-xs text-gray-500">
              {{ option.description || t('integrations.show.shein.internalProperties.options.noDescription') }}
            </p>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">
                {{ t('integrations.show.shein.internalProperties.options.localValue') }}
              </label>
              <FieldQuery
                :model-value="optionMappings[option.id]"
                :field="buildField(option)"
                @update:model-value="(value) => handleOptionUpdate(option, value as string | null)"
              />
            </div>
          </div>
          </div>
        </div>
      </div>
    </template>
  </Accordion>
</template>
