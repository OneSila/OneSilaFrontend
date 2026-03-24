<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DocumentNode } from 'graphql';
import { Icon } from '../../../../../../../../shared/components/atoms/icon';
import { Label } from '../../../../../../../../shared/components/atoms/label';
import { FieldQuery } from '../../../../../../../../shared/components/organisms/general-form/containers/form-fields/field-query';
import { Button } from '../../../../../../../../shared/components/atoms/button';
import { propertiesQuerySelector } from '../../../../../../../../shared/api/queries/properties';
import { FieldType } from '../../../../../../../../shared/utils/constants';
import type { QueryFormField } from '../../../../../../../../shared/components/organisms/general-form/formConfig';
import { Toast } from '../../../../../../../../shared/modules/toast';
import { processGraphQLErrors } from '../../../../../../../../shared/utils';
import apolloClient from '../../../../../../../../../apollo-client';

const props = defineProps<{ selectedEntities: string[]; mutation: DocumentNode }>();
const emit = defineEmits<{ (e: 'started'): void }>();

const { t } = useI18n();

const showPanel = ref(false);
const selectedProperty = ref<string | null>(null);
const panelRef = ref<HTMLElement | null>(null);

const propertyField = {
  type: FieldType.Query,
  name: 'property',
  label: t('properties.properties.show.title'),
  labelBy: 'name',
  valueBy: 'id',
  query: propertiesQuerySelector,
  queryVariables: { filter: { isProductType: { exact: false } } },
  dataKey: 'properties',
  isEdge: true,
  multiple: false,
  filterable: true,
  formMapIdentifier: 'id',
};

const onAssignSubmit = async () => {
  if (!selectedProperty.value) return;

  try {
    await Promise.all(
      props.selectedEntities.map((id) =>
        apolloClient.mutate({
          mutation: props.mutation,
          variables: {
            data: {
              id,
              localInstance: { id: selectedProperty.value },
            },
          },
        }),
      ),
    );

    Toast.success(t('integrations.show.properties.assignSuccess'));
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
      {{ t('integrations.show.properties.bulkAssign') }}
    </button>

    <div v-if="showPanel" class="absolute z-50 mt-2 right-0 rounded-xl bg-white shadow-lg border border-gray-200 p-4 w-[400px]">
      <div class="flex justify-between items-start mb-4 border-b border-gray-200 pb-4">
        <h3 class="text-sm font-semibold text-gray-800">
          {{ t('integrations.show.properties.bulkAssignTitle', { count: props.selectedEntities.length }) }}
        </h3>
        <button class="text-gray-400 hover:text-gray-600 ml-auto" @click="showPanel = false">
          <Icon name="x" size="sm" />
        </button>
      </div>

      <div>
        <Label class="block text-sm font-semibold text-gray-700 mb-1">{{ t('properties.properties.show.title') }}</Label>
        <FieldQuery v-model="selectedProperty" :field="propertyField as QueryFormField" />
      </div>

      <div class="mt-4 pt-4 border-t border-gray-200">
        <Button class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm font-semibold" :disabled="!selectedProperty" @click="onAssignSubmit">
          {{ t('shared.button.submit') }}
        </Button>
      </div>
    </div>
  </div>
</template>
