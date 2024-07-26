<script setup lang="ts">

import {reactive, computed, ref, onMounted} from 'vue';
import { useI18n } from 'vue-i18n';
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Wizard } from "../../../../shared/components/molecules/wizard";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import {useRoute, useRouter} from "vue-router";
import { ProductType } from "../../../../shared/utils/constants";
import {
  createBillsOfMaterialMutation,
  createBundleVariationsMutation,
  createProductMutation,
  createUmbrellaVariationsMutation, updateProductMutation
} from "../../../../shared/api/mutations/products.js"
import apolloClient from "../../../../../apollo-client";
import {Toast} from "../../../../shared/modules/toast";
import {processGraphQLErrors} from "../../../../shared/utils";
import {TypeStep} from "./containers/type-step";
import { GeneralInfoStep } from "./containers/general-info-step";
import { ForSaleStep } from "./containers/for-sale-step";
import { PriceStep } from "./containers/price-step";
import { SelectVariationsStep } from "./containers/select-variations-step";
import { AdditonalFormFields, FormType } from "./containers/product";
import {SupplierStep} from "./containers/supplier-step";
import {createSalesPriceMutation} from "../../../../shared/api/mutations/salesPrices.js";
import {createSupplierProductMutation} from "../../../../shared/api/mutations/purchasing.js";
import {getProductQuery} from "../../../../shared/api/queries/products.js";
import {createProductPropertyMutation} from "../../../../shared/api/mutations/properties.js";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const wizardRef = ref();
const step = ref(0);
const loading = ref(false);
const hasSupplierProduct = ref(false);
const productFetched = ref(false);

const form: FormType = reactive({
  type: '',
  sku: '',
  name: '',
  productionTime: null,
  active: true,
  forSale: true,
  vatRate: {
    id: null
  },
  alwaysOnStock: false,
});

const additionalFieldsForm: AdditonalFormFields = reactive({
    productType: {
      id: null,
      propertyId: null
    },
    relatedProducts: [],
    supplierProduct: {
      id: null,
      sku: '',
      name: '',
      quantity: null,
      unitPrice: null,
      supplier: {
        id: null,
      },
      unit: {
        id: null
      },
      baseProducts: []
    },
    price: {
      amount: null,
      discountAmount: null,
      currency: {
        id: null
      }
    }
});

const fetchSupplierProduct = async (id: string | null = null) => {
  const supplierProductId = id || (route.query.productId ? route.query.productId.toString() : null);

  if (supplierProductId) {
    const {data} = await apolloClient.query({
      query: getProductQuery,
      variables: { id: supplierProductId }
    })

    if (data && data.product) {
      additionalFieldsForm.supplierProduct.id = data.product.id;
      additionalFieldsForm.supplierProduct.baseProducts = data.product.baseProducts.map(baseProduct => ({ id: baseProduct.id }));
      if (!id) {
        hasSupplierProduct.value = true;
      }
    }
  }
  if (!id) {
    productFetched.value = true;
  }
}

onMounted(fetchSupplierProduct);

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
      if (!hasSupplierProduct.value) {
        steps.push({ title: t('products.products.create.wizard.stepFour.simple.title'), name: 'supplierStep' });
      }
      break;
    case ProductType.Dropship:
      steps.push({ title: t('products.products.create.wizard.stepThree.title'), name: 'priceStep' });
      if (!hasSupplierProduct.value) {
        steps.push({ title: t('products.products.create.wizard.stepFour.simple.title'), name: 'supplierStep' });
      }
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

const getRelatedProductsMutation = (productType) => {
  switch(productType) {
    case ProductType.Bundle:
      return createBundleVariationsMutation;
    case ProductType.Umbrella:
      return createUmbrellaVariationsMutation;
    case ProductType.Manufacturable:
      return createBillsOfMaterialMutation;
    default:
      return null;
  }
};

