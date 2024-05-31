<script setup lang="ts">

import {reactive, computed, ref} from 'vue';
import { useI18n } from 'vue-i18n';
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Wizard } from "../../../../shared/components/molecules/wizard";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import {useRoute, useRouter} from "vue-router";
import { ProductType } from "../../../../shared/utils/constants";
import { TextInput } from "../../../../shared/components/atoms/input-text";
import { FieldQuery } from "../../../../shared/components/organisms/general-form/containers/form-fields/field-query";
import { createProductMutation } from "../../../../shared/api/mutations/products.js"
import apolloClient from "../../../../../apollo-client";
import {Toast} from "../../../../shared/modules/toast";
import {processGraphQLErrors} from "../../../../shared/utils";
import {TypeStep} from "./containers/type-step";
import { GeneralInfoStep } from "./containers/general-info-step";
import { ForSaleStep } from "./containers/for-sale-step";
import { PriceStep } from "./containers/price-step";
import {AdditonalFormFields, FormType} from "./containers/product";


const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const wizardRef = ref();
const step = ref(0);

const form: FormType = reactive({
  type: '',
  sku: '',
  name: '',
  productionTime: '',
  active: true,
  forSale: true,
  vatRate: {
    id: ''
  },
  alwaysOnStock: false,
});

const additionalFieldsForm: AdditonalFormFields = reactive({
    relatedProducts: [],
    supplierProduct: {
      sku: '',
      name: '',
      quantity: '',
      unit_price: '',
      supplier: {
        id: '',
      },
      unit: {
        id: ''
      }

    },
    price: {
      amount: '',
      discountAmount: '',
      currency: {
        id: ''
      }
    }
});

const wizardSteps = computed(() => {
  let steps = [
    { title: t('products.products.labels.type.title'), name: 'typeStep' },
    { title: t('products.products.create.wizard.stepTwo.title'), name: 'generalInfoStep' },
  ];

  switch (form.type) {
    case ProductType.Simple:
      steps.push({ title: t('products.products.create.wizard.stepThree.simple.title'), name: 'forSaleStep' });
      if (form.forSale) {
        steps.push({ title: t('products.products.create.wizard.stepThree.title'), name: 'priceStep' });
      }
      steps.push({ title: t('products.products.create.wizard.stepFour.simple.title'), name: 'supplierStep' });
      break;
    case ProductType.Dropship:
      steps.push({ title: t('products.products.create.wizard.stepThree.title'), name: 'priceStep' });
      steps.push({ title: t('products.products.create.wizard.stepFour.simple.title'), name: 'supplierStep' });
      break;
    case ProductType.Bundle:
      steps.push({ title: t('products.products.create.wizard.stepThree.title'), name: 'priceStep' });
      steps.push({ title: t('products.products.create.wizard.stepFour.bundle.title'), name: 'selectVariationsStep' });
      break;
    case ProductType.Manufacturable:
      steps.push({ title: t('products.products.create.wizard.stepThree.title'), name: 'priceStep' });
      steps.push({ title: t('products.products.create.wizard.stepFour.manufacturable.title'), name: 'selectVariationsStep' });
      break;
    case ProductType.Umbrella:
      steps.push({ title: t('products.products.create.wizard.stepFour.configurable.title'), name: 'selectVariationsStep' });
      break;
  }

  return steps;
});

const handleFinish = async () => {

  try {
    const {data, errors } = await apolloClient.mutate({
      mutation: createProductMutation,
      variables: {
        data: {...form}
      },
    });


    if (data && data.createProduct) {
      Toast.success(t('products.products.create.createSuccefully'));
      router.push({name: 'products.products.show', params: {id: data.createProduct.id}})
    }
  } catch (err) {
    const graphqlError = err as { graphQLErrors: Array<{ message: string }> };
    if (graphqlError.graphQLErrors) {
      const validationErrors = processGraphQLErrors(graphqlError, t);
      for (const key in validationErrors) {
        if (validationErrors.hasOwnProperty(key)) {
          Toast.error(validationErrors[key]);
        }
      }
    }
  }

}

const updateStep = (val) => {
  step.value = val;
}

const triggerNextStep = () => {
  wizardRef.value.nextStep();
};

const handleForSaleChanged = (newVal) => {
  form.forSale = newVal;
};

const setDefaultCurrency = (id) => {
  additionalFieldsForm.price.currency.id = id;
};

const allowNextStep = computed(() => {
  if (step.value === 0 && form.type === '') {
    return false;
  }

  if (step.value === 1 && form.name === '') {
    return false;
  }

  if (step.value === 3 && (form.vatRate.id === '' || form.vatRate.id == null)) {
    return false;
  }

  return true;
});

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'products.products.list' }, name: t('products.title') },
                   { path: { name: 'products.products.create' }, name: t('products.products.create.title') }]" />
    </template>

   <template v-slot:content>
      <Wizard ref="wizardRef" :steps="wizardSteps" :allow-next-step="allowNextStep" @on-finish="handleFinish" @update-current-step="updateStep">

        <template #typeStep>
          <TypeStep :form="form" @for-sale-changed="handleForSaleChanged" />
        </template>

        <template #generalInfoStep>
          <GeneralInfoStep :form="form" @trigger-next-step="triggerNextStep" />
        </template>

        <template #forSaleStep>
          <ForSaleStep :form="form" @for-sale-changed="handleForSaleChanged"/>
        </template>

        <template #priceStep>
          <PriceStep :form="form" :additional-fields-form="additionalFieldsForm" @set-default-currency="setDefaultCurrency" />
        </template>

        <template #supplierStep>
          CREATE SUPPLIER
        </template>

        <template #selectVariationsStep>
          ADD VARIATIONS
        </template>
      </Wizard>
   </template>
  </GeneralTemplate>
</template>