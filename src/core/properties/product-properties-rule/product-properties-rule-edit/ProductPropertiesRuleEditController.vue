<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from "vue-router";
import {onMounted, Ref, ref} from "vue";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import { ProductPropertiesConfigurator } from "../../../../shared/components/organisms/product-properties-configurator";
import {Card} from "../../../../shared/components/atoms/card";
import {CancelButton} from "../../../../shared/components/atoms/button-cancel";
import {PrimaryButton} from "../../../../shared/components/atoms/button-primary";
import {SecondaryButton} from "../../../../shared/components/atoms/button-secondary";
import {Toast} from "../../../../shared/modules/toast";
import {ConfigTypes} from "../../../../shared/utils/constants";
import apolloClient from "../../../../../apollo-client";
import { getProductPropertiesRuleQuery } from "../../../../shared/api/queries/properties.js";
import { completeUpdateProductPropertiesRuleMutation, deleteProductPropertiesRuleMutation } from "../../../../shared/api/mutations/properties.js";
import {DangerButton} from "../../../../shared/components/atoms/button-danger";
import {FormType} from "../../../../shared/components/organisms/general-form/formConfig";
import {ApolloAlertMutation} from "../../../../shared/components/molecules/apollo-alert-mutation";
import { Property } from "../../../../shared/components/organisms/product-properties-configurator/ProductPropertiesConfigurator.vue";
import {Loader} from "../../../../shared/components/atoms/loader";
import {Link} from "../../../../shared/components/atoms/link";
import {Button} from "../../../../shared/components/atoms/button";

interface Item {
  id: string;
  type: string;
  sortOrder: number;
}

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const id = ref(String(route.params.id));
const initialProductType = ref(null);
const initialItems: Ref<Property[]> = ref([]);
const updatedAddedProperties: Ref<Property[]> = ref([]);
const propertiesItemsMap: Ref<Record<string, Item>> = ref({})
const loading = ref(false);
const requireEanCode = ref(false);

const updateOrCreateItems = async () => {
  try {
    // Prepare the input data for the mutation
    const inputData = {
      id: id.value.toString(),
      requireEanCode: requireEanCode.value,
      items: updatedAddedProperties.value.map(property => ({
        id: propertiesItemsMap.value[property.id]?.id || null,
        property: { id: property.id },
        type: property.configType,
        sortOrder: property.sortOrder
      }))
    };

    // Call the mutation
    const { data } = await apolloClient.mutate({
      mutation: completeUpdateProductPropertiesRuleMutation,
      variables: { data: inputData }
    });

    const responseData = data.completeUpdateProductPropertiesRule;

    // Handle the response
    return !(!responseData || !responseData.id);

  } catch (err) {
    return false;
  }
};

const fetchData = async () => {
  loading.value = true;
  propertiesItemsMap.value = {}
  initialItems.value = []

  const {data} = await apolloClient.query({
    query: getProductPropertiesRuleQuery,
    variables: {id: id.value.toString() },
    fetchPolicy: 'network-only'
  })

  if (data && data.productPropertiesRule) {
    initialProductType.value = data.productPropertiesRule.productType;
    requireEanCode.value = data.productPropertiesRule.requireEanCode;
    const items = data.productPropertiesRule.items;
    for (const key in items) {
        const item = items[key];
        const toAdd: Property = {
          id: item.property.id,
          name: item.property.name,
          type: item.property.type,
          configType: item.type,
          sortOrder: item.sortOrder,
        }
        propertiesItemsMap.value[item.property.id] = {
          id: item.id,
          type: item.type,
          sortOrder: item.sortOrder,
        };
        initialItems.value.push(toAdd);
      }

      updatedAddedProperties.value = initialItems.value;
    }

  loading.value = false;
}

const handleSave = () => saveMutations(false);
const handleSaveAndContinue = () => saveMutations(true);
const saveMutations = async (continueEditing = false) => {

  if (initialProductType.value == null) {
    Toast.error(t('properties.rule.error.noProductType'));
    return
  }

  const hasOptionalInConfigurator = updatedAddedProperties.value.some(property => property.configType === ConfigTypes.OPTIONAL_IN_CONFIGURATOR);
  const hasRequiredInConfigurator = updatedAddedProperties.value.some(property => property.configType === ConfigTypes.REQUIRED_IN_CONFIGURATOR);

  if (hasOptionalInConfigurator && !hasRequiredInConfigurator) {
    Toast.error(t('properties.rule.error.optionalWithoutRequired'));
    return;
  }

  const success = await updateOrCreateItems();

  if (!success) {
    Toast.error(t('shared.alert.toast.unexpectedResult'));
    return;
  }

  Toast.success(t('properties.rule.alert.updateSuccess'))
  if (continueEditing) {
    fetchData();
    return
  }

  router.push({name: 'properties.rule.list'});

};

const handleAddedProperties = (addedProperties: Property[]) => {
  updatedAddedProperties.value = addedProperties;
}

const handleRequireEanCodeUpdated = (newVal: boolean) => {
  requireEanCode.value = newVal;
}

const handleDelete = () => {
   router.push({name: 'properties.rule.list'});
}

onMounted(fetchData);

</script>

<template>
    <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'properties.rule.list' }, name: t('properties.rule.title') },
                   { path: { name: 'properties.rule.edit' }, name: t('properties.rule.edit.title') }]" />
    </template>

    <template v-slot:content>
      <Card class="mt-2 p-4">
        <Loader :loading="loading" />
        <ProductPropertiesConfigurator
            v-if="initialProductType"
            :added-properties="initialItems"
            :product-type="initialProductType"
            :require-ean-code="requireEanCode"
            @update:added-properties="handleAddedProperties"
            @update:require-ean-code="handleRequireEanCodeUpdated"
             />

        <div class="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 py-4 sm:px-8">
          <CancelButton @click="() => router.push({ name: 'properties.rule.list' })">
            {{ t('shared.button.cancel') }}
          </CancelButton>
          <Link :path="{ name: 'properties.rule.show', params: { id: route.params.id } }">
            <Button type="button" class="button rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm btn-info ">
              {{ t('shared.button.show') }}
            </Button>
          </Link>
          <ApolloAlertMutation :mutation="deleteProductPropertiesRuleMutation" :mutation-variables="{ id: id.toString() }" @done="handleDelete">
            <template v-slot="{ loading, confirmAndMutate }">
              <DangerButton ref="deleteButtonRef" :disabled="loading" @click="confirmAndMutate">{{ t('shared.button.delete') }}</DangerButton>
            </template>
          </ApolloAlertMutation>
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