<script setup lang="ts">

import {useI18n} from 'vue-i18n';
import {Breadcrumbs} from "../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import {useRoute, useRouter} from "vue-router";
import {onMounted, Ref, ref} from "vue";
import {ProductPropertiesConfigurator} from "../../../../shared/components/organisms/product-properties-configurator";
import {Card} from "../../../../shared/components/atoms/card";
import {CancelButton} from "../../../../shared/components/atoms/button-cancel";
import {PrimaryButton} from "../../../../shared/components/atoms/button-primary";
import {SecondaryButton} from "../../../../shared/components/atoms/button-secondary";
import {Property} from "../../../../shared/components/organisms/product-properties-configurator/ProductPropertiesConfigurator.vue";
import {Toast} from "../../../../shared/modules/toast";
import apolloClient from "../../../../../apollo-client";
import { completeCreateProductPropertiesRuleMutation } from "../../../../shared/api/mutations/properties.js";
import {getPropertySelectValueQuery, productPropertiesRulesQuery} from "../../../../shared/api/queries/properties.js";
import {ConfigTypes} from "../../../../shared/utils/constants";
import {Loader} from "../../../../shared/components/atoms/loader";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const updatedProductType = ref(null);
const initialProductType: Ref<{ id: string, value: string } | null> = ref(null);

const updatedAddedProperties: Ref<Property[]> = ref([]);
const initialProductId = ref(route.query.productTypeId ? route.query.productTypeId.toString() : null);
const loading = ref(true);

const handleSave = () => saveMutations(false);
const handleSaveAndContinue = () => saveMutations(true);
const saveMutations = async (continueEditing = false) => {

  if (updatedProductType.value == null) {
    Toast.error(t('properties.rule.error.noProductType'));
    return
  }

  const hasOptionalInConfigurator = updatedAddedProperties.value.some(property => property.configType === ConfigTypes.OPTIONAL_IN_CONFIGURATOR);
  const hasRequiredInConfigurator = updatedAddedProperties.value.some(property => property.configType === ConfigTypes.REQUIRED_IN_CONFIGURATOR);

  // Prepare data for the mutation
  const inputData = {
    productType: { id: updatedProductType.value },
    items: updatedAddedProperties.value.map(property => ({
      property: { id: property.id },
      type: property.configType,
      sortOrder: property.sortOrder
    }))
  };

  // Create new rule
  const { data } = await apolloClient.mutate({
    mutation: completeCreateProductPropertiesRuleMutation,
    variables: { data: inputData }
  });

  const responseData = data.completeCreateProductPropertiesRule;

  // Handle the response
  if (!responseData || !responseData.id) {
    Toast.error(t('shared.alert.toast.unexpectedResult'));
    return;
  }

    // Success
    Toast.success(t('properties.rule.alert.createSuccess'));

  if (continueEditing) {
    router.push({name: 'properties.rule.edit', params: {id: responseData.id }});
    return
  }

  if (initialProductId.value == null ) {
    router.push({name: 'properties.rule.list'});
  } else {
    router.push({name: 'properties.values.show', params: {id: initialProductId.value }, query: {tab: 'configurators'}});
  }

};

const handleAddedProperties = (addedProperties: Property[]) => {
  updatedAddedProperties.value = addedProperties;
}

const handlePropertyType = (propertyType) => {
  updatedProductType.value = propertyType;
}


const fetchProductType = async () => {

  if (initialProductId.value == null) {
    loading.value = false;
    return
  }

   const {data} = await apolloClient.query({
      query: getPropertySelectValueQuery,
      variables: { id: initialProductId.value },
      fetchPolicy: 'network-only'
    })

    if (data && data.propertySelectValue) {
      initialProductType.value = {
        id: data.propertySelectValue.id,
        value: data.propertySelectValue.value
      }
      updatedProductType.value = data.propertySelectValue.id
    }
    loading.value = false;
}


onMounted(fetchProductType)

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'properties.rule.list' }, name: t('properties.rule.title') },
                   { path: { name: 'properties.rule.create' }, name: t('properties.rule.create.title') }]" />
    </template>

   <template v-slot:content>
    <Card class="mt-2 p-4">
      <Loader :loading="loading" />
<!--      <ProductPropertiesConfigurator-->
<!--          v-if="!loading"-->
<!--          :added-properties="[]"-->
<!--          :product-type="initialProductType"-->
<!--          @update:added-properties="handleAddedProperties"-->
<!--          @update:product-type="handlePropertyType" />-->

      <div class="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 py-4 sm:px-8">
        <CancelButton @click="() => router.push({name: 'properties.rule.list'})">
          {{ t('shared.button.cancel') }}
        </CancelButton>
        <SecondaryButton @click="handleSaveAndContinue">
          {{ t('shared.button.saveAndContinue') }}
        </SecondaryButton>
        <PrimaryButton @click="handleSave">
          {{ t('shared.button.save') }}
        </PrimaryButton>
      </div>
    </Card>
   </template>
  </GeneralTemplate>
</template>