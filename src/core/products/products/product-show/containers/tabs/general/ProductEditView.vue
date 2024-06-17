<script setup lang="ts">

import {reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  CheckboxFormField,
  QueryFormField,
  ValueFormField
} from "../../../../../../../shared/components/organisms/general-form/formConfig";
import { FieldType } from "../../../../../../../shared/utils/constants";
import { Product, vatRateOnTheFlyConfig} from "../../../../configs";
import { Toast} from "../../../../../../../shared/modules/toast";
import {FieldValue} from "../../../../../../../shared/components/organisms/general-form/containers/form-fields/field-value";
import {PrimaryButton} from "../../../../../../../shared/components/atoms/button-primary";
import {vatRatesQuery} from "../../../../../../../shared/api/queries/vatRates.js";
import {FieldQuery} from "../../../../../../../shared/components/organisms/general-form/containers/form-fields/field-query";
import {FieldCheckbox} from "../../../../../../../shared/components/organisms/general-form/containers/form-fields/field-checkbox";
import {Label} from "../../../../../../../shared/components/atoms/label";
import {Icon} from "../../../../../../../shared/components/atoms/icon";
import {Button} from "../../../../../../../shared/components/atoms/button";
import {SecondaryButton} from "../../../../../../../shared/components/atoms/button-secondary";
import apolloClient from "../../../../../../../../apollo-client";
import {updateProductMutation} from "../../../../../../../shared/api/mutations/products.js";
import {useRouter} from "vue-router";
import { ProductType } from "../../../../../../../shared/utils/constants";
import { getProductField } from "../../../../../../purchasing/products/configs";

const { t } = useI18n();
const props = defineProps<{ product: Product }>();

const form = reactive({
  id: props.product.id,
  sku: props.product.sku,
  active: props.product.active,
  forSale: props.product.forSale,
  productionTime: props.product.productionTime,
  vatRate: {
    id: props.product.vatRate?.id
  },
  alwaysOnStock: props.product.alwaysOnStock,
});

const router = useRouter();

const fields = {
  sku: {
    type: FieldType.Text,
    name: 'sku',
    label: t('shared.labels.sku'),
    placeholder: t('shared.placeholders.sku'),
  },
  active: {
    type: FieldType.Checkbox,
    name: 'active',
    label: t('shared.labels.active'),
    default: form.active,
    uncheckedValue: "false"
  },
  vatRate: props.product.type !== ProductType.Umbrella ? {
    type: FieldType.Query,
    name: 'vatRate',
    label: t('products.products.labels.vatRate'),
    labelBy: 'name',
    valueBy: 'id',
    query: vatRatesQuery,
    dataKey: 'vatRates',
    isEdge: true,
    multiple: false,
    filterable: true,
    formMapIdentifier: 'id',
    createOnFlyConfig: vatRateOnTheFlyConfig(t)
  } : null,
  alwaysOnStock: props.product.type === ProductType.Simple ? {
    type: FieldType.Checkbox,
    name: 'alwaysOnStock',
    label: t('products.products.labels.alwaysOnStock'),
    default: false,
    uncheckedValue: "false"
  } : null,
  forSale: [ProductType.Simple, ProductType.Dropship, ProductType.Bundle, ProductType.Manufacturable].includes(props.product.type) ? {
    type: FieldType.Checkbox,
    name: 'forSale',
    label: t('products.products.labels.forSale'),
    default: false,
    uncheckedValue: "false"
  } : null,
  productionTime: props.product.type === ProductType.Manufacturable ? {
    type: FieldType.Text,
    name: 'productionTime',
    label: t('products.products.labels.productionTime'),
    placeholder: t('shared.placeholders.productionTime'),
    number: true
  } : null,
};

const getCleanData = (data) => {
  let cleanedData =  {
    id: data.id,
    sku: data.sku,
    active: data.active,
    alwaysOnStock: data.alwaysOnStock,
    productionTime: data.productionTime,
    forSale: data.forSale,
  };

  if (data.vatRate?.id) {
    cleanedData['vatRate'] = data.vatRate;
  }

  return cleanedData;
};

