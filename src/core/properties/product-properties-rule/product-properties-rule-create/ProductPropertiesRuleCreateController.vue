<script setup lang="ts">

import {useI18n} from 'vue-i18n';
import {Breadcrumbs} from "../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import {useRoute, useRouter} from "vue-router";
import {Ref, ref} from "vue";
import {ProductPropertiesConfigurator} from "../../../../shared/components/organisms/product-properties-configurator";
import {Card} from "../../../../shared/components/atoms/card";
import {CancelButton} from "../../../../shared/components/atoms/button-cancel";
import {PrimaryButton} from "../../../../shared/components/atoms/button-primary";
import {SecondaryButton} from "../../../../shared/components/atoms/button-secondary";
import {Property} from "../../../../shared/components/organisms/product-properties-configurator/ProductPropertiesConfigurator.vue";
import {Toast} from "../../../../shared/modules/toast";
import apolloClient from "../../../../../apollo-client";
import {processGraphQLErrors} from "../../../../shared/utils";
import {
  createProductPropertiesRuleItemMutation,
  createProductPropertiesRuleItemsMutation,
  createProductPropertiesRuleMutation
} from "../../../../shared/api/mutations/properties.js";
import {RuleItem} from "../configs";
import { productPropertiesRulesQuery } from "../../../../shared/api/queries/properties.js";
import {ConfigTpes} from "../../../../shared/utils/constants";

const router = useRouter();
const { t } = useI18n();
const updatedProductType = ref(null);
const updatedAddedProperties: Ref<Property[]> = ref([]);

const handleSave = () => saveMutations(false);
const handleSaveAndContinue = () => saveMutations(true);
const saveMutations = async (continueEditing = false) => {

  if (updatedProductType.value == null) {
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

  const ruleId = await createRule();
  if (ruleId == null) {
    Toast.error(t('shared.alert.toast.unexpectedResult'));
    return
  }

  const created = await createItems(ruleId);

  if (created == null) {
    return
  }
  if (!created) {
    Toast.error(t('shared.alert.toast.unexpectedResult'));
    return
  }

  Toast.success(t('properties.rule.alert.createSuccess'))
  if (continueEditing) {
    router.push({name: 'properties.rule.edit', params: {id: ruleId }});
    return
  }

  router.push({name: 'properties.rule.list'});

};

const createItems = async (ruleId) => {

  const variables: RuleItem[] = [];
  updatedAddedProperties.value.forEach(property => {
    variables.push({
      rule: {
        id: ruleId
      },
      property: {
        id: property.id
      },
      type: property.configType,
      sortOrder: property.sortOrder
    });
  });

  try {
      const { data } = await apolloClient.mutate({ mutation: createProductPropertiesRuleItemsMutation, variables: {data: variables} });
      const responseData = data['createProductPropertiesRuleItems'];
      if (responseData) {
        return true;
      }

    } catch (err) {
      console.log(err);
    }
    return false;
}

const getRule = async () => {

  if (updatedProductType.value == null) {
    return null
  }


  const { data } = await apolloClient.query({
      query: productPropertiesRulesQuery,
      fetchPolicy: 'network-only',
      variables: { filter: {productType: {id: {exact: updatedProductType.value }}}
  }});

  if (data && data.productPropertiesRules && data.productPropertiesRules.edges && data.productPropertiesRules.edges.length == 1) {
    return data.productPropertiesRules.edges[0].node.id;
  }

  return null;
}

const createRule = async () => {
  const id = await getRule();

  if (id !== null) {
    return id;
  }

  try {
      const inputData = {productType: { id: updatedProductType.value }}
      const { data } = await apolloClient.mutate({ mutation: createProductPropertiesRuleMutation, variables: {data: inputData } });
      const responseData = data['createProductPropertiesRule'];
      return responseData['id'];

    } catch (err) {
      const validationErrors = processGraphQLErrors(err, t);
      const error: string | null = validationErrors['productType'] || validationErrors['__all__'] || null;
      if (error !== null) {
        Toast.error(error);
      }
    }
    return null;
}

const handleAddedProperties = (addedProperties: Property[]) => {
  updatedAddedProperties.value = addedProperties;
}

const handlePropertyType = (propertyType) => {
  updatedProductType.value = propertyType;
}

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
      <ProductPropertiesConfigurator
          :added-properties="[]"
          :product-type="null"
          @update:added-properties="handleAddedProperties"
          @update:product-type="handlePropertyType" />

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