const getRelatedProductsVariables = (productId) => {
  return {
    data: additionalFieldsForm.relatedProducts.map(rp => ({
      umbrella: { id: productId },
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
          amount: additionalFieldsForm.price.amount,
          discountAmount: additionalFieldsForm.price.discountAmount,
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
      console.error("Related products creation error:", error);
    }
};

const handleSupplierProduct = async (productId) => {
  const { id, ...supplierProductWithoutId } = additionalFieldsForm.supplierProduct;

  if (additionalFieldsForm.supplierProduct.id) {
    try {
      if (!hasSupplierProduct.value) {
        await fetchSupplierProduct(additionalFieldsForm.supplierProduct.id);
      }

      let ids = additionalFieldsForm.supplierProduct.baseProducts;
      ids.push({id: productId})
      await apolloClient.mutate({
        mutation: updateProductMutation,
        variables: {
          data: {id: additionalFieldsForm.supplierProduct.id, baseProducts: ids}
        },
      });
    } catch (error) {
      console.error("Supplier product creation error:", error);
    }
  } else {
    try {
      await apolloClient.mutate({
        mutation: createSupplierProductMutation,
        variables: {
          data: {...supplierProductWithoutId, baseProducts: [{ id: productId }], type: ProductType.Supplier}
        },
      });
    } catch (error) {
      console.error("Supplier product creation error:", error);
    }
  }
};

const isSupplierProductFilled = () => {
  const sp = additionalFieldsForm.supplierProduct;
  return sp.id || (sp.sku && sp.name && sp.supplier.id && sp.unit.id && sp.quantity && sp.unitPrice);
};

const processAdditionalFields = async (productId) => {
  // Create sales price if the product is for sale and it's not an Umbrella type
  if (form.forSale && additionalFieldsForm.price.amount && form.type !== ProductType.Umbrella) {
    await createSalesPrice(productId);
  }

  // Create product type
  if (additionalFieldsForm.productType.id !== null) {
    await createProductType(productId);
  }

  // Handle supplier product for Simple and Dropship product types
  if (isSupplierProductFilled() &&
      (form.type === ProductType.Simple || form.type === ProductType.Dropship)) {
      await handleSupplierProduct(productId);
    }

  // Create related products for Umbrella, Bundle, or Manufacturable types
  if (additionalFieldsForm.relatedProducts.length > 0 &&
      (form.type === ProductType.Umbrella || form.type === ProductType.Bundle || form.type === ProductType.Manufacturable)) {
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

      Toast.success(t('products.products.create.createSuccessfully'));
      loading.value = false;
      const supplierProductId = route.query.productId ? route.query.productId.toString() : null;

      if (supplierProductId && additionalFieldsForm.supplierProduct.id && productFetched.value) {
        router.push({name: 'products.products.show', params: { id: supplierProductId }, query: {tab: 'products'}})
      } else {
        router.push({name: 'products.products.show', params: { id: data.createProduct.id }})
      }

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

  form.forSale = newVal;
  if (goNext) {
    if (!newVal && hasSupplierProduct.value) {
      handleFinish();
      return;
    }
    triggerNextStep();
  }
};

const handleEmptyVariations = () => {
  additionalFieldsForm.relatedProducts = [];
};

const handleProductTypePropertyId = (id) => {
  additionalFieldsForm.productType.propertyId = id;
};


const handleProductSupplierName = () => {
  if (additionalFieldsForm.supplierProduct.name === '') {
    additionalFieldsForm.supplierProduct.name = form.name;
  }
};

function hasMissingVat() {
  return form.vatRate.id === '' || form.vatRate.id == null;
}
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

  if (step.value === 1 && (form.productionTime === null || isNaN(form.productionTime)) && form.type === ProductType.Manufacturable) {
    return false;
  }

  if (form.type === ProductType.Simple) {
    if (form.forSale) {
      return !(step.value === 3 && hasMissingVat());
    }
  } else {
    if (form.type !== ProductType.Umbrella) {
      return !(step.value === 2 && hasMissingVat());
    }
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
          <TypeStep v-if="productFetched" :form="form" :has-supplier-product="hasSupplierProduct" @for-sale-changed="handleForSaleChanged" @empty-variations="handleEmptyVariations" />
        </template>

        <template #generalInfoStep>
          <GeneralInfoStep :form="form" :additional-fields-form="additionalFieldsForm" @trigger-next-step="triggerNextStep" @set-product-type-property-id="handleProductTypePropertyId" />
        </template>

        <template #forSaleStep>
          <ForSaleStep :form="form" @for-sale-changed="handleForSaleChanged"/>
        </template>

        <template #priceStep>
          <PriceStep :form="form" :additional-fields-form="additionalFieldsForm" @set-default-currency="setDefaultCurrency" />
        </template>

        <template #supplierStep>
          <SupplierStep :form="form" :additional-fields-form="additionalFieldsForm" @set-product-supplier-name="handleProductSupplierName" />
        </template>

        <template #selectVariationsStep>
          <SelectVariationsStep :form="form" :additional-fields-form="additionalFieldsForm" />
        </template>
      </Wizard>
   </template>
  </GeneralTemplate>
</template>