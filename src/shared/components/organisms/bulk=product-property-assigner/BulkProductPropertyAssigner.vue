<script setup lang="ts">
import {ref, computed, watch, onMounted, onUnmounted} from 'vue';
import {useI18n} from 'vue-i18n';
import {Icon} from '../../atoms/icon';
import {Label} from '../../atoms/label';
import {Selector} from '../../atoms/selector';
import {TextInput} from '../../atoms/input-text';
import {TextEditor} from '../../atoms/input-text-editor';
import {Toggle} from '../../atoms/toggle';
import {DateInput} from '../../atoms/input-date';
import {format} from 'date-fns';
import {propertiesQuery, propertiesQuerySelector, propertySelectValuesQuerySimpleSelector} from '../../../api/queries/properties';
import {translationLanguagesQuery} from '../../../api/queries/languages';
import apolloClient from "../../../../../apollo-client";
import {FieldType, PropertyTypes} from "../../../utils/constants";
import {selectValueOnTheFlyConfig} from "../../../../core/properties/property-select-values/configs";
import DateTimeInput from "../../atoms/input-date-time/DateTimeInput.vue";
import {QueryFormField} from "../general-form/formConfig";
import {FieldQuery} from "../general-form/containers/form-fields/field-query";
import {Button} from "../../atoms/button";
import {Toast} from "../../../modules/toast";
import {processGraphQLErrors} from "../../../utils";
import {bulkCreateProductPropertiesMutation} from "../../../api/mutations/properties.js";
import {Checkbox} from "../../atoms/checkbox";

const props = defineProps<{ selectedEntities: string[] }>();
const emit = defineEmits<{ (e: 'started'): void }>();

const {t} = useI18n();

const showPanel = ref(false);
const selectedProperty = ref<string | null>(null);
const selectedPropertyType = ref<string | null>(null);
const selectedValue = ref<any>(null);
const field = ref<QueryFormField | null>(null);
const language = ref<string | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const overrideIfExists = ref(false);

const propertyField = computed(() => ({
  type: FieldType.Query,
  name: 'property',
  label: t('properties.properties.show.title'),
  labelBy: 'name',
  valueBy: 'id',
  query: propertiesQuerySelector,
  queryVariables: {filter: {isProductType: {exact: false}}},
  dataKey: 'properties',
  isEdge: true,
  multiple: false,
  filterable: true,
  formMapIdentifier: 'id',
}));

const isSubmitDisabled = computed(() => {
  if (!selectedProperty.value || selectedValue.value === null || selectedValue.value === undefined) return true;
  if ([PropertyTypes.TEXT, PropertyTypes.DESCRIPTION].includes(selectedPropertyType.value ?? '')) {
    return !language.value;
  }
  return false;
});

const handleGlobalClick = (event: MouseEvent) => {
  const clickedEl = event.target as HTMLElement;
  const clickedInsidePanel = panelRef.value?.contains(clickedEl);
  const clickedInsideSelectorDropdown = !!clickedEl.closest('.vs__dropdown-menu');
  if (!clickedInsidePanel && !clickedInsideSelectorDropdown) {
    showPanel.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleGlobalClick, true);
});

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick, true);
});

watch(selectedProperty, async (newPropId) => {

  field.value = null;
  selectedValue.value = null;
  if (!newPropId) {
    selectedPropertyType.value = null;
    return;
  }

  const {data} = await apolloClient.query({
    query: propertiesQuery,
    variables: {filter: {id: {exact: newPropId}}},
  });

  const property = data?.properties?.edges?.[0]?.node;
  if (!property) return;

  const type = property.type;
  selectedPropertyType.value = type;
  if ([PropertyTypes.SELECT, PropertyTypes.MULTISELECT].includes(type)) {
    field.value = {
      type: FieldType.Query,
      name: 'propertySelectValue',
      labelBy: 'value',
      valueBy: 'id',
      query: propertySelectValuesQuerySimpleSelector,
      queryVariables: {filter: {property: {id: {exact: property.id}}}},
      dataKey: 'propertySelectValues',
      isEdge: true,
      multiple: type === PropertyTypes.MULTISELECT,
      filterable: true,
      formMapIdentifier: 'id',
    };

    if (type === PropertyTypes.SELECT) {
      field.value.createOnFlyConfig = selectValueOnTheFlyConfig(t, property.id);
    }

  } else {
    field.value = null;
  }
});

