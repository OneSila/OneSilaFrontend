<script setup lang="ts">
import {computed, defineProps, onMounted, Ref, ref} from 'vue';
import { useI18n } from "vue-i18n";
import {AdditonalFormFields, FormType} from "../product";
import {TextInput} from "../../../../../../shared/components/atoms/input-text";
import {PrimaryButton} from "../../../../../../shared/components/atoms/button-primary";
import {FieldType, ProductType} from "../../../../../../shared/utils/constants";
import {Label} from "../../../../../../shared/components/atoms/label";
import {FieldQuery} from "../../../../../../shared/components/organisms/general-form/containers/form-fields/field-query";
import { propertiesQuery, propertySelectValuesQuery } from "../../../../../../shared/api/queries/properties.js";
import apolloClient from "../../../../../../../apollo-client";
import {Selector} from "../../../../../../shared/components/atoms/selector";
import {QueryFormField} from "../../../../../../shared/components/organisms/general-form/formConfig";
import {selectValueOnTheFlyConfig} from "../../../../../properties/property-select-values/configs";

const props = defineProps<{form: FormType, hideProductTypeSelector: boolean, additionalFieldsForm: AdditonalFormFields}>();
const productTypeId = ref(null);
const productTypeField: Ref<QueryFormField| null> = ref(null);

const emit = defineEmits(['trigger-next-step', 'set-product-type-property-id']);
const { t } = useI18n();

const isGenerateDisabled = computed(() => {
  return props.form.name.length === 0;
});

const fetchProductType = async () => {

    const {data} = await apolloClient.query({
      query: propertiesQuery,
      variables: {filter: {isProductType: { exact: true } }}
    })

    if (data && data.properties && data.properties.edges && data.properties.edges.length == 1) {
      productTypeId.value = data.properties.edges[0].node.id;
      emit('set-product-type-property-id', productTypeId.value)


      productTypeField.value = {
          type: FieldType.Query,
          name: 'productType',
          label: t('properties.properties.labels.isProductType'),
          labelBy: 'value',
          valueBy: 'id',
          query: propertySelectValuesQuery,
          queryVariables: { filter: { property: { isProductType: { exact: true } } }},
          dataKey: 'propertySelectValues',
          isEdge: true,
          multiple: false,
          filterable: true,
          formMapIdentifier: 'id',
          createOnFlyConfig: selectValueOnTheFlyConfig(t, productTypeId.value)
      }
    }
}

onMounted(fetchProductType)

</script>

<template>
  <div>
    <h1 class="text-2xl text-center mb-2">{{ t('products.products.create.wizard.stepTwo.content') }}</h1>
    <hr>
    <Flex vertical>
      <FlexCell>
        <Flex class="mt-4 gap-4" center>
          <FlexCell center>
            <Flex vertical class="gap-2">
              <FlexCell>
                <label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('shared.labels.name') }}*</label>
              </FlexCell>
              <FlexCell>
                <TextInput class="w-96" v-model="form.name" :placeholder="'Pen'" />
              </FlexCell>
            </Flex>
          </FlexCell>
        </Flex>
      </FlexCell>

      <FlexCell v-if="!hideProductTypeSelector" class="py-8 px-96"><hr></FlexCell>
      <FlexCell v-if="!hideProductTypeSelector">
        <Flex center>
          <FlexCell center>
              <Flex vertical class="gap-2">
              <FlexCell>
                <Label class="font-semibold block text-sm leading-6 text-gray-900">
                  {{  t('properties.properties.labels.isProductType') }}
                </Label>
              </FlexCell>
              <FlexCell>
                <Selector v-if="productTypeField == null" :options="[]" label-by="name" value-by="id" is-loading />
                <FieldQuery v-else class="w-96" v-model="additionalFieldsForm.productType.id" :field="productTypeField"  />
              </FlexCell>
            </Flex>
          </FlexCell>
        </Flex>
      </FlexCell>

      <FlexCell v-if="form.type !== ProductType.Configurable" class="py-8 px-96"><hr></FlexCell>
      <FlexCell v-if="form.type !== ProductType.Configurable">
        <Flex center class="gap-4">
          <FlexCell center>
            <Flex vertical class="gap-2">
              <FlexCell>
                <label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('shared.labels.sku') }}</label>
              </FlexCell>
              <FlexCell>
                <TextInput class="w-60" v-model="form.sku" :placeholder="'SKU-123'" />
              </FlexCell>
            </Flex>
          </FlexCell>
          <FlexCell center>
            <h1 class="text-lg font-bold uppercase mt-8">{{ t('shared.labels.or') }}</h1>
          </FlexCell>
          <FlexCell center>
            <PrimaryButton class="mt-8" @click="emit('trigger-next-step')" :disabled="isGenerateDisabled">
              {{ t('products.products.create.wizard.stepTwo.generate') }}
            </PrimaryButton>
          </FlexCell>
        </Flex>
      </FlexCell>

    </Flex>
  </div>
</template>