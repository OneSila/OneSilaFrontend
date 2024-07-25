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
import {ConfigTpes} from "../../../../shared/utils/constants";
import apolloClient from "../../../../../apollo-client";
import { getProductPropertiesRuleQuery } from "../../../../shared/api/queries/properties.js";
import {
  createProductPropertiesRuleItemsMutation,
  deleteProductPropertiesRuleItemMutation, deleteProductPropertiesRuleMutation,
  updateProductPropertiesRuleItemMutation
} from "../../../../shared/api/mutations/properties.js";
import {DangerButton} from "../../../../shared/components/atoms/button-danger";
import {FormType} from "../../../../shared/components/organisms/general-form/formConfig";
import {ApolloAlertMutation} from "../../../../shared/components/molecules/apollo-alert-mutation";
import {Property} from "../../../../shared/components/organisms/product-properties-configurator/ProductPropertiesConfigurator.vue";
import {Loader} from "../../../../shared/components/atoms/loader";

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

const updateOrCreateItems = async () => {
  try {
    const updates: any = [];
    const creations: any = [];
    const deletions: any = [];

    const updatedPropertyIds = new Set(updatedAddedProperties.value.map(property => property.id));

    for (const propertyId in propertiesItemsMap.value) {
      if (!updatedPropertyIds.has(propertyId)) {
        deletions.push(propertiesItemsMap.value[propertyId].id);
      }
    }

    updatedAddedProperties.value.forEach(property => {
    const existingItem = propertiesItemsMap.value[property.id];

      if (existingItem) {
        if (existingItem.type !== property.configType || existingItem.sortOrder != property.sortOrder) {

          updates.push({
            id: existingItem.id,
            type: property.configType,
            sortOrder: property.sortOrder
          });
        }
      } else {
        creations.push({
          rule: { id: id.value.toString() },
          property: { id: property.id },
          type: property.configType,
          sortOrder: property.sortOrder
        });
      }
    });

    if (updates.length > 0) {
      const updatePromises = updates.map(update => apolloClient.mutate({
        mutation: updateProductPropertiesRuleItemMutation,
        variables: { data: update }
      }));
      await Promise.all(updatePromises);
    }

    if (creations.length > 0) {
      await apolloClient.mutate({
        mutation: createProductPropertiesRuleItemsMutation,
        variables: { data: creations }
      });
    }

    if (deletions.length > 0) {
      const deletePromises = deletions.map(deleteId => apolloClient.mutate({
        mutation: deleteProductPropertiesRuleItemMutation,
        variables: { id: deleteId }
      }));
      await Promise.all(deletePromises);
    }

    return true;
  } catch (err) {
    console.log(err);
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

  if (updatedAddedProperties.value.length == 0) {
    Toast.error(t('properties.rule.error.noAddedProperties'));
    return
  }

  const hasOptionalInConfigurator = updatedAddedProperties.value.some(property => property.configType === ConfigTpes.OPTIONAL_IN_CONFIGURATOR);
  const hasRequiredInConfigurator = updatedAddedProperties.value.some(property => property.configType === ConfigTpes.REQUIRED_IN_CONFIGURATOR);

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
            @update:added-properties="handleAddedProperties"
              />

        <div class="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 py-4 sm:px-8">
          <CancelButton @click="() => router.push({name: 'properties.rule.list'})">
            {{ t('shared.button.cancel') }}
          </CancelButton>
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