const handleSubmit = async (overrideData = {}) => {
  const dataToSubmit = getCleanData({ ...form, ...overrideData });

  try {
    const { data } = await apolloClient.mutate({
      mutation: updateProductMutation,
      variables: {
        data: dataToSubmit,
      },
    });

    if (data && data.updateProduct) {
      form.sku = data.updateProduct.sku
      form.active = data.updateProduct.active
      form.alwaysOnStock = data.updateProduct.alwaysOnStock

      if (data.updateProduct.vatRate && data.updateProduct.vatRate.id) {
        form.vatRate.id = data.updateProduct.vatRate.id
      }

      Toast.success(t('products.products.edit.updateSuccessfully'));
    }
  } catch (error) {
    console.error(error);
  }
};

const handleSubmitAndRedirect = async () => {
  await handleSubmit();
  router.push({ name: 'products.products.list' });
};

const refreshSku = async () => {
  await handleSubmit({ sku: '' });
};

</script>

<template>
  <div class="py-2">
    <div class="max-w-4xl">

      <div class="col-span-full">
        <label class="font-semibold block text-sm leading-6 text-gray-900 px-1">{{ fields['sku'].label }}</label>
        <Flex>
          <FlexCell grow>
            <FieldValue :field="fields['sku'] as ValueFormField" :model-value="form.sku" @update:modelValue="form.sku = $event" />
          </FlexCell>
        </Flex>
      </div>


      <!-- Production Time (Only for Manufacture) -->
      <div class="col-span-full mt-3" v-if="product.type === ProductType.Manufacturable">
        <label class="font-semibold block text-sm leading-6 text-gray-900 px-1">{{ t('products.products.labels.productionTime') }}</label>
        <FieldValue :field="fields['productionTime'] as ValueFormField" :model-value="form.productionTime" @update:modelValue="form.productionTime = $event" />
      </div>

      <!-- Conditionally Rendered VAT Rate Field -->
      <div class="col-span-full mt-3" v-if="product.type !== ProductType.Umbrella && product.type !== ProductType.Supplier">
        <label v-if="fields.vatRate" class="font-semibold block text-sm leading-6 text-gray-900 px-1">{{ fields['vatRate'].label }}</label>
        <FieldQuery :field="fields['vatRate'] as QueryFormField" :model-value="form.vatRate.id" @update:modelValue="form.vatRate.id = $event"/>
      </div>

      <div class="col-span-full mt-3">
        <Flex>
          <FlexCell>
            <label class="font-semibold block text-sm leading-6 text-gray-900 px-1">{{ fields['active'].label }}</label>
          </FlexCell>
          <FlexCell>
            <div class="ml-2">
              <FieldCheckbox :field="fields['active'] as CheckboxFormField" :model-value="form.active" @update:modelValue="form.active = $event"/>
            </div>
          </FlexCell>
        </Flex>
      </div>

      <!-- For Sale Checkbox (For certain types) -->
      <div class="col-span-full mt-3" v-if="[ProductType.Simple, ProductType.Dropship, ProductType.Bundle, ProductType.Manufacturable].includes(product.type)">
        <Flex>
          <FlexCell>
            <label class="font-semibold block text-sm leading-6 text-gray-900 px-1">{{ t('products.products.labels.forSale') }}</label>
          </FlexCell>
          <FlexCell class="ml-2">
            <FieldCheckbox :field="fields['forSale'] as CheckboxFormField" :model-value="form.forSale" @update:modelValue="form.forSale = $event"/>
          </FlexCell>
        </Flex>
      </div>

      <!-- Always On Stock (Only for Simple) -->
      <div class="col-span-full mt-3" v-if="product.type === ProductType.Simple">
        <Flex>
          <FlexCell>
            <label v-if="fields.alwaysOnStock" class="font-semibold block text-sm leading-6 text-gray-900 px-1">{{ fields['alwaysOnStock'].label }}</label>
          </FlexCell>
          <FlexCell>
            <div class="ml-2">
              <FieldCheckbox :field="fields['alwaysOnStock'] as CheckboxFormField" :model-value="form.alwaysOnStock" @update:modelValue="form.alwaysOnStock = $event"/>
            </div>
          </FlexCell>
        </Flex>
      </div>

    </div>
    <div class="mt-4">
      <PrimaryButton @click="handleSubmitAndRedirect">
        {{ t('shared.button.save') }}
      </PrimaryButton>
      <SecondaryButton @click="handleSubmit" class="ml-2">
        {{ t('shared.button.saveAndContinue') }}
      </SecondaryButton>
    </div>
  </div>
</template>