<script setup lang="ts">

import {reactive, ref} from 'vue';
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

const { t } = useI18n();
const props = defineProps<{ product: Product }>();

const form = reactive({
  id: props.product.id,
  sku: props.product.sku,
  active: props.product.active,
  vatRate: {
    id: props.product.vatRate.id
  },
  alwaysOnStock: props.product.alwaysOnStock,
});

const router = useRouter();

const fields = {
    'sku':   {
      type: FieldType.Text,
      name: 'sku',
      label: t('shared.labels.sku'),
      placeholder: t('shared.placeholders.sku'),
    },
    'active': {
      type: FieldType.Checkbox,
      name: 'active',
      label: t('shared.labels.active'),
      default: false,
      uncheckedValue: "false"
    },
    'vatRate': {
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
    },
    'alwaysOnStock': {
      type: FieldType.Checkbox,
      name: 'alwaysOnStock',
      label: t('products.products.labels.alwaysOnStock'),
      default: false,
      uncheckedValue: "false"
    }
}

const getCleanData = (data) => {
  return {
    id: data.id,
    sku: data.sku,
    active: data.active,
    vatRate: data.vatRate,
    alwaysOnStock: data.alwaysOnStock,
  };
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
      form.vatRate.id = data.updateProduct.vatRate.id
      form.alwaysOnStock = data.updateProduct.alwaysOnStock
      Toast.success(t('products.products.edit.updateSuccefully'));
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
          <FlexCell>
            <Button :customClass="'ltr:ml-2 rtl:mr-2 btn btn-primary p-2 rounded-full'" @click="refreshSku">
              <Icon name="arrows-rotate" />
            </Button>
          </FlexCell>
        </Flex>
      </div>
      <div class="col-span-full mt-3">
        <label class="font-semibold block text-sm leading-6 text-gray-900 px-1">{{ fields['vatRate'].label }}</label>
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
      <div class="col-span-full mt-3">
        <Flex>
          <FlexCell>
            <label class="font-semibold block text-sm leading-6 text-gray-900 px-1">{{ fields['alwaysOnStock'].label }}</label>
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