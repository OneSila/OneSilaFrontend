<script setup lang="ts">
import {onMounted, onUnmounted, ref, watch} from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '../../../../../../../../shared/components/atoms/icon';
import { Label } from '../../../../../../../../shared/components/atoms/label';
import { FieldQuery } from '../../../../../../../../shared/components/organisms/general-form/containers/form-fields/field-query';
import { Button } from '../../../../../../../../shared/components/atoms/button';
import { propertiesQuerySelector, propertySelectValuesQuerySimpleSelector } from '../../../../../../../../shared/api/queries/properties';
import apolloClient from '../../../../../../../../../apollo-client';
import {FieldType, PropertyTypes} from '../../../../../../../../shared/utils/constants';
import { QueryFormField } from '../../../../../../../../shared/components/organisms/general-form/formConfig';
import { selectValueOnTheFlyConfig } from '../../../../../../../properties/property-select-values/configs';
import { Toast } from '../../../../../../../../shared/modules/toast';
import { processGraphQLErrors } from '../../../../../../../../shared/utils';
import { bulkUpdateAmazonPropertySelectValueLocalInstanceMutation } from '../../../../../../../../shared/api/mutations/salesChannels.js';

const props = defineProps<{ selectedEntities: string[] }>();
const emit = defineEmits<{ (e: 'started'): void }>();

const { t } = useI18n();

const showPanel = ref(false);
const selectedProperty = ref<string | null>(null);
const selectedValue = ref<string | null>(null);
const field = ref<QueryFormField | null>(null);
const panelRef = ref<HTMLElement | null>(null);

const propertyField = {
  type: FieldType.Query,
  name: 'property',
  label: t('properties.properties.show.title'),
  labelBy: 'name',
  valueBy: 'id',
  query: propertiesQuerySelector,
  queryVariables: { filter: { isProductType: { exact: false }, type: {exact: PropertyTypes.SELECT} } },
  dataKey: 'properties',
  isEdge: true,
  multiple: false,
  filterable: true,
  formMapIdentifier: 'id',
};

watch(selectedProperty, async (newPropId) => {
  field.value = null;
  selectedValue.value = null;
  if (!newPropId) return;

  const { data } = await apolloClient.query({
    query: propertiesQuerySelector,
    variables: { filter: { id: { exact: newPropId } } },
  });

  const property = data?.properties?.edges?.[0]?.node;
  if (!property) return;

  field.value = {
    type: FieldType.Query,
    name: 'propertySelectValue',
    labelBy: 'value',
    valueBy: 'id',
    query: propertySelectValuesQuerySimpleSelector,
    queryVariables: { filter: { property: { id: { exact: property.id } } } },
    dataKey: 'propertySelectValues',
    isEdge: true,
    multiple: false,
    filterable: true,
    formMapIdentifier: 'id',
    createOnFlyConfig: selectValueOnTheFlyConfig(t, property.id),
  } as QueryFormField;
});

const onAssignSubmit = async () => {
  if (!selectedValue.value) return;

  try {
    await apolloClient.mutate({
      mutation: bulkUpdateAmazonPropertySelectValueLocalInstanceMutation,
      variables: {
        data: {
          ids: props.selectedEntities,
          localInstanceId: selectedValue.value,
        },
      },
    });
    Toast.success(t('integrations.show.propertySelectValues.assignSuccess'));
    emit('started');
    showPanel.value = false;
  } catch (error) {
    const validationErrors = processGraphQLErrors(error, t);
    if (validationErrors['__all__']) {
      Toast.error(validationErrors['__all__']);
    }
  }
};

const handleGlobalClick = (event: MouseEvent) => {
  const clickedEl = event.target as HTMLElement;
  const clickedInsidePanel = panelRef.value?.contains(clickedEl);
  const clickedInsideSelectorDropdown = !!clickedEl.closest('.vs__dropdown-menu');
  const clickedInsideUniversalModal = !!clickedEl.closest('.vue-universal-modal-content');

  if (!clickedInsidePanel && !clickedInsideSelectorDropdown && !clickedInsideUniversalModal) {
    showPanel.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleGlobalClick, true);
});

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick, true);
});

</script>

<template>
  <div class="relative inline-block text-right" ref="panelRef">
    <button
      type="button"
      @click="showPanel = !showPanel"
      class="inline-flex items-center rounded bg-green-50 px-4 py-1 text-sm font-semibold text-green-800 shadow-sm ring-1 ring-inset ring-green-300 hover:bg-green-100"
    >
      <Icon name="tag" size="sm" class="text-green-600 mr-2" />
      {{ t('integrations.show.propertySelectValues.bulkAssign') }}
    </button>

    <div v-if="showPanel" class="absolute z-50 mt-2 right-0 rounded-xl bg-white shadow-lg border border-gray-200 p-4 w-[400px]">
      <div class="flex justify-between items-start mb-4 border-b border-gray-200 pb-4">
        <h3 class="text-sm font-semibold text-gray-800">
          {{ t('integrations.show.propertySelectValues.bulkAssignTitle', { count: props.selectedEntities.length }) }}
        </h3>
        <button class="text-gray-400 hover:text-gray-600 ml-auto" @click="showPanel = false">
          <Icon name="x" size="sm" />
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <Label class="block text-sm font-semibold text-gray-700 mb-1">{{ t('properties.properties.show.title') }}</Label>
          <FieldQuery v-model="selectedProperty" :field="propertyField as QueryFormField" />
        </div>

        <div v-if="field">
          <Label class="block text-sm font-semibold text-gray-700 mb-1">{{ t('properties.values.show.title') }}</Label>
          <FieldQuery v-model="selectedValue" :field="field" />
        </div>
      </div>

      <div class="mt-4 pt-4 border-t border-gray-200">
        <Button class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm font-semibold" :disabled="!selectedProperty || !selectedValue" @click="onAssignSubmit">
          {{ t('shared.button.submit') }}
        </Button>
      </div>
    </div>
  </div>
</template>
