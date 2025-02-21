<script setup lang="ts">

import {onMounted, reactive, ref} from 'vue';
import { useI18n } from 'vue-i18n';
import {
  CheckboxFormField, FormType,
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
import {SecondaryButton} from "../../../../../../../shared/components/atoms/button-secondary";
import apolloClient from "../../../../../../../../apollo-client";
import {updateProductMutation} from "../../../../../../../shared/api/mutations/products.js";
import {useRouter} from "vue-router";
import { ProductType } from "../../../../../../../shared/utils/constants";
import { leadTimesQuery, leadTimeProductsOutOfStockQuery } from "../../../../../../../shared/api/queries/leadtimes.js";
import { createLeadTimeProductOutOfStockMutation, updateLeadTimeProductOutOfStockMutation, deleteLeadTimeProductOutOfStockMutation } from "../../../../../../../shared/api/mutations/leadtimes.js";
import {leadTimeOnTheFlyConfig} from "../../../../../../settings/leadtimes/configs";

const { t } = useI18n();
const props = defineProps<{ product: Product }>();

const leadtimeVal = ref(null);
const leadtimeOutOfStockId = ref(null);
const leadtimeInitialVal = ref(null);

const form = reactive({
  id: props.product.id,
  sku: props.product.sku,
  active: props.product.active,
  vatRate: {
    id: props.product.vatRate?.id
  },
  allowBackorder: props.product.allowBackorder,
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
  vatRate: props.product.type !== ProductType.Configurable ? {
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
  allowBackorder: props.product.type === ProductType.Simple ? {
    type: FieldType.Checkbox,
    name: 'allowBackorder',
    label: t('products.products.labels.allowBackorder'),
    default: false,
    uncheckedValue: "false"
  } : null,
};

const leadtimeField = {
      type: FieldType.Query,
      name: 'leadtime',
      label:  t('settings.leadtimes.labels.outOfStock'),
      labelBy: 'name',
      valueBy: 'id',
      query: leadTimesQuery,
      dataKey: 'leadTimes',
      isEdge: true,
      multiple: false,
      filterable: true,
      optional: true,
      formMapIdentifier: 'id',
      createOnFlyConfig: leadTimeOnTheFlyConfig(t),
}

const getCleanData = (data) => {
  let cleanedData =  {
    id: data.id,
    sku: data.sku,
    active: data.active,
    allowBackorder: data.allowBackorder,
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
      form.allowBackorder = data.updateProduct.allowBackorder

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

      <!-- Conditionally Rendered VAT Rate Field -->
      <div class="col-span-full mt-3" v-if="product.type !== ProductType.Configurable">
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

      <!-- Always On Stock (Only for Simple) -->
      <div class="col-span-full mt-3" v-if="product.type === ProductType.Simple">
        <Flex>
          <FlexCell>
            <label v-if="fields.allowBackorder" class="font-semibold block text-sm leading-6 text-gray-900 px-1">{{ fields['allowBackorder'].label }}</label>
          </FlexCell>
          <FlexCell>
            <div class="ml-2">
              <FieldCheckbox :field="fields['allowBackorder'] as CheckboxFormField" :model-value="form.allowBackorder" @update:modelValue="form.allowBackorder = $event"/>
            </div>
          </FlexCell>
        </Flex>
      </div>

    </div>
    <div class="mt-4">
      <div class="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 py-4 sm:px-8">
        <SecondaryButton @click="handleSubmit" class="ml-2">
          {{ t('shared.button.saveAndContinue') }}
        </SecondaryButton>

        <PrimaryButton @click="handleSubmitAndRedirect">
          {{ t('shared.button.save') }}
        </PrimaryButton>
      </div>
    </div>
  </div>
</template>