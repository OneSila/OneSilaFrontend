<script setup lang="ts">

import {reactive, computed, ref, onMounted, watch} from 'vue';
import { useI18n } from 'vue-i18n';
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Wizard } from "../../../../shared/components/molecules/wizard";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import {useRoute, useRouter} from "vue-router";
import { ProductType } from "../../../../shared/utils/constants";
import {
  createBundleVariationsMutation,
  createProductMutation,
  createConfigurableVariationsMutation, updateProductMutation
} from "../../../../shared/api/mutations/products.js"
import apolloClient from "../../../../../apollo-client";
import {Toast} from "../../../../shared/modules/toast";
import {processGraphQLErrors} from "../../../../shared/utils";
import {TypeStep} from "./containers/type-step";
import { GeneralInfoStep } from "./containers/general-info-step";
import { PriceStep } from "./containers/price-step";
import { AliasOptionsStep } from "./containers/alias-options-step";
import { SelectVariationsStep } from "./containers/select-variations-step";
import { AdditonalFormFields, FormType } from "./containers/product";
import { createSalesPriceMutation } from "../../../../shared/api/mutations/salesPrices.js";
import { createProductPropertyMutation } from "../../../../shared/api/mutations/properties.js";
import { getProductQuery } from "../../../../shared/api/queries/products.js";


interface WizardStep {
  title: string;
  name: string;
}


const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const wizardRef = ref();
const step = ref(0);
const loading = ref(false);

const productTypePropertyValueId = ref(route.query.productTypePropertyValueId ? route.query.productTypePropertyValueId.toString() : null);
const aliasProductParentId = ref(route.query.aliasProductParentId ? route.query.aliasProductParentId.toString() : null);

const form: FormType = reactive({
  type: '',
  sku: '',
  name: '',
  active: true,
  aliasCopyImages: true,
  aliasCopyProductProperties: true,
  vatRate: {
    id: null
  },
  aliasParentProduct: {
    id: null
  },
  allowBackorder: false,
});

const additionalFieldsForm: AdditonalFormFields = reactive({
    productType: {
      id: productTypePropertyValueId.value,
      propertyId: null
    },
    relatedProducts: [],
    price: {
      rrp: null,
      price: null,
      currency: {
        id: null
      }
    }
});

if (aliasProductParentId.value) {
  form.type = ProductType.Alias;
  form.aliasParentProduct.id = aliasProductParentId.value;
}

watch(
  () => form.aliasParentProduct.id,
  async (newVal, oldVal) => {
    // RESET everything if alias is cleared
    if (newVal == null) {
      form.name = '';
      form.vatRate.id = null;

      additionalFieldsForm.productType.id = null;
      additionalFieldsForm.productType.propertyId = null;

      additionalFieldsForm.price.rrp = null;
      additionalFieldsForm.price.price = null;
      additionalFieldsForm.price.currency.id = null;

      return;
    }

    // If no change or falsy, skip
    if (!newVal || newVal === oldVal) return;

    try {
      const { data } = await apolloClient.query({
        query: getProductQuery,
        variables: { id: newVal },
        fetchPolicy: 'network-only'
      });

      const product = data?.product;
      if (!product) return;

      console.log('Fetched alias parent product:', product);

      // 1. Set product type if found in productpropertySet
      const productTypeProperty = product.productpropertySet.find(
        p => p.property?.isProductType
      );

      if (productTypeProperty) {
        additionalFieldsForm.productType.id = productTypeProperty.valueSelect?.id || null;
        additionalFieldsForm.productType.propertyId = productTypeProperty.property?.id || null;
      } else {
        additionalFieldsForm.productType.id = null;
        additionalFieldsForm.productType.propertyId = null;
      }

      // 2. Set price from default currency price if available
      const defaultPrice = product.salespriceSet.find(
        sp => sp.currency?.isDefaultCurrency
      );

      if (defaultPrice) {
        additionalFieldsForm.price.rrp = defaultPrice.rrp;
        additionalFieldsForm.price.price = defaultPrice.price;
        additionalFieldsForm.price.currency.id = defaultPrice.currency.id;
      } else {
        additionalFieldsForm.price.rrp = null;
        additionalFieldsForm.price.price = null;
        additionalFieldsForm.price.currency.id = null;
      }

      // 3. Set name
      form.name = product.name || '';

      // 4. Set vatRate
      form.vatRate.id = product.vatRate?.id || null;

    } catch (error) {
      console.error("Failed to fetch alias parent product:", error);
    }
  }
, { immediate: aliasProductParentId.value !== null });




const wizardSteps = computed(() => {
  const steps: WizardStep[] = [];

  if (!aliasProductParentId.value) {
    steps.push({ title: t('products.products.labels.type.title'), name: 'typeStep' });
  }

  if (form.type === ProductType.Alias) {
    steps.push({ title: t('products.products.create.wizard.stepAlias.title'), name: 'aliasOptionsStep' });
  }

  steps.push({ title: t('products.products.create.wizard.stepTwo.title'), name: 'generalInfoStep' });

  switch (form.type) {
    case ProductType.Simple:
    case ProductType.Alias:
      steps.push({ title: t('products.products.create.wizard.stepThree.title'), name: 'priceStep' });
      break;
    case ProductType.Bundle:
      steps.push({ title: t('products.products.create.wizard.stepThree.title'), name: 'priceStep' });
      steps.push({ title: t('products.products.create.wizard.stepFour.bundle.title'), name: 'selectVariationsStep' });
      break;
    case ProductType.Configurable:
      steps.push({ title: t('products.products.create.wizard.stepFour.configurable.title'), name: 'selectVariationsStep' });
      break;
  }

  return steps;
});