const onAssignSubmit = async () => {
  const inputData: any = {
    property: {id: selectedProperty.value}
  };

  // Populate the value field based on type
  switch (selectedPropertyType.value) {
    case PropertyTypes.SELECT:
      if (!selectedValue.value) return;
      inputData.valueSelect = {id: selectedValue.value};
      break;
    case PropertyTypes.MULTISELECT:
      if (!Array.isArray(selectedValue.value) || selectedValue.value.length === 0) return;
      inputData.valueMultiSelect = selectedValue.value.map((id: string) => ({id}));
      break;
    case PropertyTypes.INT:
      if (isNaN(selectedValue.value)) return;
      inputData.valueInt = selectedValue.value;
      break;
    case PropertyTypes.FLOAT:
      if (isNaN(selectedValue.value)) return;
      inputData.valueFloat = selectedValue.value;
      break;
    case PropertyTypes.BOOLEAN:
      inputData.valueBoolean = selectedValue.value;
      break;
    case PropertyTypes.DATE: {
      if (!selectedValue.value) return;
      let date = format(new Date(selectedValue.value), 'yyyy-MM-dd');
      if (date === '1970-01-01') return;
      inputData.valueDate = date;
      break;
    }
    case PropertyTypes.DATETIME:
      if (!selectedValue.value) return;
      inputData.valueDatetime = selectedValue.value;
      break;
    case PropertyTypes.TEXT:
      if (!selectedValue.value || !language.value) return;
      break;
    case PropertyTypes.DESCRIPTION:
      if (!selectedValue.value || !language.value) return;
      break;
    default:
      return;
  }

  // Construct the bulk payload
  const bulkPayload = props.selectedEntities.map((productId) => {
    const item: any = {
      productProperty: {
        ...inputData,
        product: {id: productId}
      },
      overrideIfExists: overrideIfExists.value
    };

    if ([PropertyTypes.TEXT, PropertyTypes.DESCRIPTION].includes(selectedPropertyType.value ?? '')) {
      item.languageCode = language.value;
      item.translatedValue = selectedValue.value;
    }

    return item;
  });

  try {
    const {data} = await apolloClient.mutate({
      mutation: bulkCreateProductPropertiesMutation,
      variables: {data: bulkPayload}
    });

    Toast.success(t('shared.components.organisms.bulkProductPropertyAssigner.assignSuccess'));
  } catch (error) {
    const validationErrors = processGraphQLErrors(error, t);
    if (validationErrors['__all__']) {
      Toast.error(validationErrors['__all__']);
    }
  }

  emit('started');
};


</script>

<template>
  <div class="relative inline-block text-left" ref="panelRef">
    <button
        @click="showPanel = !showPanel"
        class="inline-flex items-center rounded bg-green-50 px-4 py-1 text-sm font-semibold text-green-800 shadow-sm ring-1 ring-inset ring-green-300 hover:bg-green-100"
    >
      <Icon name="tag" size="sm" class="mr-2 text-green-600"/>
      {{ t('shared.components.organisms.bulkProductPropertyAssigner.button') }}
    </button>

    <div v-if="showPanel"
         class="absolute z-50 mt-2 left-0 rounded-xl bg-white shadow-lg border border-gray-200 p-4 w-[500px]">
      <div class="flex justify-between items-start mb-4 border-b border-gray-200 pb-4">
        <h3 class="text-sm font-semibold text-gray-800">
          {{
            t('shared.components.organisms.bulkProductPropertyAssigner.title', {count: props.selectedEntities.length})
          }}
        </h3>
        <button class="text-gray-400 hover:text-gray-600 ml-auto" @click="showPanel = false">
          <Icon name="x" size="sm"/>
        </button>
      </div>

      <Flex vertical gap="4">

      <FlexCell>
        <Checkbox
          v-model="overrideIfExists"
          name="overrideIfExists"
          class="text-sm text-black mb-2">
          {{ t('shared.components.organisms.bulkProductPropertyAssigner.overrideIfExistsCheckbox') }}
        </Checkbox>
      </FlexCell>

        <FlexCell>
          <Label class="block text-sm font-semibold text-gray-700">
            {{ t('properties.properties.show.title') }}
          </Label>
          <FieldQuery v-model="selectedProperty" :field="propertyField as QueryFormField"/>
        </FlexCell>

        <FlexCell v-if="selectedProperty">
          <Label class="block font-semibold text-sm text-gray-700 mb-1">
            {{ t('properties.values.show.title') }}
          </Label>

          <div>
            <FieldQuery v-if="field" v-model="selectedValue" :field="field"/>

            <TextInput
                v-else-if="[PropertyTypes.INT, PropertyTypes.FLOAT].includes(selectedPropertyType ?? '')"
                v-model="selectedValue"
                :number="selectedPropertyType === PropertyTypes.INT"
                :float="selectedPropertyType === PropertyTypes.FLOAT"
                class="w-full"
            />

            <TextInput
                v-else-if="selectedPropertyType === PropertyTypes.TEXT"
                v-model="selectedValue"
                class="w-full"
            />

            <TextEditor
                v-else-if="selectedPropertyType === PropertyTypes.DESCRIPTION"
                v-model="selectedValue"
                class="h-32"
            />

            <Toggle
                v-else-if="selectedPropertyType === PropertyTypes.BOOLEAN"
                v-model="selectedValue"
            />

            <DateInput
                v-else-if="selectedPropertyType === PropertyTypes.DATE"
                v-model="selectedValue"
            />

            <DateTimeInput
                v-else-if="selectedPropertyType === PropertyTypes.DATETIME"
                v-model="selectedValue"
            />
          </div>
        </FlexCell>


        <FlexCell
            v-if="[PropertyTypes.TEXT, PropertyTypes.DESCRIPTION].includes(selectedPropertyType ?? '') && selectedProperty">
          <Label class="block font-semibold text-sm text-gray-700 mb-1">
            {{ t('shared.labels.language') }}
          </Label>
          <ApolloQuery :query="translationLanguagesQuery" fetch-policy="cache-and-network">
            <template v-slot="{ result: { data } }">
              <Selector v-if="data" v-model="language" :options="data.translationLanguages.languages" labelBy="name"
                        valueBy="code" filterable/>
            </template>
          </ApolloQuery>
        </FlexCell>
      </Flex>

      <div class="mt-4 pt-4 border-t border-gray-200">
        <Button
            :disabled="isSubmitDisabled"
            class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm font-semibold"
            @click="onAssignSubmit">
          {{ t('shared.button.submit') }}
        </Button>
      </div>
    </div>
  </div>
</template>