const getRelatedProductsMutation = (productType) => {
  switch(productType) {
    case ProductType.Bundle:
      return createBundleVariationsMutation;
    case ProductType.Configurable:
      return createConfigurableVariationsMutation;
    default:
      return null;
  }
};

const getRelatedProductsVariables = (productId) => {
  return {
    data: additionalFieldsForm.relatedProducts.map(rp => ({
      parent: { id: productId },
      variation: { id: rp.id },
      quantity: rp.quantity
    }))
  };
};

const createSalesPrice = async (productId) => {
  try {
    await apolloClient.mutate({
      mutation: createSalesPriceMutation,
      variables: {
        data: {
          rrp: additionalFieldsForm.price.rrp,
          price: additionalFieldsForm.price.price,
          product: { id: productId },
          currency: { id: additionalFieldsForm.price.currency.id }
        }
      },
    });
  } catch (error) {
    console.error("Sales price creation error:", error);
  }
};

const createProductType = async (productId) => {
  try {
    await apolloClient.mutate({
      mutation: createProductPropertyMutation,
      variables: {
        data: {
          product: { id: productId },
          property: { id: additionalFieldsForm.productType.propertyId },
          valueSelect: { id: additionalFieldsForm.productType.id }
        }
      },
    });
  } catch (error) {
    console.error("Product type creation error:", error);
  }
};

const createRelatedProducts = async (productId) => {
    const mutation = getRelatedProductsMutation(form.type);
    const variables = getRelatedProductsVariables(productId);
    try {
      await apolloClient.mutate({
        mutation,
        variables,
      });
    } catch (error) {
      console.error("Related products creation error:", error)
    }
};


const processAdditionalFields = async (productId) => {
  // Create sales price if the product is for sale and it's not an Configurable type
  if ((additionalFieldsForm.price.price || additionalFieldsForm.price.rrp) && form.type !== ProductType.Configurable) {
    await createSalesPrice(productId);
  }

  // Create product type
  if (additionalFieldsForm.productType.id !== null) {
    await createProductType(productId);
  }

  // Create related products for Configurable, Bundle
  if (additionalFieldsForm.relatedProducts.length > 0 &&
    (form.type === ProductType.Configurable || form.type === ProductType.Bundle)) {
      await createRelatedProducts(productId);
  }
};

function cleanFormData(data) {
  const cleanedData = JSON.parse(JSON.stringify(data));

  if (cleanedData.vatRate && cleanedData.vatRate.id === null) {
    delete cleanedData.vatRate.id;
  }

  if (cleanedData.vatRate && Object.keys(cleanedData.vatRate).length === 0) {
    delete cleanedData.vatRate;
  }

  if (cleanedData.type !== ProductType.Alias) {
    delete cleanedData.aliasParentProduct;
  }

  return cleanedData;
}

const handleFinish = async () => {

  loading.value = true;
  try {
    const {data, errors } = await apolloClient.mutate({
      mutation: createProductMutation,
      variables: {
        data: {...cleanFormData(form)}
      },
    });


    if (data && data.createProduct) {
      const productId  = data.createProduct.id;
      await processAdditionalFields(productId);

      Toast.success(t('products.products.create.createdSuccessfully'));
      loading.value = false;

      router.push({name: 'products.products.show', params: { id: data.createProduct.id }})

    }
  } catch (err) {
    const graphqlError = err as { graphQLErrors: Array<{ message: string }> };
    loading.value = false;
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

const handleForSaleChanged = (newVal, goNext) => {

  if (goNext) {
    triggerNextStep();
  }
};

const handleEmptyVariations = () => {
  additionalFieldsForm.relatedProducts = [];
};

const handleProductTypePropertyId = (id) => {
  additionalFieldsForm.productType.propertyId = id;
};


function hasMissingVat() {
  return form.vatRate.id === '' || form.vatRate.id == null;
}


const setDefaultCurrency = (id) => {
  additionalFieldsForm.price.currency.id = id;
};

const allowNextStep = computed(() => {

  const stepName = wizardSteps.value[step.value].name;

  if (stepName === 'typeStep' && form.type === '') {
    return false;
  }

  if (stepName === 'aliasOptionsStep' && !form.aliasParentProduct?.id) {
    return false;
  }

  if (stepName === 'generalInfoStep' && form.name === '') {
    return false;
  }

  if (stepName === 'priceStep') {
    return !hasMissingVat();
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

     <div v-if="loading" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div class="text-center">
          <svg class="animate-spin -ml-1 mr-3 h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-xl font-semibold text-white mt-2">{{ t('shared.labels.loading') }}</p>
        </div>
      </div>
      <Wizard ref="wizardRef" :steps="wizardSteps" :allow-next-step="allowNextStep" :show-buttons="true" @on-finish="handleFinish" @update-current-step="updateStep">

        <template #typeStep>
          <TypeStep :form="form" @empty-variations="handleEmptyVariations" />
        </template>

        <template #aliasOptionsStep>
          <AliasOptionsStep
            :form="form"
            :preselected-parent-id="aliasProductParentId"
            :disable-parent-selector="aliasProductParentId !== null"
          />
        </template>

        <template #generalInfoStep>
          <GeneralInfoStep :form="form" :additional-fields-form="additionalFieldsForm" :hide-product-type-selector="productTypePropertyValueId !== null" @trigger-next-step="triggerNextStep" @set-product-type-property-id="handleProductTypePropertyId" />
        </template>

        <template #priceStep>
          <PriceStep :form="form" :additional-fields-form="additionalFieldsForm" @set-default-currency="setDefaultCurrency" />
        </template>

        <template #selectVariationsStep>
          <SelectVariationsStep :form="form" :additional-fields-form="additionalFieldsForm" />
        </template>
      </Wizard>
   </template>
  </GeneralTemplate>
